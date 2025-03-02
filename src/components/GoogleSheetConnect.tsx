import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api/sheets';

interface SheetFile {
  id: string;
  name: string;
}

interface SheetData {
  id: string;
  name: string;
  columns?: string[];
}

interface PreviewData {
  date: string;
  type: string;
  amount: number;
  category: string;
  account: string;
  description: string;
}

export function GoogleSheetConnect() {
  const [files, setFiles] = useState<SheetFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<SheetFile | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    preview: PreviewData[];
    selectedSheet?: string;
  } | null>(null);
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { sheetConnected?: boolean; files?: SheetFile[] };
    if (state?.sheetConnected && state.files) {
      setFiles(state.files);
    }
  }, [location]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth-url`, {
        credentials: 'include'
      });
      const { url } = await response.json();
      
      setFiles([]);
      setSelectedFile(null);
      setSheets([]);
      
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: SheetFile) => {
    setLoading(true);
    console.log('1. Selecting file:', file.name);
    
    try {
      console.log('2. Making request to /sheets endpoint');
      const response = await fetch(`${API_URL}/sheets?fileId=${file.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('3. Response:', {
        ok: response.ok,
        status: response.status,
        data
      });
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sheets');
      }
      
      setSelectedFile(file);
      setSheets(data.sheets || []);
    } catch (error) {
      console.error('4. Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      setSheets([]);
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSheetSelect = async (sheet: SheetData) => {
    try {
      console.log('Previewing sheet:', {
        fileName: selectedFile?.name,
        sheetName: sheet.name
      });

      const response = await fetch(`${API_URL}/preview-sheet`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          fileId: selectedFile?.id,
          sheetId: sheet.id,
          sheetName: sheet.name
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to preview sheet');
      }
      
      setPreviewData({
        headers: data.headers,
        preview: data.preview,
        selectedSheet: sheet.name
      });
    } catch (error) {
      console.error('Error previewing sheet:', error);
      setPreviewData(null);
    }
  };

  const handleDisconnect = () => {
    setFiles([]);
    setSelectedFile(null);
    setSheets([]);
  };

  const handleImport = async (data: typeof previewData) => {
    if (!data || !selectedFile) return;
    
    try {
      const response = await fetch(`${API_URL}/import-sheet`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          fileId: selectedFile.id,
          sheetName: data.selectedSheet,
          mappings: {
            date: data.headers.indexOf('Date'),
            type: data.headers.indexOf('Type'),
            amount: data.headers.indexOf('Amount'),
            category: data.headers.indexOf('Category'),
            account: data.headers.indexOf('Account'),
            description: data.headers.indexOf('Description')
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to import sheet');
      }

      // Show success message and close preview
      alert(`Successfully imported ${result.count} transactions`);
      setPreviewData(null);
    } catch (error) {
      console.error('Error importing sheet:', error);
      alert('Failed to import transactions');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Google Sheets</h2>
        <div className="flex gap-2">
          {files.length > 0 ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect to Google'}
            </button>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full p-4 border rounded-lg text-left flex justify-between items-center"
          >
            <span>
              {selectedFile ? selectedFile.name : 'Select a Google Sheet'}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => {
                    handleFileSelect(file);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full p-4 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {file.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedFile && sheets.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Available Sheets</h3>
          <div className="grid gap-2">
            {sheets.map(sheet => (
              <button
                key={sheet.id}
                onClick={() => handleSheetSelect(sheet)}
                className="p-4 border rounded-lg hover:bg-gray-50 text-left flex justify-between items-center"
              >
                <span>{sheet.name}</span>
                <span className="text-sm text-blue-600">Preview</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {previewData && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Preview of {previewData.selectedSheet}
            </h3>
            <button
              onClick={() => handleImport(previewData)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Import Transactions
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {previewData.headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.preview.map((row, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">{row.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.account}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setPreviewData(null)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
} 