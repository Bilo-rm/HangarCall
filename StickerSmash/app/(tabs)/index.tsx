import { View, Text, StyleSheet, FlatList, Image, TextInput } from "react-native";
import { useState } from "react";

const restaurants = [
  {
    id: "1",
    name: "Burger King",
    image: "https://source.unsplash.com/400x300/?burger",
    rating: 4.5,
  },
  {
    id: "2",
    name: "Pizza Hut",
    image: "https://source.unsplash.com/400x300/?pizza",
    rating: 4.2,
  },
  {
    id: "3",
    name: "Sushi Place",
    image: "https://source.unsplash.com/400x300/?sushi",
    rating: 4.8,
  },
];


export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.text}>Home</Text>

    </View>
  );
}


const styles = StyleSheet.create({
  container : {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightblue"
  },

  text: {
    color:"red"
  },

  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },

})