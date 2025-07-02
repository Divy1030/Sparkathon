import { NextRequest, NextResponse } from 'next/server';
import endpoints from '@/lib/api';
import "server-only";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const supplierId = searchParams.get('supplierId');
    const productId = searchParams.get('productId');

    // Build query string
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (supplierId) queryParams.append('supplierId', supplierId);
    if (productId) queryParams.append('productId', productId);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${endpoints.defectReport.getAnalytics}?${queryString}` : endpoints.defectReport.getAnalytics;

    // Get token from cookies or authorization header
    const token = request.cookies.get('accessToken')?.value || 
                 request.headers.get('Authorization')?.replace('Bearer ', '') ||
                 request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.headers.get('x-access-token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Call backend API
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: "no-store",
    });

    // Check content type before trying to parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse);
      return NextResponse.json(
        { success: false, message: 'Backend returned non-JSON response', details: textResponse.substring(0, 500) },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("Get defect analytics response:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to fetch defect analytics',
          details: data
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Defect analytics fetched successfully',
      data: data.data || data
    });
  } catch (error) {
    console.error('Get defect analytics error details:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
