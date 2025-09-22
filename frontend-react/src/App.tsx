import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { Toaster } from './components/ui/toaster'
import LoginPage from './pages/LoginPage'
// import SignUpPage from './pages/SignUpPage'
// import DashboardPage from './pages/DashboardPage'
// import BranchesPage from './pages/BranchesPage'
// import BranchDetailPage from './pages/BranchDetailPage'
// import CreateBranchPage from './pages/CreateBranchPage'
// import HistoryPage from './pages/HistoryPage'
// import RateSuggesterPage from './pages/RateSuggesterPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/signup" element={<SignUpPage />} /> */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/branches" 
          element={
            <ProtectedRoute>
              <BranchesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/branches/:branchId" 
          element={
            <ProtectedRoute>
              <BranchDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/branches/new" 
          element={
            <ProtectedRoute>
              <CreateBranchPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/history" 
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/rate-suggester" 
          element={
            <ProtectedRoute>
              <RateSuggesterPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App