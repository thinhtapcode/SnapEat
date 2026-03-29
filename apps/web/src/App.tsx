import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MealLog from './pages/MealLog'
import MealPlan from './pages/MealPlan'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import { Toaster } from 'react-hot-toast';
import XoaiChatBot from './pages/XoaiChatBot'

const queryClient = new QueryClient()

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  return token ? <>{children}</> : <Navigate to="/welcome" />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Welcome Page */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="meals" element={<MealLog />} />
            <Route path="meal-plans" element={<MealPlan />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="xoai-chat" element={<XoaiChatBot />} />
          </Route>
        </Routes>
        <Toaster position="top-right" reverseOrder={false} />
      </Router>
    </QueryClientProvider>
  )
}

export default App
