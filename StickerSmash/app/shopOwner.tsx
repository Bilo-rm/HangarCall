import React, { useEffect, useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  RefreshControl, 
  ActivityIndicator, 
  TextInput, 
  Modal, 
  ScrollView,
  Image 
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  restaurantId?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  Menu: MenuItem;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  OrderItems: OrderItem[];
}

export default function ShopOwner() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersRefreshing, setOrdersRefreshing] = useState(false);
  
  // Menu state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuRefreshing, setMenuRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string>("");
  
  // Form states
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Edit states
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { isAuthenticated, logout } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('No token found');
      return token;
    } catch (err) {
      Alert.alert('Auth Error', 'Please log in again');
      throw err;
    }
  };

  const getRestaurantId = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      console.log('Getting user data from AsyncStorage:', userData);
      
      if (!userData) {
        Alert.alert('Error', 'User data not found. Please log in again.');
        return null;
      }
  
      const user = JSON.parse(userData);
      const restaurantId = user.restaurant?.id;
      
      console.log('Restaurant ID from user data:', restaurantId);
      
      if (!restaurantId) {
        Alert.alert('Error', 'Restaurant not found. Please ensure you have a restaurant associated with your account.');
        return null;
      }
      
      return restaurantId;
    } catch (error) {
      console.error('Error getting restaurant ID:', error);
      Alert.alert('Error', 'Failed to get restaurant information');
      return null;
    }
  };

  // Orders functions
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = await getAuthToken();
      const res = await fetch('http://172.20.35.169:5000/restaurant-owner/restaurant-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      Alert.alert('Fetch Error', err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`http://172.20.35.169:5000/restaurant-owner/order/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update');
      Alert.alert('Success', `Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      Alert.alert('Update Error', err.message);
    }
  };

  const onOrdersRefresh = async () => {
    setOrdersRefreshing(true);
    await fetchOrders();
    setOrdersRefreshing(false);
  };

  // Menu functions
  const fetchMenuItems = async () => {
    try {
      setMenuLoading(true);
      const token = await getAuthToken();
      const restId = await getRestaurantId();
      
      if (!restId) return;
      
      setRestaurantId(restId);
      
      const res = await fetch(`http://172.20.35.169:5000/menus/${restId}/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setMenuItems(data);
    } catch (err) {
      Alert.alert('Fetch Error', err.message);
    } finally {
      setMenuLoading(false);
    }
  };

  const addMenuItem = async () => {
    if (!itemName.trim() || !itemPrice.trim()) {
      Alert.alert('Error', 'Please fill in item name and price');
      return;
    }

    const price = parseFloat(itemPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      setSubmitting(true);
      const token = await getAuthToken();
      
      const res = await fetch(`http://172.20.35.169:5000/menus/${restaurantId}/menu`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          name: itemName.trim(), 
          price: price,
          image: itemImage.trim() || undefined
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add menu item');
      }
      
      Alert.alert('Success', 'Menu item added successfully');
      setModalVisible(false);
      resetForm();
      fetchMenuItems();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit menu item function
  const editMenuItem = async () => {
    if (!itemName.trim() || !itemPrice.trim()) {
      Alert.alert('Error', 'Please fill in item name and price');
      return;
    }

    const price = parseFloat(itemPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      setSubmitting(true);
      const token = await getAuthToken();
      
      const res = await fetch(`http://172.20.35.169:5000/menus/menu-item/${editingItem.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          name: itemName.trim(), 
          price: price,
          image: itemImage.trim() || undefined
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update menu item');
      }
      
      Alert.alert('Success', 'Menu item updated successfully');
      setModalVisible(false);
      resetForm();
      setIsEditMode(false);
      setEditingItem(null);
      fetchMenuItems();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete menu item function
  const deleteMenuItem = async (itemId: string, itemName: string) => {
    Alert.alert(
      'Delete Menu Item', 
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`, 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              
              const res = await fetch(`http://172.20.35.169:5000/menus/menu-item/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              
              if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to delete menu item');
              }
              
              Alert.alert('Success', 'Menu item deleted successfully');
              fetchMenuItems();
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          }
        },
      ]
    );
  };

  // Open edit modal
  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditMode(true);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setItemImage(item.image || '');
    setModalVisible(true);
  };

  const resetForm = () => {
    setItemName("");
    setItemPrice("");
    setItemImage("");
    setIsEditMode(false);
    setEditingItem(null);
  };

  const onMenuRefresh = async () => {
    setMenuRefreshing(true);
    await fetchMenuItems();
    setMenuRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert("Success", "You have been logged out", [{ text: "OK" }]);
      router.push("/signin"); 
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  // Utility functions
  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FF9500';
      case 'confirmed': return '#34C759';
      case 'delivered': return '#007AFF';
      case 'canceled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  // Render functions
  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      <Text style={styles.total}>Total: ${item.total.toFixed(2)}</Text>

      <View style={styles.items}>
        {item.OrderItems.map((oi, idx) => (
          <Text key={idx} style={styles.itemText}>{oi.quantity}x {oi.Menu.name} - ${oi.price.toFixed(2)}</Text>
        ))}
      </View>

      <View style={styles.actions}>
        {item.status === 'pending' && (
          <TouchableOpacity style={[styles.btn, styles.confirm]} onPress={() => updateStatus(item.id, 'confirmed')}>
            <Text style={styles.btnText}>Confirm</Text>
          </TouchableOpacity>
        )}
        {item.status === 'confirmed' && (
          <TouchableOpacity style={[styles.btn, styles.deliver]} onPress={() => updateStatus(item.id, 'delivered')}>
            <Text style={styles.btnText}>Mark Delivered</Text>
          </TouchableOpacity>
        )}
        {['pending', 'confirmed'].includes(item.status) && (
          <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={() =>
            Alert.alert('Cancel Order', 'Are you sure?', [
              { text: 'No', style: 'cancel' },
              { text: 'Yes', onPress: () => updateStatus(item.id, 'canceled') },
            ])
          }>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuCard}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.menuActions}>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionBtnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => deleteMenuItem(item.id, item.name)}
        >
          <Text style={styles.actionBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrdersTab = () => (
    <>
      {ordersLoading && orders.length === 0 ? (
        <ActivityIndicator size="large" color="#8B5FBF" style={styles.loader} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={renderOrder}
          refreshControl={<RefreshControl refreshing={ordersRefreshing} onRefresh={onOrdersRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No orders found</Text>}
          contentContainerStyle={orders.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
    </>
  );

  const renderMenuTab = () => (
    <>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add New Item</Text>
      </TouchableOpacity>

      {menuLoading && menuItems.length === 0 ? (
        <ActivityIndicator size="large" color="#8B5FBF" style={styles.loader} />
      ) : (
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id}
          renderItem={renderMenuItem}
          refreshControl={<RefreshControl refreshing={menuRefreshing} onRefresh={onMenuRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No menu items found. Add your first item!</Text>
          }
          contentContainerStyle={menuItems.length === 0 ? styles.emptyContainer : styles.listContainer}
        />
      )}
    </>
  );

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'menu') {
      fetchMenuItems();
    }
  }, [activeTab]);

  // Initial load
  useEffect(() => { 
    fetchOrders(); 
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Restaurant Management</Text>
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]} 
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]} 
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>
            Menu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'orders' ? renderOrdersTab() : renderMenuTab()}

      {/* Add/Edit Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}
              </Text>
              
              <Text style={styles.inputLabel}>Item Name *</Text>
              <TextInput
                style={styles.input}
                value={itemName}
                onChangeText={setItemName}
                placeholder="Enter item name"
                maxLength={100}
              />
              
              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput
                style={styles.input}
                value={itemPrice}
                onChangeText={setItemPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
                maxLength={10}
              />
              
              <Text style={styles.inputLabel}>Image URL (Optional)</Text>
              <TextInput
                style={styles.input}
                value={itemImage}
                onChangeText={setItemImage}
                placeholder="https://example.com/image.jpg"
                keyboardType="url"
                autoCapitalize="none"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
                  onPress={isEditMode ? editMenuItem : addMenuItem}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isEditMode ? 'Update Item' : 'Add Item'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F7FF', 
    padding: 16 
  },
  titleContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    paddingTop: 10
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#4A2C6B',
    letterSpacing: -0.5
  },
  logoutBtn: { 
    backgroundColor: '#E74C3C', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 12,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  logoutText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 14 
  },
  
  // Tab styles with purple theme
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    padding: 6,
    shadowColor: '#8B5FBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#8B5FBF',
    shadowColor: '#8B5FBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  
  // Common styles
  loader: {
    marginTop: 50,
  },
  listContainer: {
    paddingBottom: 20,
  },
  empty: { 
    textAlign: 'center', 
    color: '#8E8E93', 
    marginTop: 30,
    fontSize: 16,
    fontWeight: '500'
  },
  emptyContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // Order styles with modern design
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 16, 
    shadowColor: '#8B5FBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0EEFF'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8
  },
  orderId: { 
    fontWeight: '700', 
    fontSize: 18,
    color: '#2C2C2E'
  },
  badge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  badgeText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 11,
    letterSpacing: 0.5
  },
  date: { 
    color: '#8E8E93', 
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500'
  },
  total: { 
    fontWeight: '700', 
    fontSize: 18, 
    marginBottom: 12, 
    color: '#8B5FBF' 
  },
  items: { 
    marginBottom: 16,
    paddingLeft: 8
  },
  itemText: { 
    color: '#3C3C43',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2
  },
  actions: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  btn: { 
    padding: 12, 
    borderRadius: 12, 
    flexGrow: 1, 
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  confirm: { 
    backgroundColor: '#34C759',
    shadowColor: '#34C759'
  },
  deliver: { 
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF'
  },
  cancel: { 
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30'
  },
  btnText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 14
  },
  
  // Modern Menu styles with purple theme
  addButton: {
    backgroundColor: '#8B5FBF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B5FBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#8B5FBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0EEFF'
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    color: '#8B5FBF',
    fontWeight: '700',
  },
  menuActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#8B5FBF',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5FBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  actionBtnText: {
    fontSize: 16,
  },
  
  // Modern Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(139, 95, 191, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '92%',
    maxHeight: '85%',
    shadowColor: '#8B5FBF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    color: '#4A2C6B',
    letterSpacing: -0.3
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A2C6B',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8F7FF',
    color: '#2C2C2E',
    fontWeight: '500'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontWeight: '700',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#8B5FBF',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#8B5FBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  submitButtonDisabled: {
    backgroundColor: '#C8B5DB',
    shadowOpacity: 0.1
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3
  },
});