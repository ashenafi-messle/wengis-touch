import crypto from 'crypto';
import { query } from './neon.ts';
import type { Order, OrderItem } from '../src/types';

// Configuration
export function getTelegramConfig() {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || 'WengisTouchBot',
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '',
    adminUsername: process.env.TELEGRAM_ADMIN_USERNAME || 'wengi67',
    expiryMinutes: parseInt(process.env.TELEGRAM_ORDER_TOKEN_EXPIRY_MINUTES || '30', 10),
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
    websiteUrl: process.env.WEBSITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://wengis-touch.vercel.app',
  };
}

export function isTelegramConfigured(): boolean {
  const config = getTelegramConfig();
  return Boolean(config.botToken && config.adminChatId);
}

function escapeHtml(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate a cryptographically secure, single-use Telegram order token.
 * Uses 32 hexadecimal characters (128-bit cryptographic random entropy),
 * which safely stays well under Telegram's 64-character limit to prevent
 * truncation or parsing corruption across Telegram Web clients.
 * Stores the SHA-256 hash in Neon PostgreSQL and returns the raw token and deep-link URLs.
 */
export async function generateTelegramOrderToken(orderId: string): Promise<{
  rawToken: string;
  deepLink: string;
  appDeepLink: string;
  expiresAt: Date;
}> {
  const config = getTelegramConfig();
  // 16 bytes = 32 hexadecimal characters (128-bit entropy, strictly within Telegram's 64-character limit)
  const rawToken = crypto.randomBytes(16).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiryMinutes = config.expiryMinutes > 0 ? config.expiryMinutes : 30;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Store hashed token in Neon PostgreSQL
  await query(
    `INSERT INTO telegram_order_tokens (order_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [orderId, tokenHash, expiresAt]
  );

  const cleanBotUsername = config.botUsername.replace(/^@/, '');
  // Standard web deep-link (works in desktop, mobile browsers, and Telegram Web)
  const deepLink = `https://t.me/${cleanBotUsername}?start=${rawToken}`;
  // Direct client app protocol deep-link (bypasses browser parameter dropping in Telegram apps)
  const appDeepLink = `tg://resolve?domain=${cleanBotUsername}&start=${rawToken}`;

  return {
    rawToken,
    deepLink,
    appDeepLink,
    expiresAt,
  };
}

/**
 * Splits text into chunks respecting newline boundaries, within Telegram's 4096 character limit.
 */
export function splitTelegramMessage(text: string, maxLength = 4000): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  const lines = text.split('\n');
  let currentChunk = '';

  for (const line of lines) {
    if ((currentChunk + '\n' + line).length > maxLength) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = line;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n' + line : line;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxLength)];
}

/**
 * Sends a message via the official Telegram Bot API with optional inline keyboard.
 * Automatically splits messages exceeding Telegram's 4096-character limit.
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML',
  replyMarkup?: any
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  const { botToken } = getTelegramConfig();

  if (!botToken) {
    console.warn('⚠️ Telegram botToken is not configured in .env');
    return { success: false, skipped: true, error: 'TELEGRAM_BOT_TOKEN not configured.' };
  }

  // Split message if text exceeds safe length
  const chunks = splitTelegramMessage(text);

  try {
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    for (let i = 0; i < chunks.length; i++) {
      const isLastChunk = i === chunks.length - 1;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const payload: any = {
        chat_id: chatId,
        text: chunks[i],
        parse_mode: parseMode,
        disable_web_page_preview: true,
      };

      // Only attach interactive keyboard to the final chunk
      if (isLastChunk && replyMarkup) {
        payload.reply_markup = replyMarkup;
      }

      const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errBody = await response.text();
        console.error('Telegram Bot API error:', response.status, errBody);
        return { success: false, error: `Telegram Bot API error HTTP ${response.status}: ${errBody}` };
      }

      const data = await response.json();
      if (!data.ok) {
        console.error('Telegram Bot API response reported not ok:', data);
        return { success: false, error: data.description || 'Telegram API returned ok: false' };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Network error communicating with Telegram:', err?.message || err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Builds the complete order message to be forwarded to @wengi67 / admin chat.
 */
export function formatTelegramOrderMessage(order: {
  orderRef?: string;
  id?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: string;
  deliveryPreference?: string;
  paymentMethod?: string;
  specialNotes?: string;
  totalAmount: number;
  status?: string;
  createdAt?: string;
  items?: OrderItem[];
}): string {
  const config = getTelegramConfig();
  const orderRef = order.orderRef || (order.id ? `ORD-${order.id.slice(0, 8)}` : 'WT-NEW');
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  let itemsText = '';
  if (order.items && order.items.length > 0) {
    itemsText = order.items
      .map((item, index) => {
        const itemTotal = (Number(item.price) * Number(item.quantity)).toFixed(2);
        const colorText = item.color ? `\n   Color: <b>${escapeHtml(item.color)}</b>` : '';
        return (
          `<b>${index + 1}. ${escapeHtml(item.productTitle)}</b>\n` +
          `   Quantity: <b>${item.quantity}</b>\n` +
          `   Unit Price: <b>${Number(item.price).toFixed(2)} ETB</b>\n` +
          `   Subtotal: <b>${itemTotal} ETB</b>` +
          colorText
        );
      })
      .join('\n\n');
  } else {
    itemsText = '<i>No line items listed</i>';
  }

  return [
    `🛍 <b>WENGI'S TOUCH — NEW ORDER</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>Order ID:</b> <code>#${escapeHtml(orderRef)}</code>`,
    `<b>Date:</b> ${escapeHtml(formattedDate)}`,
    ``,
    `👤 <b>CUSTOMER INFORMATION</b>`,
    `• <b>Name:</b> ${escapeHtml(order.customerName)}`,
    `• <b>Phone:</b> <code>${escapeHtml(order.customerPhone)}</code>`,
    order.customerEmail ? `• <b>Email:</b> ${escapeHtml(order.customerEmail)}` : null,
    ``,
    `📍 <b>DELIVERY INFORMATION</b>`,
    `• <b>Address:</b> ${escapeHtml(order.shippingAddress || 'Not specified')}`,
    `• <b>Delivery Preference:</b> ${escapeHtml(order.deliveryPreference || 'Standard')}`,
    ``,
    `🛒 <b>ORDERED PRODUCTS</b>`,
    itemsText,
    ``,
    `💰 <b>ORDER SUMMARY</b>`,
    `• <b>Subtotal:</b> ${Number(order.totalAmount).toFixed(2)} ETB`,
    `• <b>Delivery Fee:</b> 0.00 ETB`,
    `• <b>Discount:</b> 0.00 ETB`,
    `• <b>TOTAL:</b> <b>${Number(order.totalAmount).toFixed(2)} ETB</b>`,
    ``,
    `💳 <b>PAYMENT</b>`,
    `• <b>Payment Method:</b> ${escapeHtml(order.paymentMethod || 'Cash on Delivery')}`,
    `• <b>Payment Status:</b> ${escapeHtml(order.status || 'Pending')}`,
    order.specialNotes ? `\n📝 <b>Special Notes:</b>\n${escapeHtml(order.specialNotes)}` : null,
    ``,
    `📦 <b>ORDER STATUS</b>`,
    `<b>New Order (Confirmed via Telegram)</b>`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<i>Admin Destination: @${escapeHtml(config.adminUsername)}</i>`,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/**
 * Handles `/start` received without a token.
 * Explains that Telegram Web or browser may not have forwarded the token,
 * provides guidance and an inline keyboard button to return to the website.
 */
export async function handleTelegramStartWithoutToken(
  customerChatId: string | number
): Promise<{ success: boolean; message: string }> {
  const config = getTelegramConfig();

  const text = [
    `🧶 <b>Welcome to Wengi's Touch!</b>`,
    ``,
    `If you just placed an order on our website:`,
    `<b>Telegram Web</b> in browser tabs can sometimes drop the order token when opening.`,
    ``,
    `👉 <b>To complete your order confirmation:</b>`,
    `1. Return to the Wengi's Touch website checkout.`,
    `2. Click <b>"Open in Telegram Bot"</b> again, or choose <b>"Open in Telegram App"</b> (Desktop / Mobile).`,
    `3. When Telegram opens, tap <b>START</b> to submit your order automatically!`,
    ``,
    `<i>If you haven't placed an order yet, visit our shop to explore our handmade crochet collection!</i>`,
  ].join('\n');

  const replyMarkup = config.websiteUrl
    ? {
        inline_keyboard: [
          [
            {
              text: "🌐 Return to Wengi's Touch Website",
              url: config.websiteUrl,
            },
          ],
        ],
      }
    : undefined;

  await sendTelegramMessage(customerChatId, text, 'HTML', replyMarkup);
  return { success: true, message: 'Sent start guidance without token.' };
}

/**
 * Handles incoming `/start TOKEN` command from the Telegram bot.
 * Validates token, looks up associated order, sends complete order to @wengi67,
 * marks token as used, and sends confirmation back to the customer.
 */
export async function processTelegramStartToken(
  rawToken: string,
  customerChatId: string | number
): Promise<{ success: boolean; message: string }> {
  const config = getTelegramConfig();

  const returnMarkup = config.websiteUrl
    ? {
        inline_keyboard: [
          [
            {
              text: "🌐 Return to Wengi's Touch Website",
              url: config.websiteUrl,
            },
          ],
        ],
      }
    : undefined;

  // Validate token format (safe alphanumeric string between 16 and 64 characters)
  const tokenClean = typeof rawToken === 'string' ? rawToken.trim() : '';
  if (!tokenClean || !/^[A-Za-z0-9_-]{16,64}$/.test(tokenClean)) {
    await sendTelegramMessage(
      customerChatId,
      `⚠️ <b>Invalid Order Link</b>\n\n` +
      `This order link format is invalid or has been truncated by your browser.\n\n` +
      `Please return to Wengi's Touch and try clicking the link again.`,
      'HTML',
      returnMarkup
    );
    return { success: false, message: 'Invalid token format.' };
  }

  const tokenHash = crypto.createHash('sha256').update(tokenClean).digest('hex');

  // 1. Look up token and associated order
  const tokenRes = await query(
    `SELECT t.id, t.order_id, t.expires_at, t.used_at,
            o.id as o_id, o.order_ref, o.customer_name, o.customer_phone, o.customer_email,
            o.shipping_address, o.delivery_preference, o.payment_method, o.special_notes,
            o.total_amount, o.status, o.created_at
     FROM telegram_order_tokens t
     JOIN orders o ON o.id = t.order_id
     WHERE t.token_hash = $1
     LIMIT 1`,
    [tokenHash]
  );

  if (tokenRes.rows.length === 0) {
    await sendTelegramMessage(
      customerChatId,
      `⚠️ <b>Order Link Not Found</b>\n\n` +
      `We could not find an active order matching this link.\n\n` +
      `Please return to Wengi's Touch and try again.`,
      'HTML',
      returnMarkup
    );
    return { success: false, message: 'Token not found.' };
  }

  const tokenRecord = tokenRes.rows[0];

  // 2. Check if token has already been used
  if (tokenRecord.used_at) {
    const orderDisplayId = tokenRecord.order_ref || `ORD-${String(tokenRecord.order_id).slice(0, 8)}`;
    await sendTelegramMessage(
      customerChatId,
      `ℹ️ <b>Order Already Confirmed</b>\n\n` +
      `Order <b>#${escapeHtml(orderDisplayId)}</b> has already been submitted through Telegram.\n\n` +
      `We are preparing your items! Thank you for your order! 🧶`,
      'HTML',
      returnMarkup
    );
    return { success: false, message: 'Token already used.' };
  }

  // 3. Check if token is expired
  if (new Date(tokenRecord.expires_at) < new Date()) {
    await sendTelegramMessage(
      customerChatId,
      `⏰ <b>Order Link Expired</b>\n\n` +
      `This order link has expired (valid for ${config.expiryMinutes} minutes).\n\n` +
      `Please return to Wengi's Touch and place your order again.`,
      'HTML',
      returnMarkup
    );
    return { success: false, message: 'Token expired.' };
  }

  // 4. Retrieve ordered items
  const itemsRes = await query(
    `SELECT product_id, product_title, product_image, color, quantity, price
     FROM order_items
     WHERE order_id = $1`,
    [tokenRecord.order_id]
  );

  const orderData = {
    id: String(tokenRecord.order_id),
    orderRef: tokenRecord.order_ref,
    customerName: tokenRecord.customer_name,
    customerPhone: tokenRecord.customer_phone,
    customerEmail: tokenRecord.customer_email,
    shippingAddress: tokenRecord.shipping_address,
    deliveryPreference: tokenRecord.delivery_preference,
    paymentMethod: tokenRecord.payment_method,
    specialNotes: tokenRecord.special_notes,
    totalAmount: Number(tokenRecord.total_amount),
    status: tokenRecord.status,
    createdAt: tokenRecord.created_at ? new Date(tokenRecord.created_at).toISOString() : new Date().toISOString(),
    items: itemsRes.rows.map((row) => ({
      productId: row.product_id,
      productTitle: row.product_title,
      productImage: row.product_image,
      color: row.color,
      quantity: Number(row.quantity),
      price: Number(row.price),
    })),
  };

  // 5. Build complete order message
  const adminMessage = formatTelegramOrderMessage(orderData);

  // 6. Forward to @wengi67 / TELEGRAM_ADMIN_CHAT_ID
  const adminChatId = config.adminChatId;
  if (!adminChatId) {
    console.error('ERROR: TELEGRAM_ADMIN_CHAT_ID is not configured in .env');
    await query(
      `UPDATE orders SET telegram_notification_status = 'FAILED' WHERE id = $1`,
      [tokenRecord.order_id]
    );
    await sendTelegramMessage(
      customerChatId,
      'Your order was created successfully, but we could not complete the Telegram confirmation right now. Please try the Telegram link again.'
    );
    return { success: false, message: 'TELEGRAM_ADMIN_CHAT_ID not configured.' };
  }

  const sendResult = await sendTelegramMessage(adminChatId, adminMessage);

  if (!sendResult.success) {
    console.error('Failed to deliver order message to admin chat:', sendResult.error);
    await query(
      `UPDATE orders SET telegram_notification_status = 'FAILED' WHERE id = $1`,
      [tokenRecord.order_id]
    );
    // Allow retry: do NOT mark token as used!
    await sendTelegramMessage(
      customerChatId,
      'Your order was created successfully, but we could not complete the Telegram confirmation right now. Please try the Telegram link again.'
    );
    return { success: false, message: sendResult.error || 'Failed to dispatch to admin.' };
  }

  // 7. Mark token as used so it cannot be used again
  await query(
    `UPDATE telegram_order_tokens
     SET used_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [tokenRecord.id]
  );

  // 8. Update order notification status
  await query(
    `UPDATE orders
     SET telegram_notification_status = 'SENT'
     WHERE id = $1`,
    [tokenRecord.order_id]
  );

  // 9. Send success confirmation back to the customer
  const orderDisplayId = tokenRecord.order_ref || tokenRecord.order_id;
  await sendTelegramMessage(
    customerChatId,
    `✅ <b>Order received!</b>\n\n` +
    `Your order <b>#${escapeHtml(orderDisplayId)}</b> has been successfully submitted to Wengi's Touch.\n\n` +
    `Thank you for your order! 🧶`
  );

  console.log(`✓ Order #${orderDisplayId} successfully confirmed via Telegram token and sent to admin!`);
  return { success: true, message: 'Order submitted to admin and customer confirmed.' };
}

export async function sendTelegramOrderNotification(
  order: any
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  const config = getTelegramConfig();
  if (!config.adminChatId || !config.botToken) {
    return { success: false, skipped: true, error: 'Telegram credentials not configured.' };
  }
  const text = formatTelegramOrderMessage(order);
  return sendTelegramMessage(config.adminChatId, text);
}
