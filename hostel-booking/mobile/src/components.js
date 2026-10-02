import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { C, statusColor } from './theme';

export const Button = ({ title, onPress, loading, disabled, kind = 'primary', style }) => {
  const color = kind === 'ghost' ? C.accent : '#fff';
  const bg = kind === 'primary' ? C.accent : kind === 'danger' ? C.danger : 'transparent';
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={loading || disabled}
      onPress={onPress}
      style={[s.btn, { backgroundColor: bg, borderColor: kind === 'ghost' ? C.accent : bg, opacity: disabled ? 0.5 : 1 }, style]}
    >
      {loading ? <ActivityIndicator color={color} /> : <Text style={[s.btnText, { color }]}>{title}</Text>}
    </TouchableOpacity>
  );
};

export const Field = ({ label, error, ...props }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput placeholderTextColor="#9AA7AD" autoCapitalize="none" {...props} style={[s.input, props.multiline && { height: 90, textAlignVertical: 'top' }, !!error && { borderColor: C.danger }]} />
    {!!error && <Text style={s.error}>{error}</Text>}
  </View>
);

export const Loading = () => (
  <View style={s.center}><ActivityIndicator size="large" color={C.accent} /></View>
);

export const Empty = ({ title, hint, children }) => (
  <View style={s.center}>
    <Text style={s.emptyTitle}>{title}</Text>
    {!!hint && <Text style={s.emptyHint}>{hint}</Text>}
    {children}
  </View>
);

export const ErrorState = ({ message, onRetry }) => (
  <View style={s.center}>
    <Text style={s.emptyTitle}>Something went wrong</Text>
    <Text style={s.emptyHint}>{message}</Text>
    <Button title="Try again" onPress={onRetry} kind="ghost" style={{ marginTop: 16, alignSelf: 'center', paddingHorizontal: 24 }} />
  </View>
);

export const Pill = ({ text }) => (
  <View style={{ backgroundColor: statusColor[text] + '22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
    <Text style={{ color: statusColor[text], fontWeight: '700', fontSize: 12 }}>{text}</Text>
  </View>
);

export const Chips = ({ options, value, onChange }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}>
    {options.map((o) => (
      <TouchableOpacity key={o} onPress={() => onChange(o)} style={[s.chip, value === o && { backgroundColor: C.ink, borderColor: C.ink }]}>
        <Text style={{ color: value === o ? '#fff' : C.ink, fontWeight: '600' }}>{o}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const s = StyleSheet.create({
  btn: { minHeight: 48, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  btnText: { fontSize: 16, fontWeight: '700' },
  label: { color: C.ink, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.line, borderRadius: 10, paddingHorizontal: 12, height: 48, fontSize: 16, color: C.ink },
  error: { color: C.danger, marginTop: 4, fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: C.bg },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.ink, textAlign: 'center' },
  emptyHint: { color: C.sub, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  chip: { paddingHorizontal: 14, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
});
