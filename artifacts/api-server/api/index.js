'use strict';
module.exports = async function handler(req, res) {
  console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL, '| starts:', (process.env.DATABASE_URL || '').slice(0, 15));
  const { default: app } = await import('../dist/app.mjs');
  app(req, res);
};
