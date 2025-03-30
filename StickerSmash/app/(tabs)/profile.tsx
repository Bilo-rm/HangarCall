
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { isAuthenticated, logout } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert("Success", "You have been logged out", [{ text: "OK" }]);
      router.push("/signin"); 
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {isAuthenticated ? (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.message}>Please sign in to view your profile</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});
