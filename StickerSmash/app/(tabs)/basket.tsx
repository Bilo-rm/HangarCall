import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

const API_URL = "http://192.168.2.1:5000";

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function BasketScreen() {
  const router = useRouter();
  const { isAuthenticated, authToken } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  
  const fetchCart = async () => {
    if (!isAuthenticated) {
      Alert.alert("Error", "Auth token is missing.");
      return;
    }
    console.log("Auth Token:", authToken);

    
    try {
      const response = await fetch('http://192.168.2.1:5000/cart', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch cart');
      console.log("Response status:", response.status);
      
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/signin');
      return;
    }

    if (!authToken) {
      console.log("No auth token available.");
      return;
    }

    fetchCart();
  }, [isAuthenticated, authToken]); 

  // Remove item from cart
  const removeItem = async (cartItemId: string) => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) throw new Error('Failed to remove item');
      
      Alert.alert("Success", "Item removed from cart");
      fetchCart(); // Refresh cart
    } catch (error) {
      Alert.alert("Error", error.message);
      setRefreshing(false);
    }
  };

  // Calculate total
  const total = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      
      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={fetchCart}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text>${item.price ? item.price.toFixed(2) : 'N/A'} × {item.quantity}</Text>
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
                disabled={refreshing}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${total.toFixed(1)}</Text>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});