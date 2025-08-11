import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import HomePage from './pages/Home'
import { useAuth } from './store/auth'
import { useEffect } from 'react'

const queryClient = new QueryClient()

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { loggedIn, init } = useAuth()
  useEffect(() => {
    init()
  }, [init])
  if (!loggedIn) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
