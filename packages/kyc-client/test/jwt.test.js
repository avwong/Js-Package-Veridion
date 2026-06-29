import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseTokenExpiry } from '../dist/core/jwt.js';

function makeJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${header}.${body}.signature`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 86_400;
const PAST_EXP   = Math.floor(Date.now() / 1000) - 86_400;

describe('parseTokenExpiry', () => {
  it('returns exp for a valid token with future expiry', () => {
    assert.equal(parseTokenExpiry(makeJwt({ sub: 'u1', exp: FUTURE_EXP })), FUTURE_EXP);
  });

  it('returns exp for a valid token with past expiry', () => {
    assert.equal(parseTokenExpiry(makeJwt({ sub: 'u1', exp: PAST_EXP })), PAST_EXP);
  });

  it('returns null when exp claim is absent', () => {
    assert.equal(parseTokenExpiry(makeJwt({ sub: 'u1' })), null);
  });

  it('returns null for malformed base64 payload without throwing', () => {
    assert.doesNotThrow(() => parseTokenExpiry('header.!!!invalid-base64!!!.sig'));
    assert.equal(parseTokenExpiry('header.!!!invalid-base64!!!.sig'), null);
  });

  it('returns null for a non-JWT string', () => {
    assert.equal(parseTokenExpiry('not-a-jwt-at-all'), null);
  });

  it('returns null when exp is not a number', () => {
    assert.equal(parseTokenExpiry(makeJwt({ exp: 'string-value' })), null);
  });
});
