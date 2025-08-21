// src/components/Input.tsx
import { TextInput, TextInputProps } from 'react-native';

export default function Input(props: TextInputProps) {
  return <TextInput {...props} className="mb-3 rounded-lg border border-gray-300 bg-white p-3" />;
}
