// src/screens/HomeScreen.tsx
import { useEffect, useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchUsers } from '../../api/users.api';
import UserCard from '../../components/UserCard';
import { useUserStore } from '~/stores/user.store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigations/AppNavigator';

export default function HomeScreen() {
  const users = useUserStore((s) => s.users);
  const setUsers = useUserStore((s) => s.setUsers);
  const presence = useUserStore((s) => s.presence);

  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchUsers();
        setUsers(data);
      } catch (e) {
        console.error('fetch users', e);
      }
    })();
  }, [setUsers]);

  // Sort users: online first
  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        const aOnline = presence[a.id] === 'online' ? 1 : 0;
        const bOnline = presence[b.id] === 'online' ? 1 : 0;
        return bOnline - aOnline; // online users first
      }),
    [users, presence]
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={sortedUsers}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            presence={presence[item.id]}
            onPress={() => nav.navigate('Chat', { otherId: item.id, otherName: item.name })}
          />
        )}
      />
    </View>
  );
}
