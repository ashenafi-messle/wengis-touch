import { NextRequest, NextResponse } from 'next/server';
import { dbOrders } from '@/lib/db';
import { Order } from '@/src/types';

export async function GET() {
  try {
    const orders = await dbOrders.getAll();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrder = await dbOrders.add(body);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
