import { View, Text, Image, FlatList, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router"; // ✅ Import useRouter
import { useState } from "react";

const restaurants = [
  {
    id: "1",
    name: "Burger King",
    image: require("./../../assets/images/download.png"),
    rating: 4.5,
    description: "Delicious burgers made fresh daily.",
    menu: [
      { id: "m1", name: "Cheeseburger", price: "$6.99" },
      { id: "m2", name: "French Fries", price: "$2.99" },
    ],
  },
  {
    id: "2",
    name: "Pizza Hut",
    image: require("./../../assets/images/pizahut.png"),
    rating: 4.2,
    description: "Freshly baked pizzas with various toppings.",
    menu: [
      { id: "m1", name: "Pepperoni Pizza", price: "$12.99" },
      { id: "m2", name: "Garlic Bread", price: "$4.99" },
    ],
  },
  {
    id: "3",
    name: "Sushi Place",
    image: require("./../../assets/images/sushi.png"),
    rating: 4.8,
    description: "Authentic sushi with the freshest ingredients.",
    menu: [
      { id: "m1", name: "Salmon Roll", price: "$8.99" },
      { id: "m2", name: "Tuna Nigiri", price: "$6.99" },
    ],
  },
];

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter(); // ✅ Initialize router
  const restaurant = restaurants.find((r) => r.id === id);

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Restaurant not found!</Text>
      </View>
    );
  }

  const [basket, setBasket] = useState<{ id: string; name: string; price: string }[]>([]);

  // ✅ Define addToBasket function
  const addToBasket = (item: { id: string; name: string; price: string }) => {
    setBasket((prevBasket) => [...prevBasket, item]);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Restaurant Image */}
        <Image source={restaurant.image} style={styles.image} />

        {/* Restaurant Name & Rating */}
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.rating}>⭐ {restaurant.rating}</Text>
        <Text style={styles.description}>{restaurant.description}</Text>

        {/* Menu List */}
        <Text style={styles.menuTitle}>Menu</Text>
        <FlatList
          data={restaurant.menu}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.menuItem}>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuPrice}>{item.price}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => addToBasket(item)}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={false} // Prevents FlatList scrolling inside ScrollView
        />
      </ScrollView>

      {/* Floating "Go to Basket" Button */}
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
  error: {
    fontSize: 20,
    color: "red",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
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
});
