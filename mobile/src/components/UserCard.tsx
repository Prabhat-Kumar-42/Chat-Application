// src/components/UserCard.tsx
import { View, Text, TouchableOpacity } from "react-native";
import type { User } from "../types/user.type";
import { formatDistanceToNow } from 'date-fns';

export default function UserCard({
  user,
  presence,
  onPress,
}: {
  user: User;
  presence?: "online" | "offline";
  onPress: () => void;
}) {
   const lastSeenText =
    presence === 'offline' && user.lastSeenAt
      ? `Last seen ${formatDistanceToNow(new Date(user.lastSeenAt), { addSuffix: true })}`
      : '';
  return (
    <TouchableOpacity onPress={onPress} className="px-4 py-3 border-b border-gray-200">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-base font-semibold">{user.name}</Text>
          <Text className="text-sm text-gray-500">
            {user.email}
            {lastSeenText ? ` • ${lastSeenText}` : ''}
          </Text>
        </View>
        <View>
          <View
            className={`w-3 h-3 rounded-full ${
              presence === "online" ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
