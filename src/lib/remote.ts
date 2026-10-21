import { readStorage, writeStorage } from './storage';

export interface Project {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  topics: string[];
}

export interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  topics?: string[];
}

interface DevArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  reading_time_minutes: number;
  tag_list: string[];
}

const CACHE_MS = 30 * 60 * 1000;

/** Fetches JSON with a short session cache so section re-renders and revisits don't hit rate limits. */
async function fetchJsonCached<T>(url: string, signal: AbortSignal): Promise<T> {
  const cacheKey = `mn.cache:${url}`;
  const cached = readStorage(cacheKey, 'session');
  if (cached) {
    try {
      const { at, data } = JSON.parse(cached) as { at: number; data: T };
      if (Date.now() - at < CACHE_MS) return data;
    } catch {
      // Corrupt cache entry; fall through to the network.
    }
  }

  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Request to ${url} failed with ${response.status}`);
  const data = (await response.json()) as T;
  writeStorage(cacheKey, JSON.stringify({ at: Date.now(), data }), 'session');
  return data;
}

/** Original, non-archived public repositories, most recently worked on first. */
export async function fetchProjects(user: string, signal: AbortSignal, limit = 6): Promise<Project[]> {
  const repos = await fetchJsonCached<GitHubRepo[]>(
    `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=pushed&per_page=100`,
    signal,
  );
  return selectProjects(repos, limit);
}

export function selectProjects(repos: readonly GitHubRepo[], limit: number): Project[] {
  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
    .slice(0, limit)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      homepage: repo.homepage || null,
      language: repo.language,
      stars: repo.stargazers_count,
      pushedAt: repo.pushed_at,
      topics: repo.topics ?? [],
    }));
}

/** Latest published articles, de-duplicated (the DEV API can repeat entries across pages). */
export async function fetchArticles(user: string, signal: AbortSignal, limit = 4): Promise<Article[]> {
  const articles = await fetchJsonCached<DevArticle[]>(
    `https://dev.to/api/articles?username=${encodeURIComponent(user)}&per_page=30`,
    signal,
  );
  return selectArticles(articles, limit);
}

export function selectArticles(articles: readonly DevArticle[], limit: number): Article[] {
  const seen = new Set<number>();
  return articles
    .filter((article) => (seen.has(article.id) ? false : (seen.add(article.id), true)))
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
    .slice(0, limit)
    .map((article) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.published_at,
      readingMinutes: article.reading_time_minutes,
      tags: article.tag_list,
    }));
}
