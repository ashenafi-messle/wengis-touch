import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', brand: "Wengi's Touch" });
}
