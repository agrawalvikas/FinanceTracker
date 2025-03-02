import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api/sheets';

export function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codeUsed = useRef(false); // Track if code was already used
  
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      navigate('/error', { state: { message: 'No auth code received' } });
      return;
    }

    // Prevent double execution
    if (codeUsed.current) return;
    codeUsed.current = true;

    const handleCallback = async () => {
      try {
        console.log('1. Sending code to backend');
        const response = await fetch(`${API_URL}/callback?code=${code}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('2. Got response from backend');
        const data = await response.json();
        console.log('3. Response data:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to authenticate');
        }

        navigate('/transactions', { 
          state: { 
            sheetConnected: true,
            files: data.sheets
          }
        });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/error', { 
          state: { message: error instanceof Error ? error.message : 'Authentication failed' }
        });
      }
    };

    handleCallback();
  }, []); // Run only once when component mounts

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Connecting to Google Sheets...</h2>
        <p className="text-gray-600">Please wait while we complete the authentication.</p>
      </div>
    </div>
  );
} 