import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Standard Shadcn UI helper for merging Tailwind classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// --- YOUR POINT SYSTEM LOGIC ---

// 1. Define Category Constants to prevent typos across the app
export const POINT_CATEGORIES = {
  UNIBRIDGE: 'UNIBRIDGE_TX',
  STAKING: 'STAKING_DAILY',
  CONNECT: 'CONNECT',
  REFERRAL_REFERRED: 'REFERRAL_BONUS_REFERRED',
  REFERRAL_EARN: 'REFERRAL_EARN_REFERRER',
};

// 2. Default Weights (Matches your SQL View)
export const DEFAULT_WEIGHTS = {
  unibridge: 0.6,
  staking: 0.4,
};

/**
 * Centralized formula to calculate the Final Weighted Score.
 */
export function calculateWeightedScore(uniRaw, stakeRaw) {
  return Math.floor(
    (uniRaw || 0) * DEFAULT_WEIGHTS.unibridge + 
    (stakeRaw || 0) * DEFAULT_WEIGHTS.staking
  );
}
