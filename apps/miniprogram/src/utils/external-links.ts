import Taro from '@tarojs/taro';

function copyLink(url: string, label: string): void {
  Taro.setClipboardData({
    data: url,
    success: () => {
      Taro.showToast({
        title: `${label}链接已复制`,
        icon: 'none',
      });
    },
    fail: () => {
      Taro.showToast({
        title: `请手动复制${label}链接`,
        icon: 'none',
      });
    },
  });
}

export function openExternalLink(url: string, label: string): void {
  const normalized = url.trim();
  if (!normalized) {
    Taro.showToast({
      title: `${label}链接暂不可用`,
      icon: 'none',
    });
    return;
  }

  if (Taro.getEnv() === Taro.ENV_TYPE.WEB && typeof window !== 'undefined') {
    window.open(normalized, '_blank', 'noopener,noreferrer');
    Taro.showToast({
      title: `已打开${label}`,
      icon: 'none',
    });
    return;
  }

  copyLink(normalized, label);
}
