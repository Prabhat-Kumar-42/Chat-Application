// src/components/Button.tsx
import { TouchableOpacity, Text } from 'react-native';

export default function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity className="rounded-lg bg-blue-600 p-3" onPress={onPress}>
      <Text className="text-center font-semibold text-white">{title}</Text>
    </TouchableOpacity>
  );
}
