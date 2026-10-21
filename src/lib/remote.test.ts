import { describe, expect, it } from 'vitest';
import { selectArticles, selectProjects } from './remote';

const repo = (name: string, pushed: string, extra: Partial<{ fork: boolean; archived: boolean }> = {}) => ({
  name,
  description: null,
  html_url: `https://github.com/mnq11/${name}`,
  homepage: '',
  language: 'TypeScript',
  stargazers_count: 0,
  pushed_at: pushed,
  fork: false,
  archived: false,
  ...extra,
});

describe('selectProjects', () => {
  it('drops forks and archived repos and sorts by most recent push', () => {
    const projects = selectProjects(
      [
        repo('old', '2023-01-01T00:00:00Z'),
        repo('fork', '2026-01-01T00:00:00Z', { fork: true }),
        repo('archived', '2026-02-01T00:00:00Z', { archived: true }),
        repo('new', '2026-03-01T00:00:00Z'),
      ],
      6,
    );
    expect(projects.map((project) => project.name)).toEqual(['new', 'old']);
    expect(projects[0]?.homepage).toBeNull();
  });

  it('respects the limit', () => {
    const many = Array.from({ length: 10 }, (_, i) => repo(`r${i}`, `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`));
    expect(selectProjects(many, 6)).toHaveLength(6);
  });
});

describe('selectArticles', () => {
  const article = (id: number, published: string) => ({
    id,
    title: `Article ${id}`,
    description: '',
    url: `https://dev.to/mnq11/${id}`,
    published_at: published,
    reading_time_minutes: 3,
    tag_list: [],
  });

  it('removes duplicates and returns the newest first', () => {
    const articles = selectArticles(
      [article(1, '2022-01-01T00:00:00Z'), article(2, '2023-01-01T00:00:00Z'), article(1, '2022-01-01T00:00:00Z')],
      4,
    );
    expect(articles.map((item) => item.id)).toEqual([2, 1]);
  });
});
