import { HttpError } from './api-primitives';

interface Code2SessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

function getWechatConfig() {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;
  if (!appId || !appSecret) {
    throw new HttpError(500, 'wechat_config_missing', 'WeChat app credentials not configured');
  }
  return { appId, appSecret };
}

export async function code2Session(code: string): Promise<{ openid: string; unionid?: string }> {
  const { appId, appSecret } = getWechatConfig();
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new HttpError(502, 'wechat_api_error', 'Failed to reach WeChat API');
  }

  const json = (await res.json()) as Code2SessionResponse;
  if (json.errcode) {
    throw new HttpError(401, 'wechat_login_failed', json.errmsg ?? 'WeChat login failed');
  }

  return { openid: json.openid, unionid: json.unionid };
}
