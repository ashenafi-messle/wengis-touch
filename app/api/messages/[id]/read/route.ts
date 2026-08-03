import { NextRequest, NextResponse } from 'next/server';
import { dbMessages } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const read = body.read !== undefined ? body.read : true;
    const updated = await dbMessages.toggleRead(id, read);
    
    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating message read status:', error);
    return NextResponse.json({ error: 'Failed to update message read status' }, { status: 500 });
  }
}
