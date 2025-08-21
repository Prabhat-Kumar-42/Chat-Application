import { useState, useContext } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { login as apiLogin } from "../../api/auth.api";
import { AuthContext } from "../../contexts/AuthContext";
import { useStore } from "../../store/index";
import Button from "../../components/Button";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("alan@example.com");
  const [password, setPassword] = useState("secret123");
  const auth = useContext(AuthContext);
  const setMe = useStore((s) => s.setMe);

  const submit = async () => {
    try {
      const res = await apiLogin(email, password);
      const { token, user } = res.data;
      await auth.setToken(token);
      setMe(user);
    } catch (e: any) {
      Alert.alert("Login failed", e?.response?.data?.error || e.message);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-gray-50">
      <Text className="text-2xl font-bold mb-6">Login</Text>
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
      <Button title="Login" onPress={submit} />
      <Text
        className="text-blue-500 mt-4"
        onPress={() => navigation.navigate("Register")}
      >
        Create an account
      </Text>
    </View>
  );
}