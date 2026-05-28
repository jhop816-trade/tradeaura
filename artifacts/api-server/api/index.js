'use strict';
module.exports = async function handler(req, res) {
  // If DB_PASSWORD is set, construct DATABASE_URL with proper encoding so
  // special characters in the password don't break the connection string.
  if (process.env.DB_PASSWORD && !process.env.DATABASE_URL) {
    const ref = process.env.DB_PROJECT_REF || 'sjpltlbuxycwgehgxsul';
    process.env.DATABASE_URL = `postgresql://postgres.${ref}:${encodeURIComponent(process.env.DB_PASSWORD)}@aws-1-us-west-2.pooler.supabase.com:6543/postgres`;
  }
  const { default: app } = await import('../dist/app.mjs');
  app(req, res);
};
