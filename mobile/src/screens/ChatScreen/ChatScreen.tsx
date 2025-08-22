// src/screens/ChatScreen.tsx
import { useEffect, useRef, useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchConversationMessages } from '../../api/converstaions.api';
import MessageBubble from '../../components/MessageBubble';
import { useSocket } from '../../contexts/SocketContexts';
import ChatInputBox from '../../components/ChatInput';
import { useUserStore } from '~/stores/user.store';
import { useMessageStore } from '~/stores/message.store';
import { useTypingStore } from '~/stores/typing.store';
import { Message } from '~/types/message.type';


export default function ChatScreen() {
  const route = useRoute<any>();
  const socket = useSocket(); // matches your original usage

  const rawOtherId = route.params?.otherId;
  const otherName = route.params?.otherName as string;

  // normalize id
  const otherId = String(rawOtherId);

  const me = useUserStore((s) => s.me);
  const setMessagesFor = useMessageStore((s) => s.setMessagesFor);
  const typingFrom = useTypingStore((s) => s.typingFrom);

  const [convId, setConvId] = useState<string | null>(null);

// select only the messages list for this conversation
  const messages = useMessageStore((s) => s.messages[otherId] ?? []);

  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll on messages change
  useEffect(() => {
    console.log("🔄 Messages updated", { otherId, count: messages.length });
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, otherId]);

  // Fetch conversation messages on mount (sets convId and store under otherId)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await fetchConversationMessages(otherId);
        // NOTE: your API returns { conversationId, messages }
        console.log("📩 API fetched messages", {
          otherId,
          convId: data.conversationId,
          count: data.messages?.length,
        });

        setConvId(data.conversationId);
        // store messages under otherId so UI + socket merging works consistently
        setMessagesFor(otherId, data.messages || []);
      } catch (e) {
        console.error("❌ fetch conv messages error", e);
      }
    };

    if (otherId) fetchMessages();
  }, [otherId, setMessagesFor]);

  // Read receipts: emit only when we have convId and there are messages from the other user
  useEffect(() => {
    if (!convId) return;
    if (messages.some((m) => m.fromId === otherId)) {
      console.log("📖 Emitting message:read", { convId, otherId });
      socket?.emit("message:read", { conversationId: convId });
    }
  }, [messages.length, convId, otherId, socket]);

  // Guards (same as your original)
  if (!otherId || !otherName) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Invalid conversation</Text>
      </View>
    );
  }

  if (!me || !socket) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading chat…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="border-b border-gray-200 p-4">
          <Text className="text-lg font-semibold">{otherName}</Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m: Message, idx) => m?.id ?? `msg-${idx}`}
          renderItem={({ item }) =>
            item ? <MessageBubble meId={me.id} m={item} /> : null
          }
          contentContainerStyle={{ padding: 12 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Typing indicator */}
        {typingFrom[otherId] && (
          <Text className="text-md text-gray-500 px-4 pb-2">
            {otherName} is typing…
          </Text>
        )}

        {/* Input box (convId passed so ChatInputBox can include it on emits) */}
        {me ? <ChatInputBox convId={convId} otherId={otherId} /> : null}
      </View>
    </KeyboardAvoidingView>
  );
}