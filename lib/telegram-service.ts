import {
  getTelegramConfig,
  processTelegramStartToken,
  handleTelegramStartWithoutToken,
  sendTelegramMessage,
} from './telegram.ts';

declare global {
  var __telegramPollingActive: boolean | undefined;
  var __telegramAbortController: AbortController | undefined;
}

/**
 * Initializes the Telegram bot update handler.
 * - In Production: If a webhook is registered with Telegram, operates in Webhook mode.
 * - In Local / Development: If no webhook URL is registered with Telegram, starts an automated long-polling worker
 *   so orders placed in development are immediately delivered to @wengi67 without requiring manual tunnel setup.
 * - Guarantees webhook and polling never run simultaneously.
 */
export async function initTelegramBotService(): Promise<void> {
  const config = getTelegramConfig();
  if (!config.botToken) {
    return;
  }

  if (global.__telegramPollingActive) {
    return;
  }

  try {
    const webhookRes = await fetch(`https://api.telegram.org/bot${config.botToken}/getWebhookInfo`);
    if (webhookRes.ok) {
      const webhookInfo = await webhookRes.json();
      if (webhookInfo.ok && webhookInfo.result?.url) {
        console.log(`[Telegram Service] Production webhook is registered (${webhookInfo.result.url}). Webhook mode active.`);
        return;
      }
    }
  } catch (err: any) {
    console.warn('[Telegram Service] Could not query webhook status:', err?.message || err);
  }

  startBackgroundPolling();
}

export function stopTelegramBotService(): void {
  if (global.__telegramAbortController) {
    global.__telegramAbortController.abort();
    global.__telegramAbortController = undefined;
  }
  global.__telegramPollingActive = false;
}

function startBackgroundPolling(): void {
  if (global.__telegramPollingActive) return;
  global.__telegramPollingActive = true;
  global.__telegramAbortController = new AbortController();

  const config = getTelegramConfig();
  console.log(`[Telegram Service] No active webhook detected. Automated local development polling worker started for @${config.botUsername}...`);

  let offset = 0;

  (async () => {
    while (global.__telegramPollingActive) {
      try {
        const url = `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${offset}&timeout=20`;
        const res = await fetch(url, { signal: global.__telegramAbortController?.signal });

        if (!res.ok) {
          if (res.status === 409) {
            // Conflict: Webhook was registered on Telegram servers. Stop polling.
            console.log('[Telegram Service] Webhook detected on Telegram servers. Polling stopped.');
            global.__telegramPollingActive = false;
            break;
          }
          await new Promise((r) => setTimeout(r, 4000));
          continue;
        }

        const data = await res.json();
        if (!data.ok || !Array.isArray(data.result)) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }

        for (const update of data.result) {
          offset = update.update_id + 1;
          const message = update.message || update.edited_message;
          if (!message || !message.text || !message.chat?.id) continue;

          const text = message.text.trim();
          const chatId = message.chat.id;
          const sender = message.from?.username
            ? `@${message.from.username}`
            : `${message.from?.first_name || 'Customer'} (${chatId})`;

          const startMatch = text.match(/^\/start(?:@\w+)?(?:\s+(.+?))?\s*$/i);

          if (startMatch) {
            const rawToken = startMatch[1] ? startMatch[1].trim() : '';
            const hasToken = Boolean(rawToken);

            console.log(`[Telegram Service] Received /start from ${sender}. Has token: ${hasToken}`);

            if (!hasToken) {
              await handleTelegramStartWithoutToken(chatId);
            } else {
              console.log(`[Telegram Service] Processing token and dispatching order to @wengi67 (${config.adminChatId})...`);
              const dispatchResult = await processTelegramStartToken(rawToken, chatId);
              console.log(`[Telegram Service] Result: ${dispatchResult.message}`);
            }
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') break;
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  })();
}
