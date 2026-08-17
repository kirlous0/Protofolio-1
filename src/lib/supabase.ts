import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ContactMessage, PersonalInfo, Project } from '../types';

export const SUPABASE_SQL_SCHEMA = `-- 1. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  github_url TEXT,
  live_url TEXT,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  best_images JSONB DEFAULT '[]'::jsonb,
  fit_mode TEXT DEFAULT 'contain',
  featured BOOLEAN DEFAULT false,
  highlights JSONB DEFAULT '[]'::jsonb,
  android_package_name TEXT,
  seo_metadata JSONB,
  stars_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Enable RLS and public access for demo/portfolio
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Insert Projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Public Delete Projects" ON public.projects FOR DELETE USING (true);

-- 2. Create personal_info table
CREATE TABLE IF NOT EXISTS public.personal_info (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL
);
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Personal Info" ON public.personal_info FOR ALL USING (true);

-- 3. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  timestamp TEXT,
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Messages" ON public.messages FOR ALL USING (true);
`;

let supabaseClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getSupabaseCredentials(): { url: string; key: string } {
  let url = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  let key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    try {
      const stored = localStorage.getItem('kirlous_integrations_config_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.supabaseUrl) url = parsed.supabaseUrl;
        if (parsed.supabaseKey) key = parsed.supabaseKey;
      }
    } catch {
      // ignore
    }
  }

  return { url: url.trim(), key: key.trim() };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (!supabaseClient || currentUrl !== url || currentKey !== key) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
        },
      });
      currentUrl = url;
      currentKey = key;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key);
}

// Convert project object to Supabase database row
export function projectToSupabaseRow(p: Project) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    long_description: p.longDescription || '',
    category: p.category,
    tech_stack: p.techStack || [],
    github_url: p.githubUrl || '',
    live_url: p.liveUrl || '',
    image_url: p.imageUrl || '',
    images: p.images || [],
    best_images: p.bestImages || [],
    fit_mode: p.fitMode || 'contain',
    featured: Boolean(p.featured),
    highlights: p.highlights || [],
    android_package_name: p.androidPackageName || '',
    seo_metadata: p.seoMetadata || null,
    stars_count: p.starsCount || 0,
    created_at: p.createdAt || new Date().toISOString(),
  };
}

// Convert Supabase database row to Project object
export function supabaseRowToProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    longDescription: row.long_description || undefined,
    category: row.category,
    techStack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
    githubUrl: row.github_url || '',
    liveUrl: row.live_url || undefined,
    imageUrl: row.image_url || '',
    images: Array.isArray(row.images) ? row.images : undefined,
    bestImages: Array.isArray(row.best_images) ? row.best_images : undefined,
    fitMode: row.fit_mode === 'cover' ? 'cover' : 'contain',
    featured: Boolean(row.featured),
    highlights: Array.isArray(row.highlights) ? row.highlights : undefined,
    androidPackageName: row.android_package_name || undefined,
    seoMetadata: row.seo_metadata || undefined,
    starsCount: typeof row.stars_count === 'number' ? row.stars_count : 0,
    createdAt: row.created_at || new Date().toISOString().split('T')[0],
  };
}

// Diagnostic connection test
export async function testSupabaseConnection(url?: string, key?: string): Promise<{
  connected: boolean;
  tableExists: boolean;
  projectsCount: number;
  message: string;
}> {
  try {
    const creds = url && key ? { url: url.trim(), key: key.trim() } : getSupabaseCredentials();
    if (!creds.url || !creds.key) {
      return {
        connected: false,
        tableExists: false,
        projectsCount: 0,
        message: 'Supabase URL or Anon Key is missing.',
      };
    }

    const testClient = createClient(creds.url, creds.key, { auth: { persistSession: false } });
    const { data, error } = await testClient.from('projects').select('id').limit(100);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "public.projects" does not exist') || error.message.includes('does not exist')) {
        return {
          connected: true,
          tableExists: false,
          projectsCount: 0,
          message: 'Connected to Supabase, but the "projects" table has not been created yet. Copy and run the provided SQL Schema in the Supabase SQL Editor.',
        };
      }
      return {
        connected: false,
        tableExists: false,
        projectsCount: 0,
        message: `Connection error: ${error.message} (${error.code || 'UNKNOWN'})`,
      };
    }

    return {
      connected: true,
      tableExists: true,
      projectsCount: data?.length || 0,
      message: `Successfully connected to Supabase! Found ${data?.length || 0} projects in the database.`,
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      projectsCount: 0,
      message: `Failed to connect: ${err?.message || 'Network error'}`,
    };
  }
}
