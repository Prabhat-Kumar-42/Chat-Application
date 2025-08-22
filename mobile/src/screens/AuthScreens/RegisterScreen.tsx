// src/screens/RegisterScreen.tsx
import { useState, useContext } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { register as apiRegister } from "../../api/auth.api";
import { AuthContext } from "../../contexts/AuthContext";
import Button from "../../components/Button";
import { useUserStore } from "~/stores/user.store";


export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useContext(AuthContext);
  const setMe = useUserStore((s) => s.setMe);

  const submit = async () => {
    try {
      const res = await apiRegister(name, email, password);
      const { token, user } = res.data;
      await auth.setToken(token);
      setMe(user);
    } catch (e: any) {
      Alert.alert("Register failed", e?.response?.data?.error || e.message);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-gray-50">
      <Text className="text-2xl font-bold mb-6">Create account</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        className="w-full bg-white p-3 rounded-lg mb-4 border"
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full bg-white p-3 rounded-lg mb-4 border"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        className="w-full bg-white p-3 rounded-lg mb-6 border"
      />
      <Button title="Create account" onPress={submit} />
      <Text
        className="text-blue-500 mt-4"
        onPress={() => navigation.navigate("Login")}
      >
        Already have an account? Login
      </Text>
    </View>
  );
}
