import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useBasketStore } from "./basketStore";

export default function RestaurantDetails({ route }) {
  const { addToBasket } = useBasketStore();

  const item = {
    id: route.params.id,
    name: route.params.name,
    price: "$9.99",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{item.price}</Text>

      <TouchableOpacity style={styles.button} onPress={() => addToBasket(item)}>
        <Text style={styles.buttonText}>Add to Basket</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    color: "gray",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff6600",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
