
const api ="http://172.20.19.199:5000"
export async function fetchRestaurants() {
    try {
      const response = await fetch("http://172.20.19.199:5000/restaurants");
      return await response.json();
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      return [];
    }
  }
  
  export async function fetchRestaurantDetails(id: string) {
    try {
      const response = await fetch(`http://172.20.19.199:5000/restaurants/${id}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      return null;
    }
  }
  
  export async function fetchMenu(restaurantId: string) {
    try {
      const response = await fetch(`http://172.20.19.199:5000/restaurants/${restaurantId}/menu`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching menu:", error);
      return [];
    }
  }
  export async function loginUser(email: string, password: string) {
    try {
      const response = await fetch("http://172.20.19.199:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }
  
  export async function signupUser(name: string, email: string, password: string, role: string) {
    try {
      const response = await fetch("http://172.20.19.199:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
  
      return response.ok;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  }
  