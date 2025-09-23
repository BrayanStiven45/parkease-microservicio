import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/auth-context';
import { Toaster } from './components/ui/Toaster';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import BranchesPage from './pages/BranchesPage';
import BranchDetailPage from './pages/BranchDetailPage';
import CreateBranchPage from './pages/CreateBranchPage';
import RateSuggesterPage from './pages/RateSuggesterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
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
            path="/dashboard/branches" 
            element={
              <ProtectedRoute adminOnly>
                <BranchesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard/branches/:branchId" 
            element={
              <ProtectedRoute adminOnly>
                <BranchDetailPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard/branches/new" 
            element={
              <ProtectedRoute adminOnly>
                <CreateBranchPage />
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
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;