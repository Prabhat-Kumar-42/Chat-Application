import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { SocketProvider } from './src/contexts/SocketContexts';
import AppNavigator from './src/navigations/AppNavigator';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SocketProvider>
    </AuthProvider>
  );
}
