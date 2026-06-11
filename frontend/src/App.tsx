import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import MyPredictions from './pages/MyPredictions';
import OthersPredictions from './pages/OthersPredictions';
import AdminPanel from './pages/AdminPanel';
import Groups from './pages/Groups';
import GroupPredictions from './pages/GroupPredictions';
import OthersGroupPredictions from './pages/OthersGroupPredictions';
import IndividualPredictions from './pages/IndividualPredictions';
import OthersIndividualPredictions from './pages/OthersIndividualPredictions';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Ładowanie...</div>;
  if (!token) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

// Correct API URL deployment trigger
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-predictions" 
            element={
              <ProtectedRoute>
                <MyPredictions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/all-predictions" 
            element={
              <ProtectedRoute>
                <OthersPredictions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups/predict" 
            element={
              <ProtectedRoute>
                <GroupPredictions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups/all-predictions" 
            element={
              <ProtectedRoute>
                <OthersGroupPredictions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/individual" 
            element={
              <ProtectedRoute>
                <IndividualPredictions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/individual/all-predictions" 
            element={
              <ProtectedRoute>
                <OthersIndividualPredictions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
