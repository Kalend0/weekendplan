import { Routes, Route, Navigate } from 'react-router-dom'
import PinScreen from './pages/PinScreen'
import MainScreen from './pages/MainScreen'
import ConfigScreen from './pages/ConfigScreen'

function ProtectedRoute({ children }) {
  if (sessionStorage.getItem('authenticated') !== 'true') {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PinScreen />} />
      <Route
        path="/plan"
        element={
          <ProtectedRoute>
            <MainScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/config"
        element={
          <ProtectedRoute>
            <ConfigScreen />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
