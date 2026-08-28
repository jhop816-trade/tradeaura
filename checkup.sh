#!/usr/bin/env bash
#
# checkup.sh — full health check for a Node/JS web project deployed on Vercel
#
# Usage:
#   ./checkup.sh                      # local checks only
#   ./checkup.sh https://yoursite.com # also audits the live deployment
#
# Everything degrades gracefully: if a tool isn't installed or a check
# doesn't apply, it's SKIPPED, not failed. Nothing here mutates your repo.
#
set -uo pipefail

SITE_URL="${1:-}"
PASS=0; WARN=0; FAIL=0; SKIP=0
BOLD=$(tput bold 2>/dev/null || echo ""); DIM=$(tput dim 2>/dev/null || echo "")
RED=$(tput setaf 1 2>/dev/null || echo ""); GRN=$(tput setaf 2 2>/dev/null || echo "")
YLW=$(tput setaf 3 2>/dev/null || echo ""); BLU=$(tput setaf 4 2>/dev/null || echo "")
RST=$(tput sgr0 2>/dev/null || echo "")

section() { printf "\n${BOLD}${BLU}▸ %s${RST}\n" "$1"; }
pass()   { printf "  ${GRN}✓${RST} %s\n" "$1"; PASS=$((PASS+1)); }
warn()   { printf "  ${YLW}⚠${RST} %s\n" "$1"; WARN=$((WARN+1)); }
fail()   { printf "  ${RED}✗${RST} %s\n" "$1"; FAIL=$((FAIL+1)); }
skip()   { printf "  ${DIM}– %s (skipped)${RST}\n" "$1"; SKIP=$((SKIP+1)); }
info()   { printf "  ${DIM}%s${RST}\n" "$1"; }
have()   { command -v "$1" >/dev/null 2>&1; }

# ── Detect package manager ────────────────────────────────────────────────
detect_pm() {
  if [ -f pnpm-lock.yaml ]; then echo pnpm
  elif [ -f yarn.lock ]; then echo yarn
  elif [ -f bun.lockb ] || [ -f bun.lock ]; then echo bun
  elif [ -f package-lock.json ]; then echo npm
  elif have pnpm; then echo pnpm
  else echo npm; fi
}

# Run a package.json script only if it exists. $1 = script name, $2 = label
run_script() {
  local scr="$1" label="$2"
  if [ ! -f package.json ]; then skip "$label"; return; fi
  if ! node -e "process.exit(require('./package.json').scripts?.['$scr']?0:1)" 2>/dev/null; then
    skip "$label — no \"$scr\" script"; return
  fi
  if $PM run "$scr" >/tmp/checkup_$scr.log 2>&1; then
    pass "$label"
  else
    fail "$label — see /tmp/checkup_$scr.log"
    tail -n 8 /tmp/checkup_$scr.log | sed 's/^/      /'
  fi
}

printf "${BOLD}Site checkup${RST} — %s\n" "$(date '+%Y-%m-%d %H:%M')"
[ -n "$SITE_URL" ] && info "Live target: $SITE_URL"

# ── 0. Repo sanity ────────────────────────────────────────────────────────
section "Repo & tooling"
if [ -f package.json ]; then pass "package.json found"; else
  fail "No package.json in $(pwd) — run this from your project root"; fi
PM=$(detect_pm); info "Package manager: $PM"
have node && info "Node: $(node -v)" || fail "node not on PATH"

# ── 1. Dependencies ───────────────────────────────────────────────────────
section "Dependencies"
if [ -d node_modules ]; then pass "node_modules present"; else
  warn "node_modules missing — run '$PM install' first for accurate checks"; fi

# Lockfile committed?
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  lock=$(ls pnpm-lock.yaml yarn.lock package-lock.json bun.lockb bun.lock 2>/dev/null | head -1)
  if [ -n "$lock" ] && git ls-files --error-unmatch "$lock" >/dev/null 2>&1; then
    pass "Lockfile ($lock) is committed"
  else
    warn "Lockfile not committed — Vercel builds may drift from local"
  fi
fi

# Outdated / security audit
case "$PM" in
  npm)  audit_cmd="npm audit --omit=dev";;
  pnpm) audit_cmd="pnpm audit --prod";;
  yarn) audit_cmd="yarn npm audit --environment production";;
  bun)  audit_cmd="";;
esac
if [ -n "${audit_cmd:-}" ]; then
  if $audit_cmd >/tmp/checkup_audit.log 2>&1; then
    pass "No known vulnerabilities in production deps"
  else
    warn "Security audit flagged issues — see /tmp/checkup_audit.log"
    grep -Ei 'severity|vulnerabilit' /tmp/checkup_audit.log | head -5 | sed 's/^/      /'
  fi
else
  skip "Security audit (bun has no built-in audit)"
fi

# ── 2. Static analysis ────────────────────────────────────────────────────
section "Lint, types, format"
run_script "lint" "Lint"
# TypeScript: prefer a typecheck script, fall back to tsc --noEmit
if [ -f tsconfig.json ]; then
  if node -e "process.exit(require('./package.json').scripts?.typecheck?0:1)" 2>/dev/null; then
    run_script "typecheck" "TypeScript typecheck"
  elif have npx; then
    if npx --no-install tsc --noEmit >/tmp/checkup_tsc.log 2>&1; then
      pass "TypeScript typecheck (tsc --noEmit)"
    else
      fail "TypeScript errors — see /tmp/checkup_tsc.log"
      tail -n 8 /tmp/checkup_tsc.log | sed 's/^/      /'
    fi
  else skip "TypeScript typecheck"; fi
else
  skip "TypeScript typecheck — no tsconfig.json"
fi
run_script "format:check" "Format check"

# ── 3. Tests ──────────────────────────────────────────────────────────────
section "Tests"
run_script "test" "Test suite"

# ── 4. Production build ───────────────────────────────────────────────────
section "Production build"
run_script "build" "Build"
# Report build output size if present
for dir in .next dist build out; do
  if [ -d "$dir" ]; then
    info "Build output ./$dir — $(du -sh "$dir" 2>/dev/null | cut -f1)"
    break
  fi
done

# ── 5. Vercel-specific ────────────────────────────────────────────────────
section "Vercel configuration"
# engines.node vs what Vercel supports (22.x is current default; 18/20 also ok)
if [ -f package.json ]; then
  enode=$(node -e "console.log(require('./package.json').engines?.node||'')" 2>/dev/null)
  if [ -z "$enode" ]; then
    warn "No engines.node set — Vercel picks a default that can change under you"
  else
    case "$enode" in
      *22*|*20*|*18*) pass "engines.node = \"$enode\" (supported on Vercel)";;
      *) warn "engines.node = \"$enode\" — confirm this major is supported on Vercel";;
    esac
  fi
fi
if [ -f vercel.json ]; then
  if node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8'))" 2>/dev/null; then
    pass "vercel.json is valid JSON"
  else
    fail "vercel.json is not valid JSON — this will break deploys"
  fi
else
  info "No vercel.json (fine — using dashboard/zero-config defaults)"
fi
# .env files must not be committed
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  leaked=$(git ls-files | grep -E '^\.env(\.|$)' | grep -v '\.example$' || true)
  if [ -n "$leaked" ]; then
    fail "Committed env file(s): $leaked — rotate those secrets and gitignore them"
  else
    pass "No committed .env files"
  fi
fi

# ── 6. Secret scan (working tree) ─────────────────────────────────────────
section "Secret scan"
if have rg; then GREP="rg -n --no-heading"; else GREP="grep -rn"; fi
patterns='sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[baprs]-[0-9A-Za-z-]+|ghp_[A-Za-z0-9]{36}'
hits=$($GREP -E "$patterns" \
        --glob '!node_modules' --glob '!.next' --glob '!dist' 2>/dev/null \
        -- . 2>/dev/null \
      | grep -vE '\.example|\.md:' | head -10 || true)
if [ -n "$hits" ]; then
  fail "Possible hardcoded secrets:"
  echo "$hits" | sed 's/^/      /'
else
  pass "No obvious hardcoded secrets in source"
fi

# ── 7. Live deployment checks ─────────────────────────────────────────────
if [ -n "$SITE_URL" ]; then
  section "Live site — reachability & headers"
  if have curl; then
    code=$(curl -s -o /dev/null -w '%{http_code}' -L "$SITE_URL" || echo 000)
    if [ "$code" = "200" ]; then pass "HTTP $code from $SITE_URL"
    else warn "HTTP $code from $SITE_URL"; fi

    hdrs=$(curl -sI -L "$SITE_URL")
    check_hdr() {
      if echo "$hdrs" | grep -iq "^$1:"; then pass "$1 present"
      else warn "$1 missing"; fi
    }
    check_hdr "strict-transport-security"
    check_hdr "x-content-type-options"
    check_hdr "content-security-policy"
    check_hdr "x-frame-options"
    if echo "$hdrs" | grep -iq '^x-vercel-id:'; then info "Served by Vercel (x-vercel-id seen)"; fi
  else
    skip "Header checks — curl not installed"
  fi

  section "Live site — Lighthouse"
  if have npx; then
    info "Running Lighthouse (this takes ~30s)…"
    if npx --no-install lighthouse "$SITE_URL" \
         --quiet --chrome-flags="--headless=new --no-sandbox" \
         --only-categories=performance,accessibility,best-practices,seo \
         --output=json --output-path=/tmp/checkup_lh.json >/dev/null 2>&1; then
      node -e '
        const r=require("/tmp/checkup_lh.json");
        for (const [k,c] of Object.entries(r.categories))
          console.log("      "+c.title+": "+Math.round(c.score*100));
      '
      pass "Lighthouse complete (full report: /tmp/checkup_lh.json)"
    else
      skip "Lighthouse — not installed (npx i -g lighthouse) or run failed"
    fi
  else
    skip "Lighthouse — npx unavailable"
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────
section "Summary"
printf "  ${GRN}%d passed${RST}  ${YLW}%d warnings${RST}  ${RED}%d failed${RST}  ${DIM}%d skipped${RST}\n" \
  "$PASS" "$WARN" "$FAIL" "$SKIP"
[ "$FAIL" -gt 0 ] && exit 1 || exit 0
