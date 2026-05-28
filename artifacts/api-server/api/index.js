'use strict';
module.exports = async function handler(req, res) {
  const dbKeys = Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('DB_') || k.includes('SUPABASE'));
  console.log('DB-related env keys:', dbKeys.join(',') || '(none)');
  console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
  const { default: app } = await import('../dist/app.mjs');
  app(req, res);
};
