import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Button, Chips, Empty, ErrorState, Loading, Pill } from '../components';
import { CURRENCY } from '../config';
import { C } from '../theme';

export default function RoomsScreen({ navigation }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState(null);
  const [error, setError] = useState('');
  const [type, setType] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const { data } = await api.get('/rooms', { params: type === 'All' ? {} : { roomType: type } });
      setRooms(data);
    } catch (e) { setError(errMsg(e)); }
  }, [type]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (error && !rooms) return <ErrorState message={error} onRetry={load} />;
  if (!rooms) return <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Chips options={['All', 'Single', 'Double', 'Triple']} value={type} onChange={setType} />
      <FlatList
        data={rooms}
        keyExtractor={(r) => r._id}
        refreshing={refreshing}
        onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 90, flexGrow: 1 }}
        ListEmptyComponent={
          <Empty title="No rooms yet" hint={user.role === 'admin' ? 'Add the first room to start taking bookings.' : 'Rooms will appear here once the hostel adds them.'} />
        }
        renderItem={({ item: r }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('RoomDetail', { id: r._id })}>
            {r.image ? <Image source={{ uri: r.image }} style={s.img} /> : <View style={[s.img, { backgroundColor: C.line }]} />}
            <View style={{ padding: 14 }}>
              <View style={s.row}>
                <Text style={s.title}>Room {r.roomNumber}</Text>
                <Pill text={r.availabilityStatus} />
              </View>
              <Text style={s.sub}>{r.roomType} · {r.currentOccupancy}/{r.capacity} places taken</Text>
              <Text style={s.price}>{CURRENCY}{r.pricePerMonth} <Text style={s.sub}>per month</Text></Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {user.role === 'admin' && (
        <Button title="Add room" onPress={() => navigation.navigate('RoomForm')} style={s.fab} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.line },
  img: { width: '100%', height: 150 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: C.ink },
  sub: { color: C.sub, marginTop: 4, fontWeight: '400' },
  price: { color: C.accent, fontWeight: '800', fontSize: 16, marginTop: 6 },
  fab: { position: 'absolute', right: 16, bottom: 20, paddingHorizontal: 24, elevation: 4 },
});
