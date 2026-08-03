import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;
    
    if (!password) {
      return NextResponse.json({ success: false, message: 'Password is required' }, { status: 400 });
    }
    
    // Verify password against Supabase
    const isValid = await dbAdmin.verifyPassword(password);
    
    if (isValid) {
      return NextResponse.json({
        success: true,
        token: `wengi-session-${Date.now()}`,
        username: 'Admin Wengi'
      });
    }
    
    return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 500 });
  }
}
