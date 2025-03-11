import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.text}>Home</Text>
      <Link rel="about" href="/about" style={styles.button} >
        Go To About Page
      </Link>
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