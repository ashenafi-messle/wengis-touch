import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'Current password and new password are required' 
      }, { status: 400 });
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      }, { status: 400 });
    }
    
    // Update password in Supabase
    const success = await dbAdmin.updatePassword(currentPassword, newPassword);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Password updated successfully' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Current password is incorrect' 
    }, { status: 400 });
  } catch (error) {
    console.error('Error during password reset:', error);
    return NextResponse.json({ success: false, message: 'Password reset failed' }, { status: 500 });
  }
}
