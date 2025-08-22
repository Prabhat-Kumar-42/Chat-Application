import { useRef, useState } from 'react';
import { View, TextInput } from 'react-native';
import { MessageStatus } from '~/types/message.type';
import { useSocket } from '~/contexts/SocketContexts';
import Button from './Button';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid'; // for unique tempId
import { useUserStore } from '~/stores/user.store';
import { useMessageStore } from '~/stores/message.store';

type Props = {
  convId: string | null;
  otherId: string;
};

export default function ChatInputBox({ convId, otherId }: Props) {
  const socket = useSocket();
  const me = useUserStore((s) => s.me)!;
  const mergeMessage = useMessageStore((s) => s.mergeMessage);

  const [input, setInput] = useState('');
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const send = () => {
    if (!input.trim() || !socket || !me) return;

    const tempId = uuidv4();

    const optimistic = {
      id: tempId, // temporary id
      tempId,
      conversationId: convId ?? '',
      fromId: me.id,
      toId: otherId,
      body: input,
      status: MessageStatus.Sending,
      createdAt: new Date().toISOString(),
    };

    // show optimistic message
    mergeMessage(otherId, optimistic);

    // emit message with tempId
    socket.emit('message:send', {
      to: otherId,
      body: input,
      tempId,
      conversationId: convId ?? '',
    });

    setInput('');

     if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
    socket.emit('typing:stop', { to: otherId });
  };

  const onTyping = (text: string) => {
    setInput(text);
    if (!socket) return;

    socket.emit('typing:start', { to: otherId });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit('typing:stop', { to: otherId });
      typingTimeout.current = null;
    }, 700);
  };

  return (
    <View className="flex-row items-center border-t border-gray-200 p-3">
      <TextInput
        value={input}
        onChangeText={onTyping}
        placeholder="Message"
        className="mr-2 flex-1 rounded-lg border bg-white px-3 py-2"
      />
      <Button title="Send" onPress={send} />
    </View>
  );
}
