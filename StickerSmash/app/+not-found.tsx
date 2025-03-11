import { Text, View, StyleSheet } from "react-native";
import { Link , Stack} from "expo-router";
export default function Notfoundscreen() {
  return (
    <>
    <Stack.Screen options={{ title: 'Oops! Not Found' }} />
    <View
      style={styles.container}
    >
      <Text style={styles.text}>About screen</Text>
      <Link href={"/"} style={styles.button}> Go To Home</Link>
    </View>
    </>
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