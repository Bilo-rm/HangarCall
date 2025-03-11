import { Text, View, StyleSheet } from "react-native";

export default function Favorite() {
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.text}>Favorit screen</Text>
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
  }

})