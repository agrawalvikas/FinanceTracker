import { useNavigate, useLocation } from 'react-router-dom';

export function Error() {
  const navigate = useNavigate();
  const location = useLocation();
  const errorMessage = location.state?.message || 'Something went wrong';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <button
          onClick={() => navigate('/transactions')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Transactions
        </button>
      </div>
    </div>
  );
} 