import { View, Text } from '@tarojs/components';
import Icon from '../Icon';
import './index.scss';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = '暂无数据' }: EmptyStateProps) {
  return (
    <View className="empty-state">
      <Icon name="coffee" size={64} color="rgba(139,90,43,0.25)" className="empty-state__icon" />
      <Text className="empty-state__text">{message}</Text>
    </View>
  );
}
