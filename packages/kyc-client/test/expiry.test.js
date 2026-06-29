import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { KycClient } from '../dist/client.js';

// dist/client.js evaluation only defines the KycClient class — it accesses no
// browser globals at module load time. Setting these globals here (before any
// test body runs) is sufficient.
const _store = {};
global.localStorage = {
  getItem:    (k)    => _store[k] ?? null,
  setItem:    (k, v) => { _store[k] = v; },
  removeItem: (k)    => { delete _store[k]; },
};
global.window = {
  addEventListener:    () => {},
  removeEventListener: () => {},
};

function makeJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${header}.${body}.signature`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 86_400;
const PAST_EXP   = Math.floor(Date.now() / 1000) - 86_400;

function clearStore() {
  Object.keys(_store).forEach((k) => delete _store[k]);
}

function newClient(opts = {}) {
  const client = new KycClient();
  client.init({ edgeUrl: 'http://localhost:3000', clientId: 'test', ...opts });
  return client;
}

describe('KycClient expiry behavior', () => {
  it('valid token with future exp: getToken returns it and leaves storage intact', () => {
    clearStore();
    const token = makeJwt({ sub: 'u1', exp: FUTURE_EXP });
    _store['kyc_token'] = token;
    const client = newClient();
    assert.equal(client.getToken(), token, 'should return the valid token');
    assert.equal(_store['kyc_token'], token, 'token should remain in storage');
    // Clear the scheduled eviction timer so the event loop is free to exit.
    client.logout();
  });

  it('valid token with past exp: cleared from storage and onTokenExpired called', () => {
    clearStore();
    _store['kyc_token'] = makeJwt({ sub: 'u1', exp: PAST_EXP });
    let expiredCalled = false;
    const client = newClient({ onTokenExpired: () => { expiredCalled = true; } });
    const result = client.getToken();
    assert.equal(result, null, 'expired token should return null');
    assert.equal(expiredCalled, true, 'onTokenExpired should have been called');
    assert.equal(_store['kyc_token'], undefined, 'expired token should be removed');
  });

  it('token with no exp claim: returned as-is (treated as non-expiring)', () => {
    clearStore();
    const noExpToken = makeJwt({ sub: 'u1' });
    _store['kyc_token'] = noExpToken;
    const client = newClient();
    assert.equal(client.getToken(), noExpToken, 'no-exp token should pass through');
  });

  it('insecureNoSession mode: expired token is returned without eviction', () => {
    clearStore();
    const expiredToken = makeJwt({ sub: 'u1', exp: PAST_EXP });
    _store['kyc_token'] = expiredToken;
    let expiredCalled = false;
    const client = newClient({
      insecureNoSession: true,
      onTokenExpired: () => { expiredCalled = true; },
    });
    assert.equal(client.getToken(), expiredToken, 'expired token should pass in insecure mode');
    assert.equal(expiredCalled, false, 'onTokenExpired must NOT fire in insecure mode');
  });
});
