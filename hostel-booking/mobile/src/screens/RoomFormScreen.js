import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api, { errMsg } from '../api';
import { Button, Chips, Field } from '../components';
import { C } from '../theme';

export default function RoomFormScreen({ route, navigation }) {
  const room = route.params?.room;
  const [f, setF] = useState({
    roomNumber: room?.roomNumber || '', roomType: room?.roomType || 'Single',
    pricePerMonth: room ? String(room.pricePerMonth) : '', capacity: room ? String(room.capacity) : '',
    description: room?.description || '',
  });
  const [asset, setAsset] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setF({ ...f, [k]: v });

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled) return;
    const a = res.assets[0];
    if (a.fileSize && a.fileSize > 2 * 1024 * 1024) return Alert.alert('Image too large', 'Choose an image under 2 MB.');
    setAsset(a);
  };

  const submit = async () => {
    const e = {};
    if (!f.roomNumber.trim()) e.roomNumber = 'Room number is required';
    if (f.pricePerMonth === '' || isNaN(f.pricePerMonth) || Number(f.pricePerMonth) < 0) e.pricePerMonth = 'Enter a price of 0 or more';
    if (!/^\d+$/.test(f.capacity) || Number(f.capacity) < 1 || Number(f.capacity) > 10) e.capacity = 'Enter a whole number from 1 to 10';
    setErrors(e);
    if (Object.keys(e).length) return;

    const fd = new FormData();
    Object.entries({ ...f, roomNumber: f.roomNumber.trim() }).forEach(([k, v]) => fd.append(k, v));
    if (asset) {
      const type = asset.mimeType === 'image/jpg' ? 'image/jpeg' : asset.mimeType || 'image/jpeg';
      fd.append('image', { uri: asset.uri, name: `room.${type.split('/')[1]}`, type });
    }
    setLoading(true);
    try {
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (room) await api.put(`/rooms/${room._id}`, fd, cfg); else await api.post('/rooms', fd, cfg);
      navigation.navigate('Main', { screen: 'Rooms' });
    } catch (err) { Alert.alert('Could not save room', errMsg(err)); }
    setLoading(false);
  };

  const preview = asset?.uri || room?.image;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {preview ? <Image source={{ uri: preview }} style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 10 }} /> : null}
      <Button title={preview ? 'Change photo' : 'Add photo'} kind="ghost" onPress={pick} style={{ marginBottom: 20 }} />
      <Field label="Room number" value={f.roomNumber} onChangeText={set('roomNumber')} error={errors.roomNumber} />
      <Text style={{ fontWeight: '600', color: C.ink, marginBottom: 6 }}>Room type</Text>
      <View style={{ marginHorizontal: -16, marginBottom: 6 }}>
        <Chips options={['Single', 'Double', 'Triple']} value={f.roomType} onChange={set('roomType')} />
      </View>
      <Field label="Price per month" value={f.pricePerMonth} onChangeText={set('pricePerMonth')} keyboardType="decimal-pad" error={errors.pricePerMonth} />
      <Field label="Capacity (places)" value={f.capacity} onChangeText={set('capacity')} keyboardType="number-pad" error={errors.capacity} />
      <Field label="Description" value={f.description} onChangeText={set('description')} multiline autoCapitalize="sentences" />
      <Button title={room ? 'Save changes' : 'Create room'} onPress={submit} loading={loading} />
    </ScrollView>
  );
}
