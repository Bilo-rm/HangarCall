import { Text, View, StyleSheet } from "react-native";

export default function Favorite() {
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.text}>ShopOwner screen</Text>
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