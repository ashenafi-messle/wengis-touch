import { NextRequest, NextResponse } from 'next/server';
import {
  getTelegramConfig,
  isTelegramConfigured,
  sendTelegramMessage,
  processTelegramStartToken,
  handleTelegramStartWithoutToken,
} from '@/lib/telegram';

export async function GET(req: NextRequest) {
  const config = getTelegramConfig();

  // Optional live query to Telegram Bot API to check registered webhook status
  let telegramWebhookStatus = null;
  if (config.botToken) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${config.botToken}/getWebhookInfo`);
      if (res.ok) {
        telegramWebhookStatus = await res.json();
      }
    } catch (e: any) {
      telegramWebhookStatus = { error: e?.message || 'Could not reach Telegram API' };
    }
  }

  return NextResponse.json({
    status: 'active',
    botUsername: config.botUsername,
    isConfigured: isTelegramConfigured(),
    expiryMinutes: config.expiryMinutes,
    websiteUrl: config.websiteUrl,
    telegramWebhookStatus,
  });
}

export async function POST(req: NextRequest) {
  try {
    const config = getTelegramConfig();

    // 1. Verify webhook secret header if configured
    if (config.webhookSecret) {
      const incomingSecret = req.headers.get('x-telegram-bot-api-secret-token');
      if (incomingSecret !== config.webhookSecret) {
        console.warn('⚠️ Rejected Telegram webhook update: invalid secret token header.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const update = await req.json();

    const updateType = update?.message
      ? 'message'
      : update?.edited_message
      ? 'edited_message'
      : update?.callback_query
      ? 'callback_query'
      : 'other';

    // 2. Extract message from update
    const message = update?.message || update?.edited_message;
    if (!message || !message.text || !message.chat?.id) {
      // Diagnostic log without customer PII
      console.log(`[Telegram Webhook] Update ID: ${update?.update_id || 'unknown'}, type: ${updateType}, acknowledged non-text update.`);
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();
    const chatId = message.chat.id;

    // 3. Robust regex parse for /start command
    // Matches:
    // "/start"
    // "/start "
    // "/start@BotUsername"
    // "/start TOKEN"
    // "/start@BotUsername TOKEN"
    const startMatch = text.match(/^\/start(?:@\w+)?(?:\s+(.+?))?\s*$/i);

    if (startMatch) {
      const rawToken = startMatch[1] ? startMatch[1].trim() : '';
      const hasToken = Boolean(rawToken);

      // Diagnostic logging: update type and whether start token was received
      // STRICT: Never log bot token or customer PII in diagnostic logs
      console.log(
        `[Telegram Webhook] Update ID: ${update?.update_id || 'unknown'}, type: ${updateType}, command: /start, hasToken: ${hasToken}, tokenLength: ${rawToken.length}`
      );

      if (!hasToken) {
        // Handle Telegram Web / direct /start without token
        // Does NOT crash, does NOT mark any token as used
        await handleTelegramStartWithoutToken(chatId);
        return NextResponse.json({ ok: true });
      }

      // Handle /start TOKEN with cryptographic validation and dispatch to @wengi67
      await processTelegramStartToken(rawToken, chatId);
      return NextResponse.json({ ok: true });
    }

    // Default polite response for unexpected text
    console.log(
      `[Telegram Webhook] Update ID: ${update?.update_id || 'unknown'}, type: ${updateType}, other command/text received.`
    );

    const returnMarkup = config.websiteUrl
      ? {
          inline_keyboard: [
            [
              {
                text: "🌐 Visit Wengi's Touch Website",
                url: config.websiteUrl,
              },
            ],
          ],
        }
      : undefined;

    await sendTelegramMessage(
      chatId,
      `🧶 <b>Wengi's Touch Atelier</b>\n\n` +
      `We received your message! For order submissions, please place an order on our website or use your order confirmation link.\n\n` +
      `For direct custom inquiries, you can also reach our atelier at @${config.adminUsername}.`,
      'HTML',
      returnMarkup
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error processing Telegram webhook update:', error);
    // Return 200 so Telegram does not get stuck retrying broken updates
    return NextResponse.json({ ok: false, error: error?.message || 'Internal error' }, { status: 200 });
  }
}
