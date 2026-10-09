export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initTelegramBotService } = await import('./lib/telegram-service.ts');
    initTelegramBotService().catch((err) => {
      console.warn('Failed to initialize Telegram Bot Service in background:', err?.message || err);
    });
  }
}
