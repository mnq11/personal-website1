import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { LanguageProvider } from './i18n/LanguageProvider';

function renderApp() {
  return render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );
}

describe('App', () => {
  beforeEach(() => {
    // jsdom has no WebGL, so the page renders its plain-text fallback; remote APIs are unavailable.
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    window.history.replaceState(null, '', '/?lang=en');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('shows the name as a visible heading when WebGL is unavailable', async () => {
    renderApp();
    await act(async () => undefined);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Mohammed Nabil');
    expect(heading.className).not.toContain('visually-hidden');
  });

  it('explains when GitHub and DEV cannot be reached', async () => {
    renderApp();
    expect(await screen.findByText(/GitHub didn’t respond/)).toBeTruthy();
    expect(await screen.findByText(/DEV didn’t respond/)).toBeTruthy();
  });

  it('switches the whole page to Arabic, right to left', async () => {
    renderApp();
    await act(async () => undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Arabic' }));
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('محمد نبيل');
    expect(document.title).toContain('محمد نبيل');
  });

  it('answers a question from the CV and scrolls to the part of the page it names', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    renderApp();
    await act(async () => undefined);

    fireEvent.keyDown(window, { key: '/' });
    const box = await screen.findByRole('textbox', { name: 'Your question' });
    fireEvent.change(box, { target: { value: 'Do you know Spring?' } });
    fireEvent.submit(box.closest('form') as HTMLFormElement);

    expect(await screen.findByText(/Spring is one of my core tools/)).toBeTruthy();
    expect(scrollIntoView).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Reset the page' }));
    expect(screen.queryByText(/Spring is one of my core tools/)).toBeNull();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('says so when a question is outside the CV', async () => {
    Element.prototype.scrollIntoView = vi.fn();
    renderApp();
    await act(async () => undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Ask my CV' }));
    const box = await screen.findByRole('textbox', { name: 'Your question' });
    fireEvent.change(box, { target: { value: 'capital of France' } });
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    expect(await screen.findByText(/I only know what is on this page/)).toBeTruthy();
  });
});
