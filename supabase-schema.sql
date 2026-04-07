-- Wardrobe items table
create table wardrobe_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  image_url text not null,
  name text,
  category text, -- tops, bottoms, shoes, outerwear, accessories
  color text,
  style text,
  description text, -- Claude's full description
  created_at timestamp with time zone default now()
);

-- Outfits table
create table outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_ids uuid[] not null, -- array of wardrobe_item ids
  explanation text, -- Claude's explanation of why this works
  created_at timestamp with time zone default now()
);

-- RLS policies for wardrobe_items
alter table wardrobe_items enable row level security;

create policy "Users can view their own items"
  on wardrobe_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own items"
  on wardrobe_items for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own items"
  on wardrobe_items for delete
  using (auth.uid() = user_id);

-- RLS policies for outfits
alter table outfits enable row level security;

create policy "Users can view their own outfits"
  on outfits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own outfits"
  on outfits for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own outfits"
  on outfits for delete
  using (auth.uid() = user_id);

-- Storage bucket for clothing photos
insert into storage.buckets (id, name, public) values ('wardrobe', 'wardrobe', true);

create policy "Users can upload their own images"
  on storage.objects for insert
  with check (bucket_id = 'wardrobe' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view wardrobe images"
  on storage.objects for select
  using (bucket_id = 'wardrobe');

create policy "Users can delete their own images"
  on storage.objects for delete
  using (bucket_id = 'wardrobe' and auth.uid()::text = (storage.foldername(name))[1]);
