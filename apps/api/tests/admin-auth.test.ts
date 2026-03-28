import assert from 'node:assert/strict';
import test from 'node:test';

import { requireAdmin } from '../lib/server/admin-auth.ts';
import { HttpError } from '../lib/server/api-primitives.ts';

const ADMIN_TOKEN_ENV = 'ADMIN_API_TOKEN';

function createRequest(authorization?: string) {
  return {
    headers: {
      get(name: string) {
        if (name.toLowerCase() === 'authorization') {
          return authorization ?? null;
        }
        return null;
      },
    },
  } as Parameters<typeof requireAdmin>[0];
}

async function withAdminToken<T>(
  value: string | undefined,
  run: () => Promise<T> | T
): Promise<T> {
  const previous = process.env[ADMIN_TOKEN_ENV];
  if (typeof value === 'string') {
    process.env[ADMIN_TOKEN_ENV] = value;
  } else {
    delete process.env[ADMIN_TOKEN_ENV];
  }

  try {
    return await run();
  } finally {
    if (typeof previous === 'string') {
      process.env[ADMIN_TOKEN_ENV] = previous;
    } else {
      delete process.env[ADMIN_TOKEN_ENV];
    }
  }
}

test(
  'requireAdmin rejects requests when admin auth token is not configured',
  { concurrency: false },
  async () => {
    await withAdminToken(undefined, async () => {
      await assert.rejects(() => requireAdmin(createRequest()), (error: unknown) => {
        assert.ok(error instanceof HttpError);
        assert.equal(error.status, 403);
        assert.equal(error.code, 'admin_auth_disabled');
        return true;
      });
    });
  }
);

test(
  'requireAdmin rejects requests without valid bearer token',
  { concurrency: false },
  async () => {
    await withAdminToken('admin-secret', async () => {
      await assert.rejects(() => requireAdmin(createRequest()), (error: unknown) => {
        assert.ok(error instanceof HttpError);
        assert.equal(error.status, 403);
        assert.equal(error.code, 'admin_forbidden');
        return true;
      });

      await assert.rejects(() => requireAdmin(createRequest('Bearer wrong-token')), (error: unknown) => {
        assert.ok(error instanceof HttpError);
        assert.equal(error.status, 403);
        assert.equal(error.code, 'admin_forbidden');
        return true;
      });
    });
  }
);

test(
  'requireAdmin accepts matching bearer token',
  { concurrency: false },
  async () => {
    await withAdminToken('admin-secret', async () => {
      const context = await requireAdmin(createRequest('Bearer admin-secret'));
      assert.deepEqual(context, {
        actor: 'admin-token',
      });
    });
  }
);
