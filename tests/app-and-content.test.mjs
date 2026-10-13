import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { computeSha256, fetchVerifiedPackage, syncAndCleanCache } from '../app.js';

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

test('Validation script runs and passes cleanly on sample data', () => {
  const output = execSync('node scripts/validate-content.mjs', { encoding: 'utf-8' });
  assert.match(output, /Validation SUCCESSFUL/);
});

test('computeSha256 function computes accurate SHA-256 hash', async () => {
  const input = 'Palavra Viva Test Content';
  const expectedHash = sha256(input);
  const calculatedHash = await computeSha256(input);
  assert.equal(calculatedHash, expectedHash);
});

test('Hash rejection logic rejects package with altered content hash', async () => {
  const manifest = JSON.parse(fs.readFileSync('content-manifest.json', 'utf-8'));
  const pkg = { ...manifest.packages[0] };

  // Set an incorrect hash
  pkg.hash = '0000000000000000000000000000000000000000000000000000000000000000';

  // Mock fetch function globally
  global.fetch = async (url) => {
    const realContent = fs.readFileSync(pkg.path, 'utf-8');
    return {
      ok: true,
      text: async () => realContent
    };
  };

  await assert.rejects(
    async () => {
      await fetchVerifiedPackage(pkg);
    },
    /não pôde ser verificado/
  );
});

test('Manifest generation upgrade and revoked package cleanup logic', async () => {
  const mockCacheStorage = new Map();

  // Mock global caches and localStorage
  global.localStorage = {
    store: { 'pv4-manifest-generation': '1' },
    getItem(key) { return this.store[key] || null; },
    setItem(key, val) { this.store[key] = String(val); }
  };

  global.caches = {
    async open(cacheName) {
      if (!mockCacheStorage.has(cacheName)) {
        mockCacheStorage.set(cacheName, new Map());
      }
      const store = mockCacheStorage.get(cacheName);
      return {
        async keys() {
          return Array.from(store.keys()).map(k => ({ url: k }));
        },
        async delete(req) {
          const url = typeof req === 'string' ? req : req.url;
          return store.delete(url);
        }
      };
    }
  };

  const dataCache = await global.caches.open('pv4-data-v1');
  const cacheMap = mockCacheStorage.get('pv4-data-v1');

  // Pre-populate cache with active and revoked packages
  cacheMap.set('http://localhost/biblia/43/003.json', 'active content');
  cacheMap.set('http://localhost/biblia/99/revoked.json', 'revoked content');

  const newManifest = {
    generation: 2,
    packages: [{ path: 'biblia/43/003.json' }],
    revoked: ['biblia/99/revoked.json']
  };

  await syncAndCleanCache(newManifest);

  // Assert generation was updated in localStorage
  assert.equal(global.localStorage.getItem('pv4-manifest-generation'), '2');

  // Assert revoked package was evicted from cache while active package remains
  assert.ok(cacheMap.has('http://localhost/biblia/43/003.json'));
  assert.ok(!cacheMap.has('http://localhost/biblia/99/revoked.json'));
});

test('pv4- prefix contract enforcement', () => {
  const swContent = fs.readFileSync('sw.js', 'utf-8');
  const storageContent = fs.readFileSync('storage.js', 'utf-8');

  assert.match(swContent, /pv4-/);
  assert.match(storageContent, /pv4-/);
});

test('App never displays empty tabs or "em breve"', () => {
  const htmlContent = fs.readFileSync('index.html', 'utf-8');
  const appJsContent = fs.readFileSync('app.js', 'utf-8');

  assert.doesNotMatch(htmlContent, /em breve/i);
  assert.doesNotMatch(appJsContent, /em breve/i);
  assert.match(htmlContent, /:empty\s*\{\s*display:\s*none/);
});
