import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface Restaurant {
  id: string;
  name: string;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      return token;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      Alert.alert('Authentication Error', 'Please log in again');
      throw error;
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch("http://172.20.13.134:5000/restaurant-owner/restaurant-orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      Alert.alert("Error", "Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`http://172.20.13.134:5000/restaurant-owner/order/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      Alert.alert("Success", `Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("Failed to update order status:", error);
      Alert.alert("Error", error.message || "Failed to update order status");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#4CAF50';
      case 'delivered': return '#2196F3';
      case 'canceled': return '#F44336';
      default: return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      <Text style={styles.totalPrice}>Total: ${item.total.toFixed(2)}</Text>
      
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Items:</Text>
        {item.OrderItems.map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {orderItem.quantity}x {orderItem.Menu.name} - ${orderItem.price.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {item.status.toLowerCase() === 'pending' && (
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={() => updateOrderStatus(item.id, "confirmed")}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        )}
        
        {item.status.toLowerCase() === 'confirmed' && (
          <TouchableOpacity
            style={[styles.button, styles.deliverButton]}
            onPress={() => updateOrderStatus(item.id, "delivered")}
          >
            <Text style={styles.buttonText}>Mark Delivered</Text>
          </TouchableOpacity>
        )}
        
        {(item.status.toLowerCase() === 'pending' || item.status.toLowerCase() === 'confirmed') && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => 
              Alert.alert(
                "Cancel Order",
                "Are you sure you want to cancel this order?",
                [
                  { text: "No", style: "cancel" },
                  { text: "Yes", onPress: () => updateOrderStatus(item.id, "canceled") }
                ]
              )
            }
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant Orders Management</Text>
      
      {loading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={fetchOrders}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={orders.length === 0 ? styles.emptyList : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  orderCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 12,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  itemRow: {
    paddingVertical: 2,
  },
  itemText: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  deliverButton: {
    backgroundColor: "#2196F3",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});