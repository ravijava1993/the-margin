-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  author TEXT,
  excerpt TEXT,
  content TEXT,
  image TEXT,
  source TEXT DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create highlights table
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  note TEXT,
  color TEXT DEFAULT 'yellow',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  highlight_id UUID REFERENCES highlights(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT,
  article_title TEXT,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  interval INTEGER DEFAULT 1,
  ease_factor REAL DEFAULT 2.5,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_recommendations table (admin curated picks)
CREATE TABLE IF NOT EXISTS daily_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  author TEXT,
  excerpt TEXT,
  image TEXT,
  source TEXT DEFAULT 'other',
  admin_note TEXT,
  position INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, url)
);

-- Create reading_stats table
CREATE TABLE IF NOT EXISTS reading_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  articles_read INTEGER DEFAULT 0,
  highlights_created INTEGER DEFAULT 0,
  flashcards_reviewed INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  daily_articles INTEGER DEFAULT 5,
  weekly_articles INTEGER DEFAULT 20,
  monthly_articles INTEGER DEFAULT 60,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Articles policies
CREATE POLICY "Users can view own articles" ON articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own articles" ON articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own articles" ON articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own articles" ON articles FOR DELETE USING (auth.uid() = user_id);

-- Highlights policies
CREATE POLICY "Users can view own highlights" ON highlights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own highlights" ON highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own highlights" ON highlights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own highlights" ON highlights FOR DELETE USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "Users can view own flashcards" ON flashcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flashcards" ON flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcards" ON flashcards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcards" ON flashcards FOR DELETE USING (auth.uid() = user_id);

-- Daily recommendations policies (public read, admin write)
CREATE POLICY "Anyone can view recommendations" ON daily_recommendations FOR SELECT USING (true);
CREATE POLICY "Admins can insert recommendations" ON daily_recommendations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can update recommendations" ON daily_recommendations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can delete recommendations" ON daily_recommendations FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Reading stats policies
CREATE POLICY "Users can view own stats" ON reading_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON reading_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON reading_stats FOR UPDATE USING (auth.uid() = user_id);

-- User goals policies
CREATE POLICY "Users can view own goals" ON user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON user_goals FOR UPDATE USING (auth.uid() = user_id);
