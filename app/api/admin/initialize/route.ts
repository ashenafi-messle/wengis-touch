import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;
    
    if (!password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Password is required' 
      }, { status: 400 });
    }
    
    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }
    
    // Initialize admin password in Supabase
    await dbAdmin.initializeAdminPassword(password);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin password initialized successfully' 
    });
  } catch (error) {
    console.error('Error during admin initialization:', error);
    return NextResponse.json({ success: false, message: 'Initialization failed' }, { status: 500 });
  }
}