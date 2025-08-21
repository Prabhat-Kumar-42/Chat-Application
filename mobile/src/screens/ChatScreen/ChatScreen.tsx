// src/screens/ChatScreen.tsx

import { useEffect, useRef, useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchConversationMessages } from '../../api/converstaions.api';
import { useStore } from '../../store/index';
import MessageBubble from '../../components/MessageBubble';
import { useSocket } from '../../contexts/SocketContexts';
import ChatInputBox from '../../components/ChatInput';
import { Message } from '~/types/message.type';

export default function ChatScreen() {
  const route = useRoute<any>();
  const otherId = route.params.otherId as string;
  const otherName = route.params.otherName as string;

  const socket = useSocket();
  const me = useStore((s) => s.me)!;
  const messages = useStore((s) => s.messages[otherId]) || [];
  const typingFrom = useStore((s) => s.typingFrom);
  const setMessagesFor = useStore((s) => s.setMessagesFor);
  const setTyping = useStore((s) => s.setTyping);
  const mergeMessage = useStore((s) => s.mergeMessage);

  const [convId, setConvId] = useState<string | null>(null);

  // FlatList ref
  const flatListRef = useRef<FlatList>(null);

  // Keep a ref for debounce timeout
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Fetch past messages when screen mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await fetchConversationMessages(otherId);
        setConvId(data.conversationId);
        setMessagesFor(otherId, data.messages || []);
      } catch (e) {
        console.error('fetch conv messages', e);
      }
    };
    if (otherId) fetchMessages();
  }, [otherId]);

  // Emit read when new messages come in
  useEffect(() => {
    if (convId && socket && messages.some((m) => m.fromId === otherId)) {
      socket.emit('message:read', { conversationId: convId });
    }
  }, [messages.length, convId, socket]);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceive = (msg: Message) => {
      if (msg.fromId === otherId || msg.toId === otherId) {
        mergeMessage(otherId, msg);
      }
    };

    const handleTypingStart = ({ from }: { from: string }) => {
      if (from === otherId) {
        // show typing only if it's the person we are chatting with
        setTyping(from, true);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
          setTyping(from, false);
        }, 1000);
      }
    };

    const handleTypingStop = ({ from }: { from: string }) => {
      if (from === otherId) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setTyping(from, false);
      }
    };

    socket.on('message:new', handleMessageReceive);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleMessageReceive);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, otherId, convId, me.id]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="border-b border-gray-200 p-4">
          <Text className="text-lg font-semibold">{otherName}</Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m: any) => m.id}
          renderItem={({ item }) => <MessageBubble meId={me.id} m={item} />}
          contentContainerStyle={{ padding: 12 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {typingFrom[otherId] && (
          <Text className="text-md text-gray-500"> {otherName} is typing…</Text>
        )}

        {/* Input Box */}
        <ChatInputBox convId={convId} otherId={otherId} />
      </View>
    </KeyboardAvoidingView>
  );
}
