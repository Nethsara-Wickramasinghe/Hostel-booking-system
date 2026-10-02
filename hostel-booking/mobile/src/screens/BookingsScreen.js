import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Button, Chips, Empty, ErrorState, Loading, Pill } from '../components';
import { fmtDate } from '../util';
import { C } from '../theme';

export default function BookingsScreen() {
  const { user } = useAuth();
  const admin = user.role === 'admin';
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Pending');
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const { data } = admin
        ? await api.get('/bookings', { params: filter === 'All' ? {} : { status: filter } })
        : await api.get('/bookings/mine');
      setItems(data);
    } catch (e) { setError(errMsg(e)); }
  }, [admin, filter]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const act = async (id, fn) => {
    setBusy(id);
    try { await fn(); await load(); } catch (e) { Alert.alert('Could not update booking', errMsg(e)); }
    setBusy(null);
  };
  const setStatus = (id, status) => act(id, () => api.patch(`/bookings/${id}/status`, { status }));
  const cancel = (id) =>
    Alert.alert('Cancel this booking?', 'If it was approved, the place goes back to the room.', [
      { text: 'Keep booking', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: () => act(id, () => api.patch(`/bookings/${id}/cancel`)) },
    ]);

  if (error && !items) return <ErrorState message={error} onRetry={load} />;
  if (!items) return <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {admin && <View style={{ paddingTop: 4 }}><Chips options={['Pending', 'Approved', 'Rejected', 'Cancelled', 'All']} value={filter} onChange={setFilter} /></View>}
      <FlatList
        data={items}
        keyExtractor={(b) => b._id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <Empty title={admin ? 'No requests here' : 'No bookings yet'} hint={admin ? 'New requests will show up in this list.' : 'Open a room and send a request to get started.'} />
        }
        renderItem={({ item: b }) => (
          <View style={s.card}>
            <View style={s.row}>
              <Text style={s.title}>Room {b.roomId?.roomNumber ?? '(removed)'}</Text>
              <Pill text={b.status} />
            </View>
            {admin && <Text style={s.sub}>{b.userId?.name} · {b.userId?.email}</Text>}
            <Text style={s.sub}>{b.roomId?.roomType} · {fmtDate(b.startDate)} to {fmtDate(b.endDate)}</Text>
            <Text style={s.sub}>Requested {fmtDate(b.bookingDate)}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              {admin && b.status === 'Pending' && (
                <>
                  <Button title="Approve" loading={busy === b._id} onPress={() => setStatus(b._id, 'Approved')} style={{ flex: 1 }} />
                  <Button title="Reject" kind="danger" disabled={busy === b._id} onPress={() => setStatus(b._id, 'Rejected')} style={{ flex: 1 }} />
                </>
              )}
              {(b.status === 'Approved' || (!admin && b.status === 'Pending')) && (
                <Button title="Cancel booking" kind="ghost" loading={busy === b._id} onPress={() => cancel(b._id)} style={{ flex: 1 }} />
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.line },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: C.ink },
  sub: { color: C.sub, marginTop: 4 },
});
