/**
 * Hard-coded budget guard. This is real application code, not an AI
 * instruction — nothing in this file trusts the model to remember the rule.
 * Every code path that could increase Google Ads spend must call this
 * first and respect its answer.
 */
export const MONTHLY_AD_BUDGET_CAP = 100 // dollars, hard limit, do not change without the owner's explicit say-so

export interface BudgetCheckResult {
  allowed: boolean
  reason?: string
}

/**
 * @param spentThisMonth - dollars already spent this calendar month
 * @param proposedNewTotal - what monthly spend would become if the action goes through
 */
export function checkBudget(spentThisMonth: number, proposedNewTotal: number): BudgetCheckResult {
  if (proposedNewTotal > MONTHLY_AD_BUDGET_CAP) {
    return {
      allowed: false,
      reason: `Would bring monthly spend to $${proposedNewTotal.toFixed(2)}, over the $${MONTHLY_AD_BUDGET_CAP} cap (currently $${spentThisMonth.toFixed(2)} spent).`,
    }
  }
  return { allowed: true }
}
