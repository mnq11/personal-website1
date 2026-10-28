import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { useFocus } from '../../focus/context';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery';
import { useLanguage } from '../../i18n/context';
import { ask, type Answer } from '../../lib/ask';
import { formatAnswer } from '../../lib/askFormat';
import { Icon } from '../ui/Icon';
import buttons from '../ui/Button.module.css';
import styles from './Ask.module.css';

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
}

/**
 * "Ask my CV": a question box whose answers are built from the resume data and shown by the page
 * itself. The answer also points the sections at the thing it names (globe, helix, ring, skyline).
 */
export function Ask() {
  const { t, language, locale } = useLanguage();
  const { point, clear } = useFocus();
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  // Over the hero the launcher would sit on the call-to-action buttons, so it appears once the visitor scrolls on.
  const [away, setAway] = useState(() => typeof window !== 'undefined' && window.scrollY > window.innerHeight * 0.7);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => {
    setOpen(false);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    const onScroll = () => setAway(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // "/" or Ctrl/Cmd+K opens the box from anywhere on the page; Escape closes it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        hide();
        return;
      }
      const shortcut = event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k');
      if (shortcut && !isTyping(event.target)) {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, hide, show]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  const submit = (text: string) => {
    const next = ask(text);
    setAnswer(next);
    if (next.kind === 'none') return;
    point(next.target);
    // Bring the section's scene into the upper part of the screen; the answer panel sits below it.
    const section = document.getElementById(next.target.section);
    const place = section?.querySelector('[data-scene]') ?? section;
    place?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) submit(query);
  };

  const reply = useMemo(() => (answer ? formatAnswer(answer, { t, language, locale }) : null), [answer, t, language, locale]);

  const reset = () => {
    clear();
    setAnswer(null);
    setQuery('');
    input.current?.focus();
  };

  return (
    <div className={styles.root}>
      {open ? (
        <section id={panelId} className={styles.panel} role="dialog" aria-modal="false" aria-labelledby={`${panelId}-title`}>
          <header className={styles.head}>
            <h2 id={`${panelId}-title`} className={styles.title}>
              {t.ask.title}
            </h2>
            <button type="button" className={styles.close} onClick={hide} aria-label={t.ask.close}>
              <Icon name="close" size={18} />
            </button>
          </header>

          {answer === null ? <p className={styles.intro}>{t.ask.intro}</p> : null}

          <form className={styles.form} onSubmit={onSubmit}>
            <label className="visually-hidden" htmlFor={`${panelId}-input`}>
              {t.ask.label}
            </label>
            <input
              ref={input}
              id={`${panelId}-input`}
              className={styles.input}
              type="text"
              value={query}
              placeholder={t.ask.placeholder}
              autoComplete="off"
              enterKeyHint="send"
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" className={`${buttons.button} ${buttons.primary}`}>
              {t.ask.send}
            </button>
          </form>

          <div className={styles.answer} aria-live="polite">
            {reply ? (
              <>
                {reply.title ? <p className={styles.answerTitle}>{reply.title}</p> : null}
                <p className={styles.answerText}>{reply.text}</p>
                {reply.chips.length > 0 ? (
                  <ul className={styles.chips}>
                    {reply.chips.map((chip) => (
                      <li key={chip}>{chip}</li>
                    ))}
                  </ul>
                ) : null}
                <button type="button" className={styles.reset} onClick={reset}>
                  {t.ask.reset}
                </button>
              </>
            ) : (
              <>
                <p className={styles.tryLabel}>{t.ask.tryLabel}</p>
                <ul className={styles.suggestions}>
                  {t.ask.suggestions.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        className={styles.suggestion}
                        onClick={() => {
                          setQuery(suggestion);
                          submit(suggestion);
                        }}
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      ) : null}

      <button
        ref={opener}
        type="button"
        className={styles.opener}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-open={open}
        data-away={away || open}
        onClick={open ? hide : show}
      >
        <Icon name="spark" size={18} />
        <span>{t.ask.open}</span>
      </button>
    </div>
  );
}
