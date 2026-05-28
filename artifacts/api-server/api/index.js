'use strict';
module.exports = async function handler(req, res) {
  const { default: app } = await import('../dist/app.mjs');
  app(req, res);
};
