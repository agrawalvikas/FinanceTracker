export interface GoogleSheetFile {
  id: string;
  name: string;
  sheets: GoogleSheet[];
}

export interface GoogleSheet {
  id: string;
  name: string;
  index: number;
}

export interface ConnectedSheet {
  id: string;
  file_id: string;
  file_name: string;
  sheet_id: string;
  sheet_name: string;
  last_sync: string;
} 