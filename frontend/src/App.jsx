import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import SourcePage from './pages/SourcePage'
import CategoryPage from './pages/CategoryPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import WeekExplorer from './pages/WeekExplorer'
import SourceCategoryPage from './pages/SourceCategoryPage'
import PrivateRoute from './components/PrivateRoute'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('auth') === 'true'
  )

  const handleLogin = () => {
    localStorage.setItem('auth', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth')
    setIsAuthenticated(false)
  }

  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

          <Route
            path="/"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <HomePage onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/source/:id"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <SourcePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/category/:id"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <CategoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/weeks"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <WeekExplorer onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <SourceCategoryPage onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  )
}

export default App
