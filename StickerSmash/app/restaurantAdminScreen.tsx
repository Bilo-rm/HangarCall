import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import API from '@/services/api';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  image: string;
  suspended: boolean;
}

export default function RestaurantAdminScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newData, setNewData] = useState({ name: '', location: '', image: '' });

  const fetchRestaurants = async () => {
    const res = await API.get('/restaurants');
    setRestaurants(res.data);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleAdd = async () => {
    try {
      await API.post('/restaurants', newData);
      setModalVisible(false);
      setNewData({ name: '', location: '', image: '' });
      fetchRestaurants();
    } catch (err) {
      Alert.alert('Error adding restaurant');
    }
  };

  const handleDelete = async (id: string) => {
    await API.delete(`/restaurants/${id}`);
    fetchRestaurants();
  };

  const handleSuspend = async (id: string) => {
    await API.patch(`/restaurants/${id}/suspend`);
    fetchRestaurants();
  };

  const handleEdit = async (id: string) => {
    const restaurant = restaurants.find(r => r.id === id);
    if (!restaurant) return;
    setNewData(restaurant);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    await API.put(`/restaurants/${newData.id}`, newData);
    setModalVisible(false);
    fetchRestaurants();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <TouchableOpacity onPress={() => setModalVisible(true)} style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 10, marginBottom: 10 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>➕ Add Restaurant</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={{ padding: 10, backgroundColor: '#eee', marginBottom: 10, borderRadius: 10 }}>
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
            <Text>{item.location}</Text>
            {item.image ? <Image source={{ uri: item.image }} style={{ width: 100, height: 100, borderRadius: 8 }} /> : null}
            <Text>Status: {item.suspended ? 'Suspended ❌' : 'Active ✅'}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity onPress={() => handleEdit(item.id)} style={{ backgroundColor: '#2196F3', padding: 8, borderRadius: 5 }}>
                <Text style={{ color: 'white' }}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ backgroundColor: '#f44336', padding: 8, borderRadius: 5 }}>
                <Text style={{ color: 'white' }}>❌ Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSuspend(item.id)} style={{ backgroundColor: '#FF9800', padding: 8, borderRadius: 5 }}>
                <Text style={{ color: 'white' }}>{item.suspended ? '✅ Activate' : '🚫 Suspend'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
          <Text style={{ fontSize: 24, marginBottom: 20 }}>Restaurant Details</Text>
          <TextInput
            placeholder="Name"
            value={newData.name}
            onChangeText={(text) => setNewData({ ...newData, name: text })}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Location"
            value={newData.location}
            onChangeText={(text) => setNewData({ ...newData, location: text })}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Image URL"
            value={newData.image}
            onChangeText={(text) => setNewData({ ...newData, image: text })}
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />

          <TouchableOpacity
            onPress={newData.id ? handleUpdate : handleAdd}
            style={{ backgroundColor: '#4CAF50', padding: 15, borderRadius: 10 }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>{newData.id ? 'Update' : 'Add'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setModalVisible(false); setNewData({ name: '', location: '', image: '' }); }} style={{ marginTop: 10 }}>
            <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
