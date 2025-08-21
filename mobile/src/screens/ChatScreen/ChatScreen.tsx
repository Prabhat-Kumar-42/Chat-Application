import  { useEffect, useRef, useState } from "react";
import { View, FlatList, TextInput, Button, KeyboardAvoidingView, Platform, Text } from "react-native";
import { useRoute } from "@react-navigation/native";
import { fetchConversationMessages } from "../../api/converstaions.api";
import { useStore } from "../../store/index";
import MessageBubble from "../../components/MessageBubble";
import { useSocket } from "../../contexts/SocketContexts";
import { getToken } from "../../utils/storage.util";
import { MessageStatus } from "src/types/message.type";

export default function ChatScreen() {
  const route = useRoute<any>();
  const otherId = route.params.otherId as string;
  const otherName = route.params.otherName as string;
  const [input, setInput] = useState("");
  const [convId, setConvId] = useState<string | null>(null);
  const socket = useSocket();
  const me = useStore((s) => s.me)!;
  const addMessage = useStore((s) => s.addMessage);
  const replaceMessageByTempId = useStore((s) => s.replaceMessageByTempId);
  const setTyping = useStore((s) => s.setTyping);
  const typingFrom = useStore((s) => s.typingFrom);
  const markMessagesRead = useStore((s) => s.markMessagesRead);
  const messages = useStore((s) => s.messages[otherId] || []);

  // fetch messages via REST per assignment
  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchConversationMessages(otherId);
        setConvId(data.conversationId);
        (data.messages || []).forEach((m: any) => addMessage(otherId, m));
      } catch (e) {
        console.error("fetch conv messages", e);
      }
    })();
  }, [otherId]);

  // socket listeners (using singleton socket from context)
  useEffect(() => {
    if (!socket) return;
    // message from server (includes tempId when echoing)
    const onMessageNew = (m: any) => {
      if (m.tempId) replaceMessageByTempId(otherId, m.tempId, m);
      else addMessage(otherId, m);
    };
    const onTypingStart = ({ from }: { from: string }) => setTyping(from, true);
    const onTypingStop = ({ from }: { from: string }) => setTyping(from, false);
    const onMessageRead = ({ conversationId, by }: any) => {
      if (conversationId === convId) markMessagesRead(otherId);
    };

    socket.on("message:new", onMessageNew);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("message:read", onMessageRead);

    // join conversation room optionally (server doesn't require but safe)
    socket.emit("conversation:join", { conversationId: convId });

    return () => {
      socket.off("message:new", onMessageNew);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("message:read", onMessageRead);
      socket.emit("conversation:leave", { conversationId: convId });
    };
  }, [socket, convId]);

  // emit read on messages change
  useEffect(() => {
    if (convId && socket) socket.emit("message:read", { conversationId: convId });
  }, [messages.length, convId]);

  const send = async () => {
    if (!input.trim() || !socket || !me) return;
    const tempId = String(Date.now());
    const optimistic = {
      id: tempId,
      conversationId: convId ?? "",
      fromId: me.id,
      toId: otherId,
      body: input,
      status: MessageStatus.Sent,
      createdAt: new Date().toISOString(),
      tempId,
    };
    addMessage(otherId, optimistic);
    socket.emit("message:send", { to: otherId, body: input, tempId });
    setInput("");
  };

  const onTyping = (text: string) => {
    setInput(text);
    socket?.emit("typing:start", { to: otherId });
    setTimeout(() => socket?.emit("typing:stop", { to: otherId }), 700);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="bg-white flex-1">
        <View className="p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">{otherName}</Text>
          {typingFrom[otherId] && <Text className="text-sm text-gray-500">Typing…</Text>}
        </View>

        <FlatList data={messages} keyExtractor={(m: any) => m.id} renderItem={({ item }) => <MessageBubble meId={me!.id} m={item} />} contentContainerStyle={{ padding: 12 }} />

        <View className="flex-row items-center p-3 border-t border-gray-200">
          <TextInput value={input} onChangeText={onTyping} placeholder="Message" className="flex-1 border rounded-lg px-3 py-2 mr-2 bg-white" />
          <Button title="Send" onPress={send} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
