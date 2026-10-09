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
 * Validates that an image URL is a valid, publicly accessible HTTPS URL
 * and does not point to internal, private, loopback, or non-image resources.
 */
export function isValidProductImageUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (!trimmed.startsWith('https://')) return false;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;

    // Disallow credentials in URL
    if (parsed.username || parsed.password) return false;

    const hostname = parsed.hostname.toLowerCase();

    // Disallow localhost, loopback, internal domains
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.localhost')
    ) {
      return false;
    }

    // Disallow RFC 1918 private IPv4 ranges: 10.*, 192.168.*, 172.16-31.*, 169.254.*
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
    if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
    const m172 = hostname.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
    if (m172) {
      const second = parseInt(m172[1], 10);
      if (second >= 16 && second <= 31) return false;
    }

    // Must have at least one dot in hostname
    if (!hostname.includes('.')) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts the primary valid product image URL from either order item or catalog images.
 * Supports string URLs, JSON array strings, PostgreSQL text arrays, and objects.
 */
export function extractPrimaryProductImageUrl(
  itemImage?: any,
  catalogImages?: any
): string | null {
  const extractFromValue = (val: any): string | null => {
    if (!val) return null;

    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return null;

      // Handle JSON stringified arrays like '["https://..."]'
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          return extractFromValue(parsed);
        } catch {
          // fall through
        }
      }

      // Handle comma-separated URLs
      if (trimmed.includes(',') && !trimmed.startsWith('data:')) {
        const parts = trimmed.split(',');
        for (const part of parts) {
          const found = extractFromValue(part.trim());
          if (found) return found;
        }
      }

      if (isValidProductImageUrl(trimmed)) {
        return trimmed;
      }
      return null;
    }

    if (Array.isArray(val)) {
      for (const entry of val) {
        const found = extractFromValue(entry);
        if (found) return found;
      }
      return null;
    }

    if (typeof val === 'object' && val !== null) {
      if (val.url) return extractFromValue(val.url);
      if (val.secure_url) return extractFromValue(val.secure_url);
      if (val.src) return extractFromValue(val.src);
    }

    return null;
  };

  // 1. Direct item image from order_items
  const fromItem = extractFromValue(itemImage);
  if (fromItem) return fromItem;

  // 2. Catalog images from products table
  const fromCatalog = extractFromValue(catalogImages);
  if (fromCatalog) return fromCatalog;

  return null;
}

/**
 * Safely downloads an image buffer server-side with strict timeout,
 * content-type, and size limits to support fallback multipart photo upload.
 */
export async function fetchImageBufferSafely(
  imageUrl: string,
  maxSize = 10 * 1024 * 1024, // 10MB
  timeoutMs = 8000
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!isValidProductImageUrl(imageUrl)) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(imageUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'image/jpeg,image/png,image/webp,image/avif,*/*',
      },
    });

    if (!res.ok) {
      console.warn(`Failed to fetch image HTTP ${res.status} for fallback upload`);
      return null;
    }

    const rawContentType = res.headers.get('content-type') || 'image/jpeg';
    const cleanContentType = rawContentType.split(';')[0].trim().toLowerCase();
    if (!cleanContentType.startsWith('image/')) {
      console.warn(`Unexpected content-type ${cleanContentType} for image URL`);
      return null;
    }

    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      console.warn(`Image exceeds max size of ${maxSize} bytes`);
      return null;
    }

    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength > maxSize) {
      console.warn(`Image buffer exceeds max size of ${maxSize} bytes`);
      return null;
    }

    return {
      buffer: Buffer.from(arrayBuf),
      contentType: cleanContentType,
    };
  } catch (err: any) {
    console.warn('Error downloading image for fallback upload:', err?.message || err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Sends a single product photo to Telegram chat.
 * Tries direct HTTPS URL first; if Telegram fails to fetch it,
 * safely downloads server-side and uploads via multipart/form-data.
 */
export async function sendTelegramPhoto(
  chatId: string | number,
  photoUrl: string,
  caption?: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<{ success: boolean; error?: string }> {
  const { botToken } = getTelegramConfig();
  if (!botToken) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN not configured.' };
  }

  // 1. Try sending via direct HTTPS URL
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const payload: any = {
      chat_id: chatId,
      photo: photoUrl,
    };
    if (caption) {
      payload.caption = caption.slice(0, 1024);
      payload.parse_mode = parseMode;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.ok) {
        return { success: true };
      }
    }
  } catch (err: any) {
    console.warn('Direct URL sendPhoto attempt failed, attempting fallback multipart upload:', err?.message || err);
  }

  // 2. Fallback: Download server-side and upload via multipart/form-data
  try {
    const downloaded = await fetchImageBufferSafely(photoUrl);
    if (!downloaded) {
      return { success: false, error: 'Failed to download image server-side for fallback upload.' };
    }

    const formData = new FormData();
    formData.append('chat_id', String(chatId));
    if (caption) {
      formData.append('caption', caption.slice(0, 1024));
      formData.append('parse_mode', parseMode);
    }
    const ext = downloaded.contentType.includes('png')
      ? 'png'
      : downloaded.contentType.includes('webp')
      ? 'webp'
      : 'jpg';
    formData.append(
      'photo',
      new Blob([downloaded.buffer as unknown as BlobPart], { type: downloaded.contentType }),
      `product.${ext}`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const uploadRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return { success: false, error: `Telegram sendPhoto upload failed HTTP ${uploadRes.status}: ${errText}` };
    }

    const uploadData = await uploadRes.json();
    if (!uploadData.ok) {
      return { success: false, error: uploadData.description || 'Telegram sendPhoto upload returned ok: false' };
    }

    return { success: true };
  } catch (fallbackErr: any) {
    return { success: false, error: fallbackErr?.message || 'Multipart upload fallback failed.' };
  }
}

/**
 * Sends a media group (album) of photos to Telegram chat.
 * Used for orders containing 2 to 10 distinct product photos.
 */
export async function sendTelegramMediaGroup(
  chatId: string | number,
  media: Array<{ type: 'photo'; media: string; caption?: string; parse_mode?: string }>
): Promise<{ success: boolean; error?: string }> {
  const { botToken } = getTelegramConfig();
  if (!botToken) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN not configured.' };
  }

  if (media.length < 2 || media.length > 10) {
    return { success: false, error: 'Telegram sendMediaGroup requires between 2 and 10 items.' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        media,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Telegram sendMediaGroup failed HTTP ${response.status}: ${errText}` };
    }

    const data = await response.json();
    if (!data.ok) {
      return { success: false, error: data.description || 'Telegram sendMediaGroup returned ok: false' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during sendMediaGroup' };
  }
}

/**
 * Delivers product images for an order to the administrator Telegram chat.
 * Deduplicates identical products, formats item captions, groups multiple photos
 * into an album via sendMediaGroup, and falls back to sendPhoto individually if needed.
 * Updates orders.telegram_images_status without failing the order on image errors.
 */
export async function sendTelegramOrderImages(
  orderIdOrRef: string,
  orderRef: string,
  items: any[],
  adminChatId?: string | number
): Promise<{
  success: boolean;
  sentCount: number;
  failedCount: number;
  status: 'SENT' | 'PARTIAL' | 'FAILED' | 'NONE';
  error?: string;
}> {
  const config = getTelegramConfig();
  const targetChatId = adminChatId || config.adminChatId;

  if (!targetChatId || !config.botToken) {
    return { success: false, sentCount: 0, failedCount: 0, status: 'NONE', error: 'Credentials not configured' };
  }

  if (!items || items.length === 0) {
    return { success: true, sentCount: 0, failedCount: 0, status: 'NONE' };
  }

  // Deduplicate products with the same image and color (combining quantities)
  const processedItemsMap = new Map<
    string,
    {
      title: string;
      imageUrl: string;
      color?: string;
      quantity: number;
      price: number;
    }
  >();

  for (const item of items) {
    const rawImage = item.productImage || item.product_image;
    const catalogImages = item.catalog_images || item.images;
    const imageUrl = extractPrimaryProductImageUrl(rawImage, catalogImages);

    if (!imageUrl) continue;

    const title = item.productTitle || item.product_title || item.title || 'Product';
    const color = item.color ? String(item.color).trim() : '';
    const quantity = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;

    const dedupeKey = `${item.productId || item.product_id || title}::${color}::${imageUrl}`;

    if (processedItemsMap.has(dedupeKey)) {
      const existing = processedItemsMap.get(dedupeKey)!;
      existing.quantity += quantity;
    } else {
      processedItemsMap.set(dedupeKey, {
        title,
        imageUrl,
        color,
        quantity,
        price,
      });
    }
  }

  const itemsToSend = Array.from(processedItemsMap.values());

  if (itemsToSend.length === 0) {
    return { success: true, sentCount: 0, failedCount: 0, status: 'NONE' };
  }

  let sentCount = 0;
  let failedCount = 0;

  // Build clean, concise caption for each item
  const buildCaption = (it: typeof itemsToSend[0]) => {
    const colorPart = it.color ? `\n• Color: <b>${escapeHtml(it.color)}</b>` : '';
    return [
      `📸 <b>${escapeHtml(it.title)}</b>`,
      `• Order: <code>#${escapeHtml(orderRef)}</code>`,
      `• Quantity: <b>${it.quantity}</b>${colorPart}`,
      `• Unit Price: <b>${it.price.toFixed(2)} ETB</b>`,
    ].join('\n');
  };

  // If there are 2 to 10 items, attempt sendMediaGroup album first
  if (itemsToSend.length >= 2 && itemsToSend.length <= 10) {
    const mediaGroup = itemsToSend.map((it) => ({
      type: 'photo' as const,
      media: it.imageUrl,
      caption: buildCaption(it),
      parse_mode: 'HTML',
    }));

    const albumResult = await sendTelegramMediaGroup(targetChatId, mediaGroup);

    if (albumResult.success) {
      sentCount = itemsToSend.length;
    } else {
      console.warn('sendMediaGroup failed, falling back to individual sendPhoto for each item:', albumResult.error);
      // Fallback: send each item photo individually
      for (const it of itemsToSend) {
        const photoResult = await sendTelegramPhoto(targetChatId, it.imageUrl, buildCaption(it));
        if (photoResult.success) {
          sentCount++;
        } else {
          failedCount++;
          console.warn(`Failed to send image for ${it.title}:`, photoResult.error);
        }
      }
    }
  } else {
    // 1 item or >10 items: send individually
    for (const it of itemsToSend) {
      const photoResult = await sendTelegramPhoto(targetChatId, it.imageUrl, buildCaption(it));
      if (photoResult.success) {
        sentCount++;
      } else {
        failedCount++;
        console.warn(`Failed to send image for ${it.title}:`, photoResult.error);
      }
    }
  }

  let deliveryStatus: 'SENT' | 'PARTIAL' | 'FAILED' | 'NONE' = 'SENT';
  if (failedCount > 0 && sentCount > 0) {
    deliveryStatus = 'PARTIAL';
  } else if (failedCount > 0 && sentCount === 0) {
    deliveryStatus = 'FAILED';
  }

  // Update telegram_images_status in Neon DB
  try {
    await query(
      `UPDATE orders
       SET telegram_images_status = $1
       WHERE id::text = $2::text OR order_ref = $2`,
      [deliveryStatus, orderIdOrRef]
    );
  } catch (dbErr: any) {
    console.warn('Failed to update telegram_images_status in database (non-fatal):', dbErr?.message || dbErr);
  }

  return {
    success: sentCount > 0,
    sentCount,
    failedCount,
    status: deliveryStatus,
  };
}

/**
 * Helper to reply to customer chat ONLY.
 * Strictly guarantees that customer-facing responses (confirmations, welcome texts,
 * token errors, retry instructions, etc.) are NEVER delivered to TELEGRAM_ADMIN_CHAT_ID.
 */
export async function sendCustomerResponse(
  customerChatId: string | number | undefined | null,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML',
  replyMarkup?: any
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  const config = getTelegramConfig();
  // Never send customer-facing messages to the administrator chat or if chatId is missing
  if (!customerChatId || String(customerChatId) === String(config.adminChatId)) {
    return { success: true, skipped: true };
  }
  return sendTelegramMessage(customerChatId, text, parseMode, replyMarkup);
}

/**
 * Builds the complete order message to be forwarded to @wengi67 / admin chat.
 * Strictly formatted to match the required visual hierarchy, separator lines,
 * and dynamic order information without omitted or null fields.
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

  // 1. Header
  const lines: string[] = [
    `🛍 <b>WENGI'S TOUCH — NEW ORDER</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>Order ID:</b> <code>#${escapeHtml(orderRef)}</code>`,
    `<b>Date:</b> ${escapeHtml(formattedDate)}`,
    ``,
    `👤 <b>CUSTOMER INFORMATION</b>`,
    `• <b>Name:</b> ${escapeHtml(order.customerName)}`,
    `• <b>Phone:</b> <code>${escapeHtml(order.customerPhone)}</code>`,
  ];

  if (order.customerEmail && order.customerEmail.trim()) {
    lines.push(`• <b>Email:</b> ${escapeHtml(order.customerEmail.trim())}`);
  }

  // 2. Delivery Information
  lines.push(``);
  lines.push(`📍 <b>DELIVERY INFORMATION</b>`);
  if (order.shippingAddress && order.shippingAddress.trim()) {
    lines.push(`• <b>Address:</b> ${escapeHtml(order.shippingAddress.trim())}`);
  }
  if (order.deliveryPreference && order.deliveryPreference.trim()) {
    lines.push(`• <b>Delivery Preference:</b> ${escapeHtml(order.deliveryPreference.trim())}`);
  }

  // 3. Ordered Products
  lines.push(``);
  lines.push(`🛒 <b>ORDERED PRODUCTS</b>`);

  if (order.items && order.items.length > 0) {
    order.items.forEach((item, index) => {
      const unitPrice = Number(item.price);
      const qty = Number(item.quantity);
      const subtotal = (unitPrice * qty).toFixed(2);
      const colorPart = item.color && item.color.trim() ? `\nColor: <b>${escapeHtml(item.color.trim())}</b>` : '';

      lines.push(
        `<b>${index + 1}. ${escapeHtml(item.productTitle)}</b>\n` +
        `Quantity: <b>${qty}</b>\n` +
        `Unit Price: <b>${unitPrice.toFixed(2)} ETB</b>\n` +
        `Subtotal: <b>${subtotal} ETB</b>` +
        colorPart
      );
      if (index < order.items!.length - 1) {
        lines.push(``);
      }
    });
  } else {
    lines.push(`<i>No products listed</i>`);
  }

  // 4. Order Summary
  const subtotalAmount = Number(order.totalAmount).toFixed(2);
  lines.push(``);
  lines.push(`💰 <b>ORDER SUMMARY</b>`);
  lines.push(`• <b>Subtotal:</b> ${subtotalAmount} ETB`);
  lines.push(`• <b>Delivery Fee:</b> 0.00 ETB`);
  lines.push(`• <b>Discount:</b> 0.00 ETB`);
  lines.push(`• <b>TOTAL:</b> <b>${subtotalAmount} ETB</b>`);

  // 5. Payment
  lines.push(``);
  lines.push(`💳 <b>PAYMENT</b>`);
  lines.push(`• <b>Payment Method:</b> ${escapeHtml(order.paymentMethod || 'Cash on Delivery')}`);
  lines.push(`• <b>Payment Status:</b> ${escapeHtml(order.status || 'Pending')}`);

  // 6. Special Notes (only when present!)
  if (order.specialNotes && order.specialNotes.trim()) {
    lines.push(``);
    lines.push(`📝 <b>Special Notes:</b>\n${escapeHtml(order.specialNotes.trim())}`);
  }

  // 7. Order Status & Footer
  lines.push(``);
  lines.push(`📦 <b>ORDER STATUS</b>`);
  lines.push(`New Order (Confirmed via Telegram)`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`Admin Destination: @${escapeHtml(config.adminUsername || 'wengi67')}`);

  return lines.join('\n');
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

  // Strictly skip customer welcome / instructions if the chat is the administrator
  if (!customerChatId || String(customerChatId) === String(config.adminChatId)) {
    return { success: true, message: 'Skipped customer start guidance for admin destination.' };
  }

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

  await sendCustomerResponse(customerChatId, text, 'HTML', replyMarkup);
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
    await sendCustomerResponse(
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
    await sendCustomerResponse(
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
    await sendCustomerResponse(
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
    await sendCustomerResponse(
      customerChatId,
      `⏰ <b>Order Link Expired</b>\n\n` +
      `This order link has expired (valid for ${config.expiryMinutes} minutes).\n\n` +
      `Please return to Wengi's Touch and place your order again.`,
      'HTML',
      returnMarkup
    );
    return { success: false, message: 'Token expired.' };
  }

  // 4. Retrieve ordered items with product catalog images fallback
  const itemsRes = await query(
    `SELECT oi.product_id, oi.product_title, oi.product_image, oi.color, oi.quantity, oi.price,
            p.images as catalog_images
     FROM order_items oi
     LEFT JOIN products p ON p.id::text = oi.product_id::text
     WHERE oi.order_id = $1`,
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
      productImage: extractPrimaryProductImageUrl(row.product_image, row.catalog_images) || row.product_image,
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
    await sendCustomerResponse(
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
    await sendCustomerResponse(
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

  // 9. Deliver product images to administrator
  const orderDisplayId = tokenRecord.order_ref || tokenRecord.order_id;
  try {
    const imagesResult = await sendTelegramOrderImages(
      tokenRecord.order_id,
      orderData.orderRef,
      itemsRes.rows,
      adminChatId
    );
    console.log(
      `✓ Product images dispatched for order #${orderDisplayId}: status=${imagesResult.status} (sent: ${imagesResult.sentCount}, failed: ${imagesResult.failedCount})`
    );
  } catch (imgErr: any) {
    console.error('Non-fatal error delivering product images to admin chat:', imgErr?.message || imgErr);
  }

  // 10. Send success confirmation back to the customer (strictly suppressed for administrator chat)
  await sendCustomerResponse(
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
  const textResult = await sendTelegramMessage(config.adminChatId, text);
  if (!textResult.success) {
    return textResult;
  }

  // Also deliver product images if available
  if (order.items && order.items.length > 0) {
    const orderRef = order.orderRef || (order.id ? `ORD-${order.id.slice(0, 8)}` : 'WT-NEW');
    try {
      await sendTelegramOrderImages(order.id || orderRef, orderRef, order.items, config.adminChatId);
    } catch (err: any) {
      console.warn('Non-fatal error delivering order images:', err?.message || err);
    }
  }

  return { success: true };
}
