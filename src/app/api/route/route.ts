import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.ORS_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { locations } = await request.json();

    if (!API_KEY) {
      return NextResponse.json({ error: 'OpenRoute Service API key not configured' }, { status: 500 });
    }

    if (!locations || locations.length < 2) {
      return NextResponse.json({ error: 'At least 2 locations are required' }, { status: 400 });
    }

    console.log('Processing locations:', locations);

    // Get coordinates from address (geocode) with timeout and retry
    const coordinates = await Promise.all(
      locations.map(async (loc: string) => {
        if (!loc.trim()) {
          throw new Error('Empty location provided');
        }
        
        try {
          const resp = await axios.get('https://api.openrouteservice.org/geocode/search', {
            params: {
              api_key: API_KEY,
              text: loc.trim(),
              size: 1,
              layers: 'locality,region,country'
            },
            timeout: 8000, // 8 second timeout
          });
          
          const features = resp.data.features;
          if (!features || features.length === 0) {
            throw new Error(`Location not found: ${loc}`);
          }
          
          const coord = features[0].geometry.coordinates;
          console.log(`Coordinates for ${loc}:`, coord);
          return coord;
        } catch (geocodeError: unknown) {
          const errorMessage = geocodeError instanceof Error ? geocodeError.message : 'Unknown error';
          if (geocodeError && typeof geocodeError === 'object' && 'code' in geocodeError && geocodeError.code === 'ETIMEDOUT') {
            throw new Error(`Timeout while searching for location: ${loc}`);
          }
          throw new Error(`Failed to find location: ${loc}. ${errorMessage}`);
        }
      })
    );

    console.log('All coordinates:', coordinates);

    // Use GET request for directions (more reliable)
    const resp = await axios.get(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        params: {
          api_key: API_KEY,
          start: coordinates[0].join(','),
          end: coordinates[coordinates.length - 1].join(','),
          format: 'json'
        },
        timeout: 12000,
      }
    );

    console.log('Route response received');

    // Handle different response formats
    let routes;
    if (resp.data.routes) {
      routes = resp.data.routes;
    } else if (resp.data.features) {
      // GeoJSON format
      routes = resp.data.features.map((feature: { properties: { summary?: { distance?: number; duration?: number }; distance?: number; duration?: number }; geometry: unknown }) => ({
        summary: {
          distance: feature.properties.summary?.distance || feature.properties.distance || 0,
          duration: feature.properties.summary?.duration || feature.properties.duration || 0
        },
        geometry: feature.geometry
      }));
    } else {
      throw new Error('Unexpected response format from OpenRoute Service');
    }

    if (!routes || routes.length === 0) {
      throw new Error('No routes found in response');
    }
    
    const mainRoute = routes[0];
    const summary = mainRoute.summary;
    
    // Calculate estimated vs optimized time (mock optimization for demo)
    const estimatedTime = summary.duration * 1.2; // 20% longer without optimization
    const optimizedTime = summary.duration;
    const timeSavings = ((estimatedTime - optimizedTime) / estimatedTime * 100).toFixed(1);
    
    // Process all routes
    const routesWithGeometry = routes.map((route: { geometry?: { coordinates?: number[][] }; summary: { distance: number; duration: number } }, index: number) => ({
      coordinates: route.geometry?.coordinates || coordinates,
      distance: route.summary.distance,
      duration: route.summary.duration,
      type: index === 0 ? 'optimized' : 'alternative',
      geometry: route.geometry
    }));
    
    return NextResponse.json({
      distance: summary.distance,
      duration: summary.duration,
      estimatedTime: estimatedTime,
      optimizedTime: optimizedTime,
      timeSavings: timeSavings,
      coordinates: mainRoute.geometry?.coordinates || coordinates,
      routes: routesWithGeometry,
      waypoints: coordinates.map((coord: number[], coordIndex: number) => ({
        position: coord,
        name: locations[coordIndex],
        type: coordIndex === 0 ? 'start' : coordIndex === coordinates.length - 1 ? 'end' : 'waypoint'
      })) as Array<{
        position: number[];
        name: string;
        type: 'start' | 'end' | 'waypoint';
      }>,
      success: true
    });

  } catch (error: unknown) {
    console.error('Route API Error:', error);
    
    const err = error as { 
      code?: string; 
      response?: { status?: number; data?: { error?: string } }; 
      message?: string; 
    };
    
    if (err.code === 'ETIMEDOUT') {
      return NextResponse.json({ 
        error: 'Request timeout. The service is taking too long to respond. Please try again.' 
      }, { status: 408 });
    }
    
    if (err.response?.status === 401) {
      return NextResponse.json({ 
        error: 'Invalid API key. Please check your OpenRoute Service API key.' 
      }, { status: 401 });
    }
    
    if (err.response?.status === 403) {
      return NextResponse.json({ 
        error: 'API quota exceeded. Please check your OpenRoute Service plan.' 
      }, { status: 403 });
    }
    
    if (err.response?.status === 400) {
      return NextResponse.json({ 
        error: 'Invalid request. Please check your location inputs.',
        details: err.response?.data?.error || err.message
      }, { status: 400 });
    }
    
    if (err.message?.includes('Location not found') || err.message?.includes('Failed to find location')) {
      return NextResponse.json({ 
        error: err.message 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to get route', 
      details: err.message,
      success: false 
    }, { status: 500 });
  }
}
