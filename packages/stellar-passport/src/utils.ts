import type { Verification } from './index.js';

export function isVerificationStale(
    verification: Verification,
    maxAgeSeconds: number,
    nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
    return nowSeconds - Number(verification.timestamp) > maxAgeSeconds;
}

export function filterFreshVerifications(
    verifications: Verification[],
    maxAgeSeconds: number,
    nowSeconds?: number,
): Verification[] {
    return verifications.filter(
        (v) => !isVerificationStale(v, maxAgeSeconds, nowSeconds),
    );
}
