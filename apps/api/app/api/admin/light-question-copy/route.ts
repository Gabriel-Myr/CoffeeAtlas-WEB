import { NextRequest, NextResponse } from 'next/server';

import { badRequest, toLegacyError } from '@/lib/server/api-helpers';
import { readLightQuestionCopyConfig, writeLightQuestionCopyConfig } from '@/lib/server/light-question-copy';

const LIGHT_QUESTION_SAVE_PASSWORD = '291803';

function readSavePassword(request: NextRequest): string | null {
  const password = request.headers.get('x-save-password');
  if (!password) return null;
  const normalized = password.trim();
  return normalized.length > 0 ? normalized : null;
}

export async function GET(request: NextRequest) {
  try {
    const data = await readLightQuestionCopyConfig();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toLegacyError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const savePassword = readSavePassword(request);
    if (savePassword !== LIGHT_QUESTION_SAVE_PASSWORD) {
      badRequest('保存密码不正确', 'invalid_save_password');
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      badRequest('Request body must be a JSON object', 'invalid_payload');
    }

    const data = await writeLightQuestionCopyConfig(body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toLegacyError(error);
  }
}
