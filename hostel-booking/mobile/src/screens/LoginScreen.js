import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';
import { Button, Field } from '../components';
import { C } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Enter your password';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try { await login(email.trim(), password); } catch (err) { Alert.alert('Could not log in', errMsg(err)); setLoading(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 30, fontWeight: '800', color: C.ink }}>Find your bed</Text>
      <Text style={{ color: C.sub, marginTop: 6, marginBottom: 28 }}>Log in to browse rooms and request a place.</Text>
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email} />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
      <Button title="Log in" onPress={submit} loading={loading} />
      <Button title="Create an account" kind="ghost" onPress={() => navigation.navigate('Register')} style={{ marginTop: 12 }} />
    </ScrollView>
  );
}
