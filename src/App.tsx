import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import Dashboard from './pages/Dashboard';
import { ExpenseForm } from './pages/ExpenseForm';
import { IncomeForm } from './pages/IncomeForm';
import { Summary } from './pages/Summary';
import { Transactions } from './pages/Transactions';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './lib/auth';
import { GoogleAuthCallback } from './components/GoogleAuthCallback';
import { Error } from './pages/Error';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/add-expense" element={<PrivateRoute><ExpenseForm /></PrivateRoute>} />
          <Route path="/add-income" element={<PrivateRoute><IncomeForm /></PrivateRoute>} />
          <Route path="/summary" element={<PrivateRoute><Summary /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
          <Route path="/auth/callback" element={<GoogleAuthCallback />} />
          <Route path="/error" element={<Error />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;