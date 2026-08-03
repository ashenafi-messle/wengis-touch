import { NextRequest, NextResponse } from 'next/server';
import { dbMessages } from '@/lib/db';
import { Message } from '@/src/types';

export async function GET() {
  try {
    const messages = await dbMessages.getAll();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newMessage = await dbMessages.add(body);
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
