import { Text, View, StyleSheet } from "react-native";

export default function Profile() {
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.text}>profile screen</Text>
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