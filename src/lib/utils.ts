import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STORAGE_FREE_HOURS = 1;
export const STORAGE_FEE_TIER1_RATE = 2;
export const STORAGE_FEE_TIER1_HOURS = 6;
export const STORAGE_FEE_TIER2_RATE = 4;
export const STORAGE_FEE_MAX_RATIO = 0.5;

export function calculateStorageFee(
  overdueHours: number,
  totalAmount: number = 0
): number {
  if (overdueHours <= 0) return 0;

  const billableHours = Math.ceil(overdueHours);
  const freeHours = STORAGE_FREE_HOURS;

  if (billableHours <= freeHours) return 0;

  const hoursAfterFree = billableHours - freeHours;
  const tier1Hours = Math.min(hoursAfterFree, STORAGE_FEE_TIER1_HOURS);
  const tier2Hours = Math.max(0, hoursAfterFree - STORAGE_FEE_TIER1_HOURS);

  const fee = tier1Hours * STORAGE_FEE_TIER1_RATE + tier2Hours * STORAGE_FEE_TIER2_RATE;

  if (totalAmount > 0) {
    const maxFee = totalAmount * STORAGE_FEE_MAX_RATIO;
    return Math.min(fee, maxFee);
  }

  return fee;
}

export interface StorageFeeBreakdown {
  fee: number;
  billableHours: number;
  freeHours: number;
  tier1Hours: number;
  tier1Rate: number;
  tier2Hours: number;
  tier2Rate: number;
  maxFee: number | null;
  totalAmount: number;
}

export function getStorageFeeBreakdown(
  overdueHours: number,
  totalAmount: number = 0
): StorageFeeBreakdown {
  const billableHours = Math.ceil(Math.max(0, overdueHours));
  const freeHours = STORAGE_FREE_HOURS;

  let fee = 0;
  let tier1Hours = 0;
  let tier2Hours = 0;

  if (billableHours > freeHours) {
    const hoursAfterFree = billableHours - freeHours;
    tier1Hours = Math.min(hoursAfterFree, STORAGE_FEE_TIER1_HOURS);
    tier2Hours = Math.max(0, hoursAfterFree - STORAGE_FEE_TIER1_HOURS);
    fee = tier1Hours * STORAGE_FEE_TIER1_RATE + tier2Hours * STORAGE_FEE_TIER2_RATE;
  }

  const maxFee = totalAmount > 0 ? totalAmount * STORAGE_FEE_MAX_RATIO : null;
  if (maxFee !== null) {
    fee = Math.min(fee, maxFee);
  }

  return {
    fee,
    billableHours,
    freeHours,
    tier1Hours,
    tier1Rate: STORAGE_FEE_TIER1_RATE,
    tier2Hours,
    tier2Rate: STORAGE_FEE_TIER2_RATE,
    maxFee,
    totalAmount,
  };
}
