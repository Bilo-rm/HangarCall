import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Route } from "expo-router/build/Route";
import { router, useRouter } from "expo-router";

const restaurants = [
  {
    id: "1",
    name: "Burger King",
    image: require("./../../assets/images/download.png"),
    rating: 4.5,
  },
  {
    id: "2",
    name: "Pizza Hut",
    image: require("./../../assets/images/pizahut.png"),
    rating: 4.2,
  },
  {
    id: "3",
    name: "Sushi Place",
    image: require("./../../assets/images/sushi.png"),
    rating: 4.8,
  },
];

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Welcome, User! 🍽️</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for restaurants..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Restaurant List */}
      <FlatList
        data={restaurants.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/restaurant/${item.id}`)}>
          <View style={styles.card}>
            <Image source={item.image } style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
          </View>
          </TouchableOpacity>
        )}
      />
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
  searchBar: {
    height: 40,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  rating: {
    fontSize: 16,
    color: "gray",
  },
});
