create extension if not exists pgcrypto;

create table staff (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz default now()
);
alter table staff enable row level security;

create or replace function is_staff()
returns boolean language sql security definer stable set search_path = public
as $$ select exists (select 1 from staff where id = auth.uid()); $$;

create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public
as $$ select exists (select 1 from staff where id = auth.uid() and role = 'admin'); $$;

create policy "staff view own row or admin views all" on staff
  for select to authenticated using (id = auth.uid() or is_admin());
create policy "admin manages staff" on staff
  for all to authenticated using (is_admin()) with check (is_admin());

create table categories (
  id text primary key, name text not null, slug text not null unique,
  description text, image text, created_at timestamptz default now()
);
create table brands (
  id text primary key, name text not null, created_at timestamptz default now()
);
create table products (
  id text primary key, brand text not null, name text not null, slug text not null unique,
  category text not null, price numeric not null, image text not null,
  short_description text, description text,
  specifications jsonb default '[]', features text[] default '{}',
  availability text not null default 'in-stock', featured boolean default false,
  stock_quantity integer not null default 0, low_stock_threshold integer not null default 3,
  created_at timestamptz default now()
);

alter table categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;

create policy "public read categories" on categories for select to anon, authenticated using (true);
create policy "admin write categories" on categories for insert to authenticated with check (is_admin());
create policy "admin update categories" on categories for update to authenticated using (is_admin());
create policy "admin delete categories" on categories for delete to authenticated using (is_admin());

create policy "public read brands" on brands for select to anon, authenticated using (true);
create policy "admin write brands" on brands for insert to authenticated with check (is_admin());
create policy "admin update brands" on brands for update to authenticated using (is_admin());
create policy "admin delete brands" on brands for delete to authenticated using (is_admin());

create policy "public read products" on products for select to anon, authenticated using (true);
create policy "admin write products" on products for insert to authenticated with check (is_admin());
create policy "admin update products" on products for update to authenticated using (is_admin());
create policy "admin delete products" on products for delete to authenticated using (is_admin());

create table wilayas (
  code text primary key, name_ar text not null, name_fr text not null,
  shipping_price numeric not null default 0
);
alter table wilayas enable row level security;
create policy "public read wilayas" on wilayas for select to anon, authenticated using (true);
create policy "admin write wilayas" on wilayas for insert to authenticated with check (is_admin());
create policy "admin update wilayas" on wilayas for update to authenticated using (is_admin());
create policy "admin delete wilayas" on wilayas for delete to authenticated using (is_admin());

create table coupons (
  id uuid primary key default gen_random_uuid(), code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null, expires_at timestamptz, active boolean not null default true,
  usage_limit integer, times_used integer not null default 0, created_at timestamptz default now()
);
alter table coupons enable row level security;
create policy "admin manages coupons" on coupons for all to authenticated using (is_admin()) with check (is_admin());

create or replace function validate_coupon(coupon_code text, order_subtotal numeric)
returns table (valid boolean, discount_type text, discount_value numeric, message text)
language plpgsql security definer stable set search_path = public
as $$
declare c coupons%rowtype;
begin
  select * into c from coupons where code = coupon_code and active = true;
  if not found then return query select false, null::text, null::numeric, 'Invalid coupon code'; return; end if;
  if c.expires_at is not null and c.expires_at < now() then
    return query select false, null::text, null::numeric, 'Coupon expired'; return; end if;
  if c.usage_limit is not null and c.times_used >= c.usage_limit then
    return query select false, null::text, null::numeric, 'Coupon usage limit reached'; return; end if;
  return query select true, c.discount_type, c.discount_value, 'OK';
end; $$;

create table orders (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  customer_name text not null, customer_phone text not null, customer_email text not null,
  wilaya_code text not null, wilaya_name text not null, address text not null, notes text,
  items jsonb not null, subtotal numeric not null, shipping numeric not null,
  discount numeric not null default 0, coupon_code text, total numeric not null,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  tracking_token text not null unique default encode(gen_random_bytes(6), 'hex')
);
alter table orders enable row level security;
create policy "public insert orders" on orders for insert to anon with check (true);
create policy "staff read orders" on orders for select to authenticated using (is_staff());
create policy "staff update order status" on orders for update to authenticated using (is_staff());
create policy "admin delete orders" on orders for delete to authenticated using (is_admin());

create or replace function track_order(p_phone text, p_token text)
returns setof orders language sql security definer stable set search_path = public
as $$ select * from orders where customer_phone = p_phone and tracking_token = p_token; $$;

create table landing_pages (
  slug text primary key, title text not null, hero_image text,
  content_blocks jsonb default '[]', active boolean not null default false,
  starts_at timestamptz, ends_at timestamptz, created_at timestamptz default now()
);
alter table landing_pages enable row level security;
create policy "public read active landing pages" on landing_pages for select to anon, authenticated using (active = true);
create policy "admin read all landing pages" on landing_pages for select to authenticated using (is_admin());
create policy "admin write landing pages" on landing_pages for insert to authenticated with check (is_admin());
create policy "admin update landing pages" on landing_pages for update to authenticated using (is_admin());
create policy "admin delete landing pages" on landing_pages for delete to authenticated using (is_admin());

insert into storage.buckets (id, name, public) values ('store-images', 'store-images', true) on conflict (id) do nothing;
create policy "public read store images" on storage.objects for select to anon, authenticated using (bucket_id = 'store-images');
create policy "admin upload store images" on storage.objects for insert to authenticated with check (bucket_id = 'store-images' and is_admin());
create policy "admin update store images" on storage.objects for update to authenticated using (bucket_id = 'store-images' and is_admin());
create policy "admin delete store images" on storage.objects for delete to authenticated using (bucket_id = 'store-images' and is_admin());