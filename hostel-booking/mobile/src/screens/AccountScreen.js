import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../AuthContext';
import { Button } from '../components';
import { C } from '../theme';

export default function AccountScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: C.ink }}>{user.name}</Text>
      <Text style={{ color: C.sub, marginTop: 4 }}>{user.email}</Text>
      <Text style={{ color: C.sub, marginTop: 4 }}>{user.role === 'admin' ? 'Hostel staff' : 'Resident'}</Text>
      <Button title="Log out" kind="ghost" onPress={logout} style={{ marginTop: 32 }} />
    </View>
  );
}
