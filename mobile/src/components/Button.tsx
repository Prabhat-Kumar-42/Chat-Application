import { TouchableOpacity, Text } from "react-native";

export default function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity className="bg-blue-600 p-3 rounded-lg" onPress={onPress}>
      <Text className="text-white text-center font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
