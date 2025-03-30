import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.2.1:5000/auth";

export const signupUser = async (name: string, email: string, password: string, role: string) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) throw new Error("Signup failed");

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login Response:", data);
    if (!response.ok) throw new Error(data.message || "Login failed");

    await AsyncStorage.setItem("authToken", data.token); // Store token
    return data.token;
    
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem("authToken");
};

export const getAuthToken = async () => {
  return await AsyncStorage.getItem("authToken");
};
