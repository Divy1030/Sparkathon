import { NextRequest, NextResponse } from 'next/server';
import endpoints from '@/lib/api';
import "server-only";

export async function POST(request: NextRequest) {
  try {
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
    const response = await fetch(endpoints.user.logout, {
      method: 'POST',
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
    console.log("User logout response:", data);

    // Create response
    const successResponse = NextResponse.json({
      success: true,
      message: data.message || 'Logout successful',
      data: data.data || data
    });

    // Clear the accessToken cookie
    successResponse.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
    });

    return successResponse;
  } catch (error) {
    console.error('User logout error details:', error);
    
    // Even if there's an error, clear the cookie and return success
    const errorResponse = NextResponse.json(
      { 
        success: true, 
        message: 'Logged out successfully (session cleared)',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 200 }
    );

    // Clear the accessToken cookie
    errorResponse.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
    });

    return errorResponse;
  }
}
