import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e1b2e',
            color: '#e2e8f0',
            border: '1px solid rgba(139, 61, 255, 0.2)',
            borderRadius: '12px',
            fontSize: '14px',
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: { primary: '#34d399', secondary: '#1e1b2e' },
          },
          error: {
            iconTheme: { primary: '#fb7185', secondary: '#1e1b2e' },
          },
        }}
      />
    </AuthProvider>
  );
}
