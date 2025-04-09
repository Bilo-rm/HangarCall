import { View, Text, Image, FlatList, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";



interface MenuItem {
  id: string;
  name: string;
  price: number;
  
}

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<{ name: string; image: string; rating: number; description: string } | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [basket, setBasket] = useState<MenuItem[]>([]);


  useEffect(() => {
    const fetchMenu = async () => {
      try {
        
        const response = await fetch(`http://172.20.38.28:5000/menus/${id}/menu`);
        const data = await response.json();
        setMenu(data); 
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [id]);


    const addToBasket = async (item: MenuItem) => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await fetch("http://172.20.38.28:5000/cart/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            menuItemId: item.id,
            quantity: 1,
          }),
        });
    
        if (!response.ok) {
          throw new Error("Failed to add item to cart");
        }
    
        const cartItem = await response.json();
        
        
        setBasket((prevBasket) => [...prevBasket, { ...item, cartId: cartItem.id }]);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    };
    
    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
  };


  

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Restaurant Details */}
        <Text style={styles.name}>{restaurant?.name ?? "Restaurant"}</Text>
        <Text style={styles.rating}>⭐ {restaurant?.rating ?? "4.5"}</Text>
        <Text style={styles.description}>{restaurant?.description ?? ""}</Text>
        

        {/* Menu List */}
        <Text style={styles.menuTitle}>Menu</Text>
        <FlatList
          data={menu}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.menuItem}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => addToBasket(item)}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Basket Button */}
      {basket.length > 0 && (
        <TouchableOpacity style={styles.basketButton} onPress={() => router.push({ pathname: "/basket", params: { basket } })}>
          <Text style={styles.basketButtonText}>Go to Basket ({basket.length})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  rating: {
    fontSize: 18,
    color: "gray",
  },
  description: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuName: {
    fontSize: 16,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#ffd33d",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  basketButton: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -75 }],
    backgroundColor: "#ff6600",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  basketButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
});
