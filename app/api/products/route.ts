import { NextRequest, NextResponse } from 'next/server';
import { dbProducts } from '@/lib/db';
import { Product } from '@/src/types';

export async function GET() {
  try {
    const products = await dbProducts.getAll();
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
      },
    });
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
  } catch (error: any) {
    console.error('Error creating product:', error);
    const message = error?.message || 'Failed to create product';
    const status = message.includes('Maximum') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
