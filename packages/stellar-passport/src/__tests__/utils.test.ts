import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isVerificationStale, filterFreshVerifications } from '../utils.js';
import type { Verification } from '../index.js';

const NOW = 1_000_000;
const MAX_AGE = 86_400; // one day in seconds

function makeVerification(timestampOffset: number): Verification {
    return {
        issuer: 'test-issuer',
        points: 10,
        status: { tag: 'Approved', values: undefined },
        timestamp: BigInt(NOW + timestampOffset),
        vtype: { tag: 'Over18', values: undefined },
    };
}

describe('isVerificationStale', () => {
    it('returns true when verification is older than maxAgeSeconds', () => {
        const stale = makeVerification(-(MAX_AGE + 1));
        assert.equal(isVerificationStale(stale, MAX_AGE, NOW), true);
    });

    it('returns false when verification is within maxAgeSeconds', () => {
        const fresh = makeVerification(-MAX_AGE);
        assert.equal(isVerificationStale(fresh, MAX_AGE, NOW), false);
    });

    it('returns false when verification is exactly at the boundary', () => {
        const boundary = makeVerification(-MAX_AGE);
        assert.equal(isVerificationStale(boundary, MAX_AGE, NOW), false);
    });

    it('returns false when verification is very recent', () => {
        const recent = makeVerification(-1);
        assert.equal(isVerificationStale(recent, MAX_AGE, NOW), false);
    });

    it('uses Date.now() when nowSeconds is omitted', () => {
        const alwaysStale = makeVerification(-999_999_999);
        assert.equal(isVerificationStale(alwaysStale, MAX_AGE), true);
    });
});

describe('filterFreshVerifications', () => {
    it('returns only non-stale verifications from a mixed array', () => {
        const stale = makeVerification(-(MAX_AGE + 1));
        const fresh = makeVerification(-1);
        const result = filterFreshVerifications([stale, fresh], MAX_AGE, NOW);
        assert.equal(result.length, 1);
        assert.equal(result[0], fresh);
    });

    it('returns an empty array when all verifications are stale', () => {
        const v1 = makeVerification(-(MAX_AGE + 1));
        const v2 = makeVerification(-(MAX_AGE + 100));
        const result = filterFreshVerifications([v1, v2], MAX_AGE, NOW);
        assert.equal(result.length, 0);
    });

    it('returns all verifications when none are stale', () => {
        const v1 = makeVerification(-1);
        const v2 = makeVerification(-100);
        const result = filterFreshVerifications([v1, v2], MAX_AGE, NOW);
        assert.equal(result.length, 2);
    });

    it('returns an empty array for an empty input', () => {
        const result = filterFreshVerifications([], MAX_AGE, NOW);
        assert.equal(result.length, 0);
    });
});
