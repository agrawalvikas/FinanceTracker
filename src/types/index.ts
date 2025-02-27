export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category?: string;
  sub_category?: string;
  source: string;
  notes?: string;
  type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  sub_categories: string[];
  created_at: string;
}

export interface Source {
  id: string;
  name: string;
  created_at: string;
}