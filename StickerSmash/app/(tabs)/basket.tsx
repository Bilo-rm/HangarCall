import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function BasketScreen() {
  const router = useRouter();
  const { basket: initialBasket } = useLocalSearchParams(); // Retrieve basket from params

  const [basket, setBasket] = useState<any[]>(initialBasket || []); // Ensure basket is an array

  const removeItem = (id: string) => {
    setBasket((prevBasket) => {
      if (Array.isArray(prevBasket)) {
        return prevBasket.filter((item) => item.id !== id); // Ensure prevBasket is an array before filtering
      }
      return prevBasket; // Return prevBasket as is if it's not an array
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Basket 🛒</Text>

      {basket.length === 0 ? (
        <Text style={styles.emptyText}>Your basket is empty.</Text>
      ) : (
        <FlatList
          data={basket}
          keyExtractor={(item) => item.id.toString()} // Ensure keyExtractor uses a string key
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>
                {item.name} - {item.price}
              </Text>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Text style={styles.removeButton}>Remove ❌</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {basket.length > 0 && (
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemText: {
    fontSize: 16,
  },
  removeButton: {
    fontSize: 14,
    color: "red",
  },
  checkoutButton: {
    backgroundColor: "#ff6600",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
