import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Basket" 
        options={{
          title: 'about',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'about-sharp' : 'about-outline'} color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Favorite" 
        options={{
          title: 'Favorite',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'heart-sharp' : 'heart-outline'} color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24} />
          ),
        }} 
      />
    </Tabs>
  );
}
