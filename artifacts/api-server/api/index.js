'use strict';

// Run once at module load (cold start). DB_PASSWORD takes precedence over a
// pre-set DATABASE_URL so that special characters in the password are always
// safely URL-encoded. Requires DB_PROJECT_REF to be set explicitly — no
// hardcoded fallback to avoid silently targeting the wrong project.
if (process.env.DB_PASSWORD) {
  const ref = process.env.DB_PROJECT_REF;
  if (!ref) throw new Error('DB_PROJECT_REF must be set when using DB_PASSWORD');
  process.env.DATABASE_URL = `postgresql://postgres.${ref}:${encodeURIComponent(process.env.DB_PASSWORD)}@aws-1-us-west-2.pooler.supabase.com:6543/postgres`;
}

module.exports = async function handler(req, res) {
  const { default: app } = await import('../dist/app.mjs');
  app(req, res);
};
