import { useEffect } from "react";
import { View, FlatList } from "react-native";
import { fetchUsers } from "../../api/users.api";
import { useStore } from "../../store/index";
import UserCard from "../../components/UserCard";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Chat: { otherId: string; otherName: string };
};

export default function HomeScreen() {
  const users = useStore((s) => s.users);
  const setUsers = useStore((s) => s.setUsers);
  const presence = useStore((s) => s.presence);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchUsers();
        setUsers(data);
      } catch (e) {
        console.error("fetch users", e);
      }
    })();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            presence={presence[item.id]}
            onPress={() => nav.navigate("Chat", { otherId: item.id, otherName: item.name })}
          />
        )}
      />
    </View>
  );
}
