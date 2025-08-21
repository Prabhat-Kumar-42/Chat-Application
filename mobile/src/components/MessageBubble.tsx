import { View, Text } from "react-native";
import type { Message } from "../types/message.type";

export default function MessageBubble({ meId, m }: { meId: string; m: Message }) {
  const mine = m.fromId === meId;
  return (
    <View className={`px-3 my-2 ${mine ? "items-end" : "items-start"}`}>
      <View className={`${mine ? "bg-blue-500" : "bg-gray-100"} p-3 rounded-2xl max-w-3/4`}>
        <Text className={`${mine ? "text-white" : "text-black"}`}>{m.body}</Text>
        {mine && <Text className="text-xs opacity-60 mt-2 text-right">{m.status === "read" ? "✓✓" : m.status === "delivered" ? "✓" : "•"}</Text>}
        <Text className={`text-[10px] ${mine ? "text-white/70" : "text-black/50"} mt-1`}>{new Date(m.createdAt).toLocaleTimeString()}</Text>
      </View>
    </View>
  );
}
