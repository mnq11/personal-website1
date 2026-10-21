import { useCallback, useState } from 'react';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { SkipLink } from './components/layout/SkipLink';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';
import { Education } from './components/sections/Education';
import { Experience } from './components/sections/Experience';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';
import { Writing } from './components/sections/Writing';
import { useLanguage } from './i18n/context';
import { supportsWebGL } from './lib/webgl';
import { BackgroundScene, type SceneStatus } from './scene/BackgroundScene';

export function App() {
  const { language } = useLanguage();
  const [webgl] = useState(supportsWebGL);
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>(webgl ? 'loading' : 'off');
  const handleStatus = useCallback((status: SceneStatus) => setSceneStatus(status), []);

  return (
    <>
      <SkipLink />
      <SiteHeader />
      <BackgroundScene language={language} enabled={webgl} onStatus={handleStatus} />
      <main id="main" tabIndex={-1}>
        <Hero sceneStatus={sceneStatus} />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Writing />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
