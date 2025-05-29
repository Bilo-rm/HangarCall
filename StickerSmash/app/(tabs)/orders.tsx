import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert,Image  } from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://172.20.35.169:5000";

interface OrderItem {
  quantity: number;
  price: number;
  Menu: {
    name: string;
    image: string;
    Restaurant: {
      name: string;
    };
  };
}


interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  OrderItems: OrderItem[];
}


export default function OrderHistory() {
  const { authToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/cart/getOrders`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No orders found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderContainer}>
            <Text style={styles.orderDate}>Ordered on: {new Date(item.createdAt).toLocaleString()}</Text>
            <Text style={styles.statusText}>Status: {item.status}</Text>
            {item.OrderItems.map((i, index) => (
  <View key={index} style={styles.itemRow}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: i.Menu.image }} style={styles.menuImage} />
    </View>
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{i.Menu.name} x{i.quantity}</Text>
      <Text style={styles.restaurantName}>From: {i.Menu.Restaurant.name}</Text>
      <Text style={styles.itemPrice}>${i.price.toFixed(2)}</Text>
    </View>
  </View>
))}

            <Text style={styles.totalText}>Total: ${item.total.toFixed(2)}</Text>
          </View>
        )}
      />
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
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 30,
  },
  orderContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  orderDate: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  statusText: {
    fontStyle: "italic",
    marginBottom: 8,
  },
  itemText: {
    marginLeft: 8,
    fontSize: 14,
  },
  totalText: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
    color: "#4CAF50",
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 10,
  },
  menuImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  restaurantName: {
    fontSize: 14,
    color: '#777',
  },
  itemPrice: {
    fontSize: 14,
    color: '#4CAF50',
  },
  
});
