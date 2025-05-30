import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Modal, 
  Alert, 
  ScrollView,
  StyleSheet,
  Picker
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // You'll need to install this

const API_URL = "http://172.20.35.169:5000";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'restaurant' | 'user';
  OwnedRestaurant?: Restaurant;
}

interface Restaurant {
  id: string;
  name: string;
  location: string;
  image: string;
  suspended: boolean;
  userId?: string;
  Owner?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  suspendedRestaurants: number;
  restaurantUsers: number;
  regularUsers: number;
  adminUsers: number;
}

type TabType = 'dashboard' | 'users' | 'restaurants';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Modal states
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [restaurantModalVisible, setRestaurantModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  
  // Form data
  const [newUserData, setNewUserData] = useState({ 
    id: '', 
    name: '', 
    email: '', 
    password: '', 
    role: 'user' as 'admin' | 'restaurant' | 'user'
  });
  const [newRestaurantData, setNewRestaurantData] = useState({ 
    id: '', 
    name: '', 
    location: '', 
    image: '', 
    userId: '' 
  });
  const [assignData, setAssignData] = useState({ 
    restaurantId: '', 
    userId: '' 
  });

  // Setup axios interceptor for authentication
  useEffect(() => {
    const setupAxiosInterceptor = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken'); // Get token from storage
        
        if (token) {
          // Set default authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          axios.defaults.baseURL = API_URL;
        } else {
          Alert.alert('Error', 'No authentication token found. Please login again.');
          // Navigate to login screen or handle authentication
          return;
        }
      } catch (error) {
        console.error('Error setting up auth:', error);
        Alert.alert('Error', 'Authentication setup failed');
      }
    };

    setupAxiosInterceptor();
  }, []);

  // Fetch functions with proper error handling
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/dashboard/stats`);
      setStats(res.data.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      if (err.response?.status === 401) {
        Alert.alert('Error', 'Authentication failed. Please login again.');
        // Handle logout or redirect to login
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`);
      setUsers(res.data.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        Alert.alert('Error', 'Authentication failed. Please login again.');
      }
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/restaurants`);
      setRestaurants(res.data.data);
    } catch (err: any) {
      console.error('Error fetching restaurants:', err);
      if (err.response?.status === 401) {
        Alert.alert('Error', 'Authentication failed. Please login again.');
      }
    }
  };

  const fetchUnassignedUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users/unassigned-restaurant`);
      setUnassignedUsers(res.data.data);
    } catch (err: any) {
      console.error('Error fetching unassigned users:', err);
      if (err.response?.status === 401) {
        Alert.alert('Error', 'Authentication failed. Please login again.');
      }
    }
  };

  useEffect(() => {
    // Add a small delay to ensure axios is configured
    const timer = setTimeout(() => {
      fetchStats();
      fetchUsers();
      fetchRestaurants();
      fetchUnassignedUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // User management functions
  const handleAddUser = async () => {
    try {
      await axios.post(`${API_URL}/admin/users`, newUserData);
      setUserModalVisible(false);
      resetUserForm();
      fetchUsers();
      fetchStats();
      fetchUnassignedUsers(); // Refresh unassigned users when new user is created
      Alert.alert('Success', 'User created successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Error creating user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`${API_URL}/admin/users/${newUserData.id}`, {
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role
      });
      setUserModalVisible(false);
      resetUserForm();
      fetchUsers();
      fetchUnassignedUsers(); // Refresh unassigned users when user role changes
      Alert.alert('Success', 'User updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Error updating user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/admin/users/${id}`);
              fetchUsers();
              fetchStats();
              fetchUnassignedUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Error deleting user');
            }
          }
        }
      ]
    );
  };

  const handleEditUser = (user: User) => {
    setNewUserData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setUserModalVisible(true);
  };

  // Restaurant management functions
  const handleAddRestaurant = async () => {
    // Validate that a user is selected for new restaurants
    if (!newRestaurantData.userId) {
      Alert.alert('Error', 'Please select a restaurant owner. Every restaurant must be assigned to a user with restaurant role.');
      return;
    }

    try {
      await axios.post(`${API_URL}/admin/restaurants`, newRestaurantData);
      setRestaurantModalVisible(false);
      resetRestaurantForm();
      fetchRestaurants();
      fetchUnassignedUsers();
      fetchStats();
      Alert.alert('Success', 'Restaurant created and assigned successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Error creating restaurant');
    }
  };

  const handleUpdateRestaurant = async () => {
    try {
      await axios.put(`${API_URL}/admin/restaurants/${newRestaurantData.id}`, {
        name: newRestaurantData.name,
        location: newRestaurantData.location,
        image: newRestaurantData.image
      });
      setRestaurantModalVisible(false);
      resetRestaurantForm();
      fetchRestaurants();
      Alert.alert('Success', 'Restaurant updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Error updating restaurant');
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this restaurant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/admin/restaurants/${id}`);
              fetchRestaurants();
              fetchUnassignedUsers();
              fetchStats();
              Alert.alert('Success', 'Restaurant deleted successfully');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Error deleting restaurant');
            }
          }
        }
      ]
    );
  };

  const handleToggleSuspension = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/admin/restaurants/${id}/toggle-suspension`);
      fetchRestaurants();
      Alert.alert('Success', 'Restaurant status updated');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Error updating restaurant status');
    }
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setNewRestaurantData({
      id: restaurant.id,
      name: restaurant.name,
      location: restaurant.location,
      image: restaurant.image,
      userId: restaurant.userId || ''
    });
    setRestaurantModalVisible(true);
  };

  // Assignment functions
  const handleAssignRestaurant = async () => {
    try {
      await axios.post(`${API_URL}/admin/restaurants/assign`, assignData);
      setAssignModalVisible(false);
      resetAssignForm();
      fetchRestaurants();
      fetchUnassignedUsers();
      Alert.alert('Success', 'Restaurant assigned successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Error assigning restaurant');
    }
  };

  // Reset form functions
  const resetUserForm = () => {
    setNewUserData({ id: '', name: '', email: '', password: '', role: 'user' });
  };

  const resetRestaurantForm = () => {
    setNewRestaurantData({ id: '', name: '', location: '', image: '', userId: '' });
  };

  const resetAssignForm = () => {
    setAssignData({ restaurantId: '', userId: '' });
  };

  // Check if restaurant creation is possible
  const canCreateRestaurant = () => {
    return unassignedUsers.length > 0;
  };

  // Render functions (keeping the same UI)
  const renderDashboard = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>📊 Dashboard Statistics</Text>
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalRestaurants}</Text>
            <Text style={styles.statLabel}>Total Restaurants</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.suspendedRestaurants}</Text>
            <Text style={styles.statLabel}>Suspended Restaurants</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.adminUsers}</Text>
            <Text style={styles.statLabel}>Admin Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.restaurantUsers}</Text>
            <Text style={styles.statLabel}>Restaurant Users</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        onPress={() => setUserModalVisible(true)}
        style={[styles.addButton, { backgroundColor: '#4CAF50' }]}
      >
        <Text style={styles.addButtonText}>👤 Add User</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>{item.email}</Text>
            <Text style={styles.roleText}>Role: {item.role.toUpperCase()}</Text>
            {item.OwnedRestaurant && (
              <Text style={styles.restaurantText}>
                Owns: {item.OwnedRestaurant.name}
              </Text>
            )}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleEditUser(item)}
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              >
                <Text style={styles.actionButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteUser(item.id)}
                style={[styles.actionButton, { backgroundColor: '#f44336' }]}
              >
                <Text style={styles.actionButtonText}>❌ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderRestaurants = () => (
    <View style={styles.tabContent}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => {
            if (!canCreateRestaurant()) {
              Alert.alert(
                'Cannot Create Restaurant', 
                'No available restaurant users. Please create a user with "restaurant" role first, or assign existing restaurants to current restaurant users.'
              );
              return;
            }
            setRestaurantModalVisible(true);
          }}
          style={[
            styles.addButton, 
            { 
              backgroundColor: canCreateRestaurant() ? '#4CAF50' : '#9E9E9E', 
              flex: 1, 
              marginRight: 5 
            }
          ]}
          disabled={!canCreateRestaurant()}
        >
          <Text style={styles.addButtonText}>🏪 Add Restaurant</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setAssignModalVisible(true)}
          style={[styles.addButton, { backgroundColor: '#FF9800', flex: 1, marginLeft: 5 }]}
        >
          <Text style={styles.addButtonText}>🔗 Assign</Text>
        </TouchableOpacity>
      </View>

      {!canCreateRestaurant() && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ No unassigned restaurant users available. Create users with "restaurant" role to add new restaurants.
          </Text>
        </View>
      )}

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>{item.location}</Text>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.restaurantImage} />
            ) : null}
            <Text style={styles.statusText}>
              Status: {item.suspended ? 'Suspended ❌' : 'Active ✅'}
            </Text>
            {item.Owner && (
              <Text style={styles.ownerText}>
                Owner: {item.Owner.name} ({item.Owner.email})
              </Text>
            )}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleEditRestaurant(item)}
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              >
                <Text style={styles.actionButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteRestaurant(item.id)}
                style={[styles.actionButton, { backgroundColor: '#f44336' }]}
              >
                <Text style={styles.actionButtonText}>❌ Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleToggleSuspension(item.id)}
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
              >
                <Text style={styles.actionButtonText}>
                  {item.suspended ? '✅ Activate' : '🚫 Suspend'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            📊 Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            👥 Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'restaurants' && styles.activeTab]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Text style={[styles.tabText, activeTab === 'restaurants' && styles.activeTabText]}>
            🏪 Restaurants
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'restaurants' && renderRestaurants()}

      {/* User Modal */}
      <Modal visible={userModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {newUserData.id ? 'Edit User' : 'Add User'}
          </Text>
          
          <TextInput
            placeholder="Name"
            value={newUserData.name}
            onChangeText={(text) => setNewUserData({ ...newUserData, name: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Email"
            value={newUserData.email}
            onChangeText={(text) => setNewUserData({ ...newUserData, email: text })}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          {!newUserData.id && (
            <TextInput
              placeholder="Password"
              value={newUserData.password}
              onChangeText={(text) => setNewUserData({ ...newUserData, password: text })}
              style={styles.input}
              secureTextEntry
            />
          )}
          
          <Picker
            selectedValue={newUserData.role}
            onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}
            style={styles.picker}
          >
            <Picker.Item label="User" value="user" />
            <Picker.Item label="Restaurant" value="restaurant" />
            <Picker.Item label="Admin" value="admin" />
          </Picker>

          <TouchableOpacity
            onPress={newUserData.id ? handleUpdateUser : handleAddUser}
            style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
          >
            <Text style={styles.modalButtonText}>
              {newUserData.id ? 'Update' : 'Add'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setUserModalVisible(false);
              resetUserForm();
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Restaurant Modal */}
      <Modal visible={restaurantModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {newRestaurantData.id ? 'Edit Restaurant' : 'Add Restaurant'}
          </Text>
          
          <TextInput
            placeholder="Restaurant Name"
            value={newRestaurantData.name}
            onChangeText={(text) => setNewRestaurantData({ ...newRestaurantData, name: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Location"
            value={newRestaurantData.location}
            onChangeText={(text) => setNewRestaurantData({ ...newRestaurantData, location: text })}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Image URL"
            value={newRestaurantData.image}
            onChangeText={(text) => setNewRestaurantData({ ...newRestaurantData, image: text })}
            style={styles.input}
          />

          {!newRestaurantData.id && (
            <>
              <Text style={styles.pickerLabel}>Assign to Restaurant Owner (Required):</Text>
              {unassignedUsers.length > 0 ? (
                <Picker
                  selectedValue={newRestaurantData.userId}
                  onValueChange={(value) => setNewRestaurantData({ ...newRestaurantData, userId: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Select restaurant owner..." value="" />
                  {unassignedUsers.map((user) => (
                    <Picker.Item key={user.id} label={`${user.name} (${user.email})`} value={user.id} />
                  ))}
                </Picker>
              ) : (
                <Text style={styles.noUsersText}>
                  No unassigned restaurant users available. Please create a user with "restaurant" role first.
                </Text>
              )}
            </>
          )}

          <TouchableOpacity
            onPress={newRestaurantData.id ? handleUpdateRestaurant : handleAddRestaurant}
            style={[
              styles.modalButton, 
              { 
                backgroundColor: (newRestaurantData.id || newRestaurantData.userId) ? '#4CAF50' : '#9E9E9E' 
              }
            ]}
            disabled={!newRestaurantData.id && !newRestaurantData.userId}
          >
            <Text style={styles.modalButtonText}>
              {newRestaurantData.id ? 'Update' : 'Add'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRestaurantModalVisible(false);
              resetRestaurantForm();
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Assign Restaurant Modal */}
      <Modal visible={assignModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Assign Restaurant to User</Text>
          
          <Text style={styles.pickerLabel}>Select Restaurant:</Text>
          <Picker
            selectedValue={assignData.restaurantId}
            onValueChange={(value) => setAssignData({ ...assignData, restaurantId: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select a restaurant..." value="" />
            {restaurants.filter(r => !r.Owner).map((restaurant) => (
              <Picker.Item key={restaurant.id} label={restaurant.name} value={restaurant.id} />
            ))}
          </Picker>

          <Text style={styles.pickerLabel}>Select User:</Text>
          <Picker
            selectedValue={assignData.userId}
            onValueChange={(value) => setAssignData({ ...assignData, userId: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select a user..." value="" />
            {unassignedUsers.map((user) => (
              <Picker.Item key={user.id} label={`${user.name} (${user.email})`} value={user.id} />
            ))}
          </Picker>

          <TouchableOpacity
            onPress={handleAssignRestaurant}
            style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
            disabled={!assignData.restaurantId || !assignData.userId}
          >
            <Text style={styles.modalButtonText}>Assign</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setAssignModalVisible(false);
              resetAssignForm();
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  addButton: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  roleText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantText: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ownerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  restaurantImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginVertical: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 2,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  modalButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
  },
  cancelButtonText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },

  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 10,
  },
  warningText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
  },
  noUsersText: {
    color: '#f44336',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
});