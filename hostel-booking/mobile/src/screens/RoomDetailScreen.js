import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Button, ErrorState, Field, Loading, Pill } from '../components';
import { CURRENCY } from '../config';
import { isDate } from '../util';
import { C } from '../theme';

export default function RoomDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setError(''); setRoom((await api.get(`/rooms/${id}`)).data); } catch (e) { setError(errMsg(e)); }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const book = async () => {
    const e = {};
    if (!isDate(start)) e.start = 'Use the format YYYY-MM-DD';
    if (!isDate(end)) e.end = 'Use the format YYYY-MM-DD';
    else if (isDate(start) && new Date(end) <= new Date(start)) e.end = 'End date must be after the start date';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await api.post('/bookings', { roomId: id, startDate: start, endDate: end });
      Alert.alert('Request sent', 'The hostel will review your booking. Track it under My bookings.');
      setStart(''); setEnd('');
    } catch (err) { Alert.alert('Could not send request', errMsg(err)); }
    setBusy(false);
    load();
  };

  const remove = () =>
    Alert.alert('Delete this room?', 'This cannot be undone.', [
      { text: 'Keep room', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/rooms/${id}`); navigation.goBack(); } catch (e) { Alert.alert('Could not delete', errMsg(e)); }
      } },
    ]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!room) return <Loading />;
  const full = room.availabilityStatus === 'Full';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {room.image ? <Image source={{ uri: room.image }} style={{ width: '100%', height: 220 }} /> : <View style={{ height: 120, backgroundColor: C.line }} />}
      <View style={{ padding: 20 }}>
        <View style={s.row}>
          <Text style={s.title}>Room {room.roomNumber}</Text>
          <Pill text={room.availabilityStatus} />
        </View>
        <Text style={s.sub}>{room.roomType} · {room.currentOccupancy} of {room.capacity} places taken</Text>
        <Text style={s.price}>{CURRENCY}{room.pricePerMonth} per month</Text>
        {!!room.description && <Text style={s.desc}>{room.description}</Text>}

        {user.role === 'admin' ? (
          <View style={{ marginTop: 24, gap: 10 }}>
            <Button title="Edit room" onPress={() => navigation.navigate('RoomForm', { room })} />
            <Button title="Delete room" kind="danger" onPress={remove} />
          </View>
        ) : full ? (
          <Text style={s.full}>This room is full and not taking new requests.</Text>
        ) : (
          <View style={{ marginTop: 24 }}>
            <Text style={s.section}>Request a place</Text>
            <Field label="Move-in date" value={start} onChangeText={setStart} placeholder="2026-11-01" keyboardType="numbers-and-punctuation" error={errors.start} />
            <Field label="Move-out date" value={end} onChangeText={setEnd} placeholder="2027-05-01" keyboardType="numbers-and-punctuation" error={errors.end} />
            <Button title="Send request" onPress={book} loading={busy} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: C.ink },
  sub: { color: C.sub, marginTop: 6 },
  price: { color: C.accent, fontWeight: '800', fontSize: 20, marginTop: 10 },
  desc: { color: C.ink, marginTop: 14, lineHeight: 22 },
  section: { fontSize: 18, fontWeight: '700', color: C.ink, marginBottom: 12 },
  full: { marginTop: 24, color: C.danger, fontWeight: '600' },
});
