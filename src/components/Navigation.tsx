import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, LineChart, List, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Finance Tracker
          </Link>
          
          <div className="flex items-center space-x-4">
            <NavLink to="/" icon={<Home size={20} />} text="Dashboard" isActive={isActive('/')} />
            <NavLink to="/add-expense" icon={<PlusCircle size={20} />} text="Add Expense" isActive={isActive('/add-expense')} />
            <NavLink to="/add-income" icon={<PlusCircle size={20} />} text="Add Income" isActive={isActive('/add-income')} />
            <NavLink to="/summary" icon={<LineChart size={20} />} text="Summary" isActive={isActive('/summary')} />
            <NavLink to="/transactions" icon={<List size={20} />} text="Transactions" isActive={isActive('/transactions')} />
            
            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut size={20} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}

function NavLink({ to, icon, text, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {text}
    </Link>
  );
}