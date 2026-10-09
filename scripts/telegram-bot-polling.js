import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getTelegramConfig,
  processTelegramStartToken,
  handleTelegramStartWithoutToken,
  sendTelegramMessage,
} from '../lib/telegram.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

async function startPolling() {
  const config = getTelegramConfig();
  console.log('========================================================');
  console.log('   WENGI\'S TOUCH — TELEGRAM BOT POLLING WORKER');
  console.log('========================================================');
  console.log(`Bot Username : @${config.botUsername}`);
  console.log(`Admin Chat ID: ${config.adminChatId} (@${config.adminUsername})`);

  if (!config.botToken) {
    console.error('ERROR: TELEGRAM_BOT_TOKEN is not configured in .env');
    process.exit(1);
  }

  // Ensure webhook is removed before polling so getUpdates works
  try {
    const webhookInfoRes = await fetch(`https://api.telegram.org/bot${config.botToken}/getWebhookInfo`);
    const webhookInfo = await webhookInfoRes.json();
    if (webhookInfo.ok && webhookInfo.result.url) {
      console.log(`Removing active webhook (${webhookInfo.result.url}) to enable long polling...`);
      await fetch(`https://api.telegram.org/bot${config.botToken}/deleteWebhook`);
      console.log('✓ Webhook removed, long polling is now active.');
    }
  } catch (err) {
    console.warn('Could not check webhook info:', err.message);
  }

  let offset = 0;
  console.log('\nListening for customer /start and order tokens from Telegram...');

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${offset}&timeout=30`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Telegram API getUpdates error: HTTP ${response.status}`);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      const data = await response.json();
      if (!data.ok || !Array.isArray(data.result)) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }

      for (const update of data.result) {
        offset = update.update_id + 1;

        const message = update.message || update.edited_message;
        if (!message || !message.text || !message.chat?.id) {
          continue;
        }

        const text = message.text.trim();
        const chatId = message.chat.id;
        const senderName = message.from?.username
          ? `@${message.from.username}`
          : `${message.from?.first_name || 'User'} (${chatId})`;

        // Robust regex for /start command
        const startMatch = text.match(/^\/start(?:@\w+)?(?:\s+(.+?))?\s*$/i);

        if (startMatch) {
          const rawToken = startMatch[1] ? startMatch[1].trim() : '';
          const hasToken = Boolean(rawToken);

          console.log(`\n[Telegram Update] Received /start from ${senderName}. Has token: ${hasToken} (length: ${rawToken.length})`);

          if (!hasToken) {
            console.log('Handling /start without token (Telegram Web or direct chat)...');
            await handleTelegramStartWithoutToken(chatId);
          } else {
            console.log(`Validating order token and dispatching order to @wengi67 (${config.adminChatId})...`);
            const result = await processTelegramStartToken(rawToken, chatId);
            console.log(`Result: ${result.message}`);
          }
        } else {
          // Other message
          console.log(`[Telegram Update] Received message: "${text}" from ${senderName}`);
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

          if (String(chatId) !== String(config.adminChatId)) {
            await sendTelegramMessage(
              chatId,
              `🧶 <b>Wengi's Touch Atelier</b>\n\n` +
              `We received your message! For order confirmations, please place an order on our website or click your order link.\n\n` +
              `For direct custom inquiries, you can also reach our atelier at @${config.adminUsername}.`,
              'HTML',
              returnMarkup
            );
          }
        }
      }
    } catch (err) {
      console.error('Polling loop error:', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

startPolling();
