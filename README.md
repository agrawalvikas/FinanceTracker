# Finance Tracker

A personal finance tracking application built with React, TypeScript, and Supabase.

## Features

- Track income and expenses
- Categorize transactions
- Filter by date range, type, and source
- Multiple payment source support
- Default expense categories
- Real-time updates
- Secure authentication

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase CLI

## Getting Started

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd finance-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a new Supabase project:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Note down your project URL and anon key

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Set up the database:
   ```bash
   # Install Supabase CLI if you haven't
   npm install -g supabase

   # Login to Supabase CLI
   supabase login

   # Link your project (find project ref in Supabase dashboard)
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses three main tables:

1. `transactions` - Stores all financial transactions
   - Income and expense entries
   - Date, amount, description, category, source

2. `categories` - Stores expense categories
   - Default categories provided
   - Supports subcategories
   - Users can add custom categories

3. `sources` - Stores payment sources
   - Default sources include common credit cards
   - Capital One, Chase, Citi, etc.

## Default Data

### Categories
- Food & Dining (Groceries, Restaurants, Delivery)
- Transportation (Fuel, Public Transit, Maintenance, Parking)
- Housing (Rent, Utilities, Maintenance, Insurance)
- Entertainment (Movies, Games, Events, Hobbies)
- Shopping (Clothing, Electronics, Home, Gifts)
- Healthcare (Medical, Pharmacy, Insurance)
- Education (Tuition, Books, Courses, Supplies)
- Personal Care (Grooming, Fitness, Spa & Massage)
- Travel (Flights, Hotels, Car Rental, Activities)
- Bills & Utilities (Phone, Internet, Streaming Services)

### Sources
- Capital One
- Chase
- Citi
- Bilt
- Apple
- Chase Lipi
- Sofi
- Sofi Lipi
- Chase Freedom
- Amex
- Discover

## Security

- Row Level Security (RLS) enabled on all tables
- User authentication required
- Users can only access their own transactions
- Read-only access to default categories and sources

## Development

The project uses:
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Supabase for backend and authentication
- date-fns for date manipulation
- Lucide React for icons

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[Your chosen license] 

## next features
- Visual Charts & Graphs – Track income and expenses over time with category and subcategory breakdowns, supporting a selectable date range.
- Export to Google Sheets – Export transactions for a selected date range.
- Recurring Transactions – Automate repeating income or expenses (e.g., rent, subscriptions).
- Budgeting – Set and track monthly budgets for different categories.
- Expense Insights – AI-driven analysis to highlight spending patterns and provide recommendations.
- Bill Reminders – Get notifications for upcoming bill payments.
- Multi-Currency Support – Track and convert expenses in different currencies.
- Smart Tags – Automatically categorize transactions based on past spending behavior.
- Savings Goals – Set financial goals and track progress toward them.