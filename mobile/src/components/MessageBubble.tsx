import { View, Text } from "react-native";
import { MessageStatus, type Message } from "../types/message.type";
import React from "react";

const MessageBubble = React.memo(
  ({ meId, m }: { meId: string; m: Message }) => {
    const mine = m.fromId === meId;

    // choose tick symbol
    let tick = "•"; // default = pending
    if (m.status === MessageStatus.Sent) tick = "✓";
    if (m.status === MessageStatus.Read) tick = "✓✓";

    return (
      <View className={`px-3 my-2 ${mine ? "items-end" : "items-start"}`}>
        <View
          className={`${
            mine ? "bg-blue-500" : "bg-gray-100"
          } p-3 rounded-2xl max-w-[75%]`}
        >
          <Text className={`${mine ? "text-white" : "text-black"}`}>
            {m.body}
          </Text>

          {mine && (
            <Text className="text-xs opacity-60 mt-2 text-right">{tick}</Text>
          )}

          <Text
            className={`text-[10px] ${
              mine ? "text-white/70" : "text-black/50"
            } mt-1`}
          >
            {new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  }
);

export default MessageBubble;