import { NextRequest, NextResponse } from 'next/server';
import { dbOrders, dbProducts } from '@/lib/db';
import { query } from '@/lib/neon';
import { generateTelegramOrderToken } from '@/lib/telegram';
import { OrderItem } from '@/src/types';

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

    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      deliveryPreference,
      paymentMethod,
      specialNotes,
      items,
    } = body;

    // 1. Basic field validation
    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ error: 'Customer name is required.' }, { status: 400 });
    }
    if (!customerPhone || !customerPhone.trim()) {
      return NextResponse.json({ error: 'Customer phone number is required.' }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one product.' }, { status: 400 });
    }

    // 2. Fetch products directly from Neon PostgreSQL database (Source of Truth)
    const productIds: string[] = items.map((i: any) => String(i.productId));
    const dbProductsRes = await query(
      `SELECT id, title, price, available, images
       FROM products
       WHERE id = ANY($1::uuid[])`,
      [productIds]
    );

    const productMap = new Map<string, any>();
    for (const p of dbProductsRes.rows) {
      productMap.set(String(p.id), p);
    }

    // 3. Validate product existence, availability, and compute pricing from DB
    const verifiedItems: OrderItem[] = [];
    let calculatedTotal = 0;

    for (const requestedItem of items) {
      const pid = String(requestedItem.productId);
      const dbProd = productMap.get(pid);

      if (!dbProd) {
        return NextResponse.json(
          { error: `A product in your cart (ID: ${pid}) is no longer available in our catalog.` },
          { status: 400 }
        );
      }

      if (!dbProd.available) {
        return NextResponse.json(
          { error: `"${dbProd.title}" is currently out of stock. Please remove it from your cart.` },
          { status: 400 }
        );
      }

      const qty = parseInt(String(requestedItem.quantity), 10);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for product "${dbProd.title}". Quantity must be at least 1.` },
          { status: 400 }
        );
      }

      // Use strictly the database price, ignoring any user-submitted price
      const unitPrice = Number(dbProd.price);
      calculatedTotal += unitPrice * qty;

      const productImage = (Array.isArray(dbProd.images) && dbProd.images[0]) || '';

      verifiedItems.push({
        productId: String(dbProd.id),
        productTitle: dbProd.title,
        productImage,
        color: requestedItem.color ? String(requestedItem.color).trim() : '',
        quantity: qty,
        price: unitPrice,
      });
    }

    // 4. Generate unique order reference (e.g. WT-YYYYMMDD-XXXX)
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderRef = `WT-${datePrefix}-${randomSuffix}`;

    // 5. Persist order to Neon PostgreSQL
    const newOrder = await dbOrders.add({
      orderRef,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : `${customerName.trim().toLowerCase().replace(/\s+/g, '')}@customer.com`,
      shippingAddress: shippingAddress ? shippingAddress.trim() : `Contact Phone: ${customerPhone.trim()}`,
      deliveryPreference: deliveryPreference || 'Standard',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      specialNotes: specialNotes ? specialNotes.trim() : '',
      items: verifiedItems,
      totalAmount: calculatedTotal,
      status: 'Pending',
    });

    // 6. Generate secure, single-use Telegram order token and deep-links
    // Note: The notification is sent when the customer opens the bot and clicks START!
    let telegramDeepLink = '';
    let telegramAppDeepLink = '';
    let telegramToken = '';
    try {
      const tokenResult = await generateTelegramOrderToken(newOrder.id);
      telegramDeepLink = tokenResult.deepLink;
      telegramAppDeepLink = tokenResult.appDeepLink;
      telegramToken = tokenResult.rawToken;
    } catch (tokenErr) {
      console.error('Error generating Telegram order token:', tokenErr);
    }

    return NextResponse.json(
      {
        ...newOrder,
        telegramDeepLink,
        telegramAppDeepLink,
        telegramToken,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to place order. Please try again.' },
      { status: 500 }
    );
  }
}
