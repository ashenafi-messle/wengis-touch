import { NextRequest, NextResponse } from 'next/server';
import { dbProducts } from '@/lib/db';
import { Product } from '@/src/types';

export async function GET() {
  try {
    const products = await dbProducts.getAll();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProduct = await dbProducts.add(body);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
