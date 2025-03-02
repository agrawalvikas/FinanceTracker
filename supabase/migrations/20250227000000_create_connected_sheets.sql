create table connected_sheets (
  id uuid default uuid_generate_v4() primary key,
  sheet_id text not null,
  name text not null,
  last_sync timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users(id) on delete cascade
);

-- Add indexes for better performance
create index idx_connected_sheets_user_id on connected_sheets(user_id);
create index idx_connected_sheets_sheet_id on connected_sheets(sheet_id); 