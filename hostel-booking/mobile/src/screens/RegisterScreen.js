import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';
import { Button, Field } from '../components';
import { C } from '../theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', adminCode: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setF({ ...f, [k]: v });

  const submit = async () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address';
    if (f.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await register({ name: f.name.trim(), email: f.email.trim(), password: f.password, adminCode: f.adminCode.trim() || undefined });
    } catch (err) { Alert.alert('Could not register', errMsg(err)); setLoading(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
      <Field label="Full name" value={f.name} onChangeText={set('name')} autoCapitalize="words" error={errors.name} />
      <Field label="Email" value={f.email} onChangeText={set('email')} keyboardType="email-address" error={errors.email} />
      <Field label="Password" value={f.password} onChangeText={set('password')} secureTextEntry error={errors.password} />
      <Field label="Confirm password" value={f.confirm} onChangeText={set('confirm')} secureTextEntry error={errors.confirm} />
      <Field label="Staff code (optional)" value={f.adminCode} onChangeText={set('adminCode')} placeholder="Only for hostel staff" />
      <Button title="Create account" onPress={submit} loading={loading} />
    </ScrollView>
  );
}
