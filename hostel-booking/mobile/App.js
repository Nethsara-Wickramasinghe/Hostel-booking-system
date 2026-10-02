import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/AuthContext';
import { Loading } from './src/components';
import { C } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RoomsScreen from './src/screens/RoomsScreen';
import RoomDetailScreen from './src/screens/RoomDetailScreen';
import RoomFormScreen from './src/screens/RoomFormScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import AccountScreen from './src/screens/AccountScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const header = { headerTintColor: C.ink, headerStyle: { backgroundColor: C.bg }, headerShadowVisible: false };

function MainTabs() {
  const { user } = useAuth();
  const opts = { ...header, tabBarActiveTintColor: C.accent, tabBarIcon: () => null, tabBarLabelStyle: { fontSize: 14, fontWeight: '600' } };
  return (
    <Tabs.Navigator screenOptions={opts}>
      <Tabs.Screen name="Rooms" component={RoomsScreen} />
      <Tabs.Screen name="Bookings" component={BookingsScreen} options={{ title: user.role === 'admin' ? 'Requests' : 'My bookings' }} />
      <Tabs.Screen name="Account" component={AccountScreen} />
    </Tabs.Navigator>
  );
}

function Root() {
  const { user, ready } = useAuth();
  if (!ready) return <Loading />;
  return (
    <NavigationContainer>
      {user ? (
        // Protected area: only mounted when a user is signed in
        <Stack.Navigator screenOptions={header}>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="RoomDetail" component={RoomDetailScreen} options={{ title: 'Room' }} />
          <Stack.Screen name="RoomForm" component={RoomFormScreen} options={({ route }) => ({ title: route.params?.room ? 'Edit room' : 'New room' })} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ ...header, headerTitle: '' }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
