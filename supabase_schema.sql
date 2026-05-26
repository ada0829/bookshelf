-- ============================================================
-- 書架社群 Bookshelf Social — Supabase Schema
-- 在 Supabase Dashboard > SQL Editor 貼上執行
-- ============================================================

-- 1. 用戶個人資料（對應 auth.users）
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_color text default '#5a8a7a',
  initials text default '書',
  created_at timestamptz default now()
);

-- 2. 書單貼文
create table public.posts (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  author text not null,
  category text not null default '文學小說',
  stars int check (stars between 1 and 5) not null,
  intro text default '',
  review text not null,
  emoji text default '📚',
  spine_color text default '#5a8a7a',
  created_at timestamptz default now()
);

-- 3. 按讚
create table public.likes (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id bigint references public.posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- 4. 收藏
create table public.bookmarks (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id bigint references public.posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- 5. 留言
create table public.comments (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id bigint references public.posts(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.comments enable row level security;

-- profiles: 所有人可讀，只有本人可改
create policy "profiles_read" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- posts: 所有人可讀，登入者可發文，作者可刪
create policy "posts_read" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = user_id);

-- likes: 登入者可讚
create policy "likes_read" on public.likes for select using (true);
create policy "likes_insert" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on public.likes for delete using (auth.uid() = user_id);

-- bookmarks: 只有本人可見自己的收藏
create policy "bookmarks_read" on public.bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks_insert" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks_delete" on public.bookmarks for delete using (auth.uid() = user_id);

-- comments: 所有人可讀，登入者可留言
create policy "comments_read" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on public.comments for delete using (auth.uid() = user_id);

-- ============================================================
-- 自動建立 profile（用戶註冊後觸發）
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(substring(new.raw_user_meta_data->>'username', 1, 1), substring(split_part(new.email, '@', 1), 1, 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- View：貼文含統計（讚數、留言數）
-- ============================================================
create or replace view public.posts_with_stats as
select
  p.*,
  pr.username,
  pr.avatar_color,
  pr.initials,
  count(distinct l.id)::int as like_count,
  count(distinct c.id)::int as comment_count
from public.posts p
join public.profiles pr on pr.id = p.user_id
left join public.likes l on l.post_id = p.id
left join public.comments c on c.post_id = p.id
group by p.id, pr.username, pr.avatar_color, pr.initials;
