import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
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
    <View>
      <Text>Name:</Text>
      <TextInput value={name} onChangeText={setName} />

      <Text>Email:</Text>
      <TextInput value={email} onChangeText={setEmail} />

      <Text>Password:</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} />

      <Button title="Sign Up" onPress={handleSignup} />
    </View>
  );
}
