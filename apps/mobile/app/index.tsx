import { Redirect } from 'expo-router';

export default function Index() {
  // Check if user is authenticated
  const isAuthenticated = false; // This would come from your auth store

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
