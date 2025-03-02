import { useState } from 'react';
import { GoogleSheetFile, GoogleSheet } from '../types/sheets';

interface Props {
  files: GoogleSheetFile[];
  onSelect: (fileId: string, fileName: string, sheets: GoogleSheet[]) => void;
}

export function GoogleSheetPicker({ files, onSelect }: Props) {
  const [selectedFile, setSelectedFile] = useState<GoogleSheetFile | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<Set<string>>(new Set());

  const handleFileSelect = async (file: GoogleSheetFile) => {
    setSelectedFile(file);
    // Fetch sheets in this file
    try {
      const response = await fetch(`${API_URL}/sheets?fileId=${file.id}`);
      const data = await response.json();
      if (data.success) {
        file.sheets = data.sheets;
        setSelectedFile({ ...file });
      }
    } catch (error) {
      console.error('Error fetching sheets:', error);
    }
  };

  const handleSheetToggle = (sheetId: string) => {
    const newSelected = new Set(selectedSheets);
    if (newSelected.has(sheetId)) {
      newSelected.delete(sheetId);
    } else {
      newSelected.add(sheetId);
    }
    setSelectedSheets(newSelected);
  };

  const handleConnect = () => {
    if (!selectedFile) return;
    
    const selectedSheetsList = selectedFile.sheets.filter(
      sheet => selectedSheets.has(sheet.id)
    );
    
    onSelect(selectedFile.id, selectedFile.name, selectedSheetsList);
  };

  return (
    <div className="space-y-6">
      {!selectedFile ? (
        <>
          <h3 className="text-lg font-semibold">Select a Google Sheet File</h3>
          <div className="grid gap-4">
            {files.map(file => (
              <button
                key={file.id}
                onClick={() => handleFileSelect(file)}
                className="p-4 border rounded-lg hover:bg-gray-50 text-left"
              >
                <p className="font-medium">{file.name}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Select Sheets from {selectedFile.name}</h3>
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-sm text-blue-600"
            >
              Change File
            </button>
          </div>
          <div className="space-y-2">
            {selectedFile.sheets.map(sheet => (
              <label key={sheet.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSheets.has(sheet.id)}
                  onChange={() => handleSheetToggle(sheet.id)}
                  className="rounded"
                />
                <span>{sheet.name}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleConnect}
            disabled={selectedSheets.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Connect Selected Sheets
          </button>
        </>
      )}
    </div>
  );
} 