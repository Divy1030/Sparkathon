import { NextRequest, NextResponse } from 'next/server';
import endpoints from '@/lib/api';
import "server-only";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call backend API
    const response = await fetch(endpoints.user.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.log("User login response:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Login failed',
          details: data
        },
        { status: response.status }
      );
    }

    // Create response and set cookies if login successful
    const nextResponse = NextResponse.json({
      success: true,
      message: data.message || 'Login successful',
      data: data.data || data
    });

    // Set access token in httpOnly cookie if provided
    if (data.accessToken) {
      nextResponse.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('User login error details:', error);
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
