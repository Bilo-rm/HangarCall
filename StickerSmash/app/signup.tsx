import { useState } from "react";
import { View, Text, TextInput, Button, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { signupUser } from "../services/api";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleSignup = async () => {
    const success = await signupUser(name, email, password, role);
    if (success) {
      router.push("/signin"); 
    } else {
      alert("Signup failed");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../assets/logo.png")} style={styles.logo} />

      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
      />

      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={handleSignup} color="#FF8C00" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF5E1", 
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF8C00",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FFA500",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
  },
});
