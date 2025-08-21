import { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/AuthScreens/LoginScreen";
import RegisterScreen from "../screens/AuthScreens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import { AuthContext } from "../contexts/AuthContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {!token ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
