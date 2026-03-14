import { useState } from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';

import {
  getApiBaseUrlState,
  getApiHealth,
  getBeans,
  getFavorites,
  getMe,
  getRoasters,
} from '../../services/api';
import { isLoggedIn } from '../../utils/auth';
import { getStoredUser } from '../../utils/storage';
import {
  clearApiBaseUrlOverride,
  setApiBaseUrlOverride,
} from '../../utils/api-config';
import './index.scss';

interface ProbeResult {
  title: string;
  durationMs: number;
  payload: string;
  error: string | null;
}

const MAX_PREVIEW_LENGTH = 2800;

function formatPayload(value: unknown): string {
  const serialized = JSON.stringify(value, null, 2);
  if (serialized.length <= MAX_PREVIEW_LENGTH) {
    return serialized;
  }

  return `${serialized.slice(0, MAX_PREVIEW_LENGTH)}\n...`;
}

function getModeLabel(mode: ReturnType<typeof getApiBaseUrlState>['mode']) {
  if (mode === 'cloud') return '云端';
  if (mode === 'local') return '本地';
  return '未配置';
}

export default function DebugPage() {
  const [apiState, setApiState] = useState(getApiBaseUrlState());
  const [draftUrl, setDraftUrl] = useState(apiState.baseUrl);
  const [runningKey, setRunningKey] = useState('');
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null);
  const [storedUser, setStoredUser] = useState(getStoredUser());

  useDidShow(() => {
    Taro.setNavigationBarTitle({ title: 'API 联调' });

    const nextState = getApiBaseUrlState();
    setApiState(nextState);
    setDraftUrl(nextState.baseUrl);
    setStoredUser(getStoredUser());
  });

  async function runProbe(title: string, task: () => Promise<unknown>) {
    setRunningKey(title);
    const startedAt = Date.now();

    try {
      const payload = await task();
      setProbeResult({
        title,
        durationMs: Date.now() - startedAt,
        payload: formatPayload(payload),
        error: null,
      });
    } catch (error) {
      setProbeResult({
        title,
        durationMs: Date.now() - startedAt,
        payload: '',
        error: error instanceof Error ? error.message : '请求失败',
      });
    } finally {
      setRunningKey('');
    }
  }

  function handleApplyUrl() {
    const nextState = setApiBaseUrlOverride(draftUrl);
    setApiState(nextState);
    setDraftUrl(nextState.baseUrl);
    Taro.showToast({
      title: nextState.baseUrl ? '已保存联调地址' : '已清空联调地址',
      icon: 'none',
    });
  }

  function handleResetUrl() {
    const nextState = clearApiBaseUrlOverride();
    setApiState(nextState);
    setDraftUrl(nextState.baseUrl);
    Taro.showToast({
      title: '已恢复编译配置',
      icon: 'none',
    });
  }

  const loginLabel = isLoggedIn()
    ? storedUser?.nickname ?? storedUser?.id ?? '已登录'
    : '未登录';

  return (
    <View className="debug-page">
      <View className="debug-page__hero">
        <Text className="debug-page__eyebrow">Cloud Debug</Text>
        <Text className="debug-page__title">小程序 API 联调面板</Text>
        <Text className="debug-page__subtitle">
          在微信开发者工具里把地址切到云端域名，直接验证健康检查、列表和登录态。
        </Text>
      </View>

      <View className="debug-page__card">
        <View className="debug-page__card-head">
          <Text className="debug-page__card-title">当前地址</Text>
          <Text className={`debug-page__badge debug-page__badge--${apiState.mode}`}>
            {getModeLabel(apiState.mode)}
          </Text>
        </View>
        <Text className="debug-page__value">
          {apiState.baseUrl || '未配置，建议填写你的云端 HTTPS 域名'}
        </Text>
        <Text className="debug-page__meta">
          {apiState.source === 'runtime' ? '来源：本机覆盖配置' : '来源：编译配置 TARO_APP_API_URL'}
        </Text>
        {apiState.warning ? (
          <Text className="debug-page__warning">{apiState.warning}</Text>
        ) : null}

        <Input
          className="debug-page__input"
          value={draftUrl}
          placeholder="https://your-cloud-domain.com"
          onInput={(event) => setDraftUrl(event.detail.value)}
        />

        <View className="debug-page__actions">
          <Button className="debug-page__button debug-page__button--primary" onClick={handleApplyUrl}>
            保存联调地址
          </Button>
          <Button className="debug-page__button" onClick={handleResetUrl}>
            恢复编译配置
          </Button>
        </View>
      </View>

      <View className="debug-page__card">
        <Text className="debug-page__card-title">登录状态</Text>
        <Text className="debug-page__value">{loginLabel}</Text>
        <Text className="debug-page__meta">
          {isLoggedIn()
            ? '可继续测试 /api/v1/me 和收藏接口。'
            : '先去“我的”页登录，再回来验证个人信息和收藏接口。'}
        </Text>
      </View>

      <View className="debug-page__card">
        <Text className="debug-page__card-title">快速探针</Text>
        <View className="debug-page__probe-grid">
          <Button
            className="debug-page__probe-button"
            loading={runningKey === 'health'}
            onClick={() => runProbe('health', () => getApiHealth())}
          >
            健康检查
          </Button>
          <Button
            className="debug-page__probe-button"
            loading={runningKey === 'beans'}
            onClick={() => runProbe('beans', () => getBeans({ page: 1, pageSize: 3 }))}
          >
            豆款列表
          </Button>
          <Button
            className="debug-page__probe-button"
            loading={runningKey === 'roasters'}
            onClick={() => runProbe('roasters', () => getRoasters({ page: 1, pageSize: 3 }))}
          >
            烘焙商列表
          </Button>
          <Button
            className="debug-page__probe-button"
            loading={runningKey === 'me'}
            onClick={() => runProbe('me', () => getMe())}
          >
            当前用户
          </Button>
          <Button
            className="debug-page__probe-button"
            loading={runningKey === 'favorites'}
            onClick={() => runProbe('favorites', () => getFavorites())}
          >
            收藏列表
          </Button>
        </View>
      </View>

      <View className="debug-page__card">
        <Text className="debug-page__card-title">最近一次结果</Text>
        {probeResult ? (
          <View className="debug-page__result">
            <Text className="debug-page__result-title">
              {probeResult.title} · {probeResult.durationMs}ms
            </Text>
            {probeResult.error ? (
              <Text className="debug-page__result-error">{probeResult.error}</Text>
            ) : (
              <Text className="debug-page__result-code">{probeResult.payload}</Text>
            )}
          </View>
        ) : (
          <Text className="debug-page__meta">
            还没有执行探针。建议先测健康检查，再测豆款/烘焙商列表。
          </Text>
        )}
      </View>
    </View>
  );
}
