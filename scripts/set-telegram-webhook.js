import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!botToken) {
  console.error('ERROR: TELEGRAM_BOT_TOKEN is missing in .env');
  process.exit(1);
}

const args = process.argv.slice(2);
const urlArg = args.find((a) => a.startsWith('--url='));
const isDelete = args.includes('--delete');
const isInfo = args.includes('--info') || (!urlArg && !isDelete);

async function main() {
  if (isDelete) {
    console.log('Deleting Telegram webhook...');
    const res = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
    const data = await res.json();
    console.log('Result:', data);
    return;
  }

  if (urlArg) {
    const webhookUrl = urlArg.replace('--url=', '').trim();
    console.log(`Setting Telegram webhook to: ${webhookUrl}`);
    const payload = {
      url: webhookUrl,
      max_connections: 40,
      allowed_updates: ['message', 'edited_message'],
    };
    if (webhookSecret) {
      payload.secret_token = webhookSecret;
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log('Result:', data);
  }

  console.log('\nChecking current webhook status...');
  const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
  const infoData = await infoRes.json();
  console.log('Webhook Info:', JSON.stringify(infoData, null, 2));
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
