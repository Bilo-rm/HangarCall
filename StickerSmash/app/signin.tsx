import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useRouter } from "expo-router";
import { loginUser } from "../services/api";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const token = await loginUser(email, password);
    if (token) {
      // Store token in AsyncStorage or context
      router.push("/(tabs)/basket");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <View>
      <Text>Email:</Text>
      <TextInput value={email} onChangeText={setEmail} />

      <Text>Password:</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} />

      <Button title="Sign In" onPress={handleLogin} />
    </View>
  );
}
