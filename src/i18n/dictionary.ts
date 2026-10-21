import type { Language } from './types';

const en = {
  meta: {
    title: 'Mohammed Nabil · Software developer in Sweden',
    description:
      'Mohammed Nabil is a full-stack software developer in Sweden working with Java, Node.js, Python and React. Experience, skills, projects and writing.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    primaryNav: 'Primary',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchLanguage: 'Switch to Arabic',
    opensInNewTab: '(opens in a new tab)',
  },
  nav: {
    about: 'About',
    skills: 'Skills',
    experience: 'Experience',
    projects: 'Projects',
    writing: 'Writing',
    contact: 'Contact',
  },
  languageToggle: 'العربية',
  hero: {
    basedIn: 'Software developer based in',
    viewWork: 'See my work',
    contact: 'Get in touch',
    scroll: 'Scroll',
  },
  about: {
    title: 'About',
    portraitAlt: 'Portrait of Mohammed Nabil',
    languages: 'Languages',
    outsideWork: 'Outside work',
  },
  skills: {
    title: 'Skills',
    lede: 'Grouped by how deeply I work with each tool, not by how impressive it sounds.',
    domains: {
      frontend: 'Front-end',
      backend: 'Back-end',
      data: 'Data',
      delivery: 'Delivery',
      mobile: 'Mobile',
    },
    tiers: {
      core: 'Core',
      proficient: 'Proficient',
      familiar: 'Working knowledge',
    },
  },
  experience: {
    title: 'Experience',
    present: 'Present',
    education: 'Education',
    courses: 'Selected courses',
    visit: 'Website',
  },
  projects: {
    title: 'Projects',
    lede: 'Recent public work, pulled live from GitHub.',
    loading: 'Loading projects from GitHub…',
    error: 'GitHub didn’t respond, so projects can’t be shown right now.',
    empty: 'No public projects yet.',
    allOnGitHub: 'All projects on GitHub',
    updated: 'Updated',
    stars: 'stars',
    noDescription: 'No description provided.',
  },
  writing: {
    title: 'Writing',
    lede: 'Articles I have published on DEV.',
    loading: 'Loading articles…',
    error: 'DEV didn’t respond, so articles can’t be shown right now.',
    empty: 'No articles published yet.',
    allOnDev: 'All articles on DEV',
    minRead: 'min read',
  },
  contact: {
    title: 'Let’s build something',
    lede: 'Have a project, a role or an idea you want a second opinion on? Email me and I will reply within a couple of days.',
    copy: 'Copy email',
    copied: 'Email copied',
    elsewhere: 'Elsewhere',
  },
  footer: {
    rights: 'All rights reserved.',
    source: 'Source on GitHub',
    backToTop: 'Back to top',
  },
  duration: {
    year: (n: number) => (n === 1 ? '1 yr' : `${n} yrs`),
    month: (n: number) => (n === 1 ? '1 mo' : `${n} mos`),
    joiner: ' ',
  },
};

export type Dictionary = typeof en;

const ar: Dictionary = {
  meta: {
    title: 'محمد نبيل · مطوّر برمجيات في السويد',
    description:
      'محمد نبيل مطوّر برمجيات متكاملة في السويد يعمل بـ Java وNode.js وPython وReact. الخبرات والمهارات والمشاريع والمقالات.',
  },
  a11y: {
    skipToContent: 'انتقل إلى المحتوى',
    primaryNav: 'التنقل الرئيسي',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    switchLanguage: 'التبديل إلى الإنجليزية',
    opensInNewTab: '(يفتح في علامة تبويب جديدة)',
  },
  nav: {
    about: 'نبذة',
    skills: 'المهارات',
    experience: 'الخبرات',
    projects: 'المشاريع',
    writing: 'المقالات',
    contact: 'تواصل',
  },
  languageToggle: 'English',
  hero: {
    basedIn: 'مطوّر برمجيات مقيم في',
    viewWork: 'تصفّح أعمالي',
    contact: 'تواصل معي',
    scroll: 'مرّر',
  },
  about: {
    title: 'نبذة',
    portraitAlt: 'صورة شخصية لمحمد نبيل',
    languages: 'اللغات',
    outsideWork: 'خارج العمل',
  },
  skills: {
    title: 'المهارات',
    lede: 'مرتّبة حسب عمق خبرتي العملية بكل أداة، لا حسب وقع اسمها.',
    domains: {
      frontend: 'الواجهات',
      backend: 'الخوادم',
      data: 'البيانات',
      delivery: 'التسليم والتشغيل',
      mobile: 'الجوال',
    },
    tiers: {
      core: 'أساسية',
      proficient: 'متمكّن',
      familiar: 'معرفة عملية',
    },
  },
  experience: {
    title: 'الخبرات',
    present: 'حتى الآن',
    education: 'التعليم',
    courses: 'مقررات مختارة',
    visit: 'الموقع',
  },
  projects: {
    title: 'المشاريع',
    lede: 'أحدث أعمالي العامة، تُجلب مباشرة من GitHub.',
    loading: 'جارٍ تحميل المشاريع من GitHub…',
    error: 'لم يستجب GitHub، لذا لا يمكن عرض المشاريع الآن.',
    empty: 'لا توجد مشاريع عامة بعد.',
    allOnGitHub: 'كل المشاريع على GitHub',
    updated: 'آخر تحديث',
    stars: 'نجوم',
    noDescription: 'لا يوجد وصف.',
  },
  writing: {
    title: 'المقالات',
    lede: 'مقالات نشرتها على منصة DEV.',
    loading: 'جارٍ تحميل المقالات…',
    error: 'لم تستجب منصة DEV، لذا لا يمكن عرض المقالات الآن.',
    empty: 'لم تُنشر مقالات بعد.',
    allOnDev: 'كل المقالات على DEV',
    minRead: 'دقائق قراءة',
  },
  contact: {
    title: 'لنبنِ شيئاً معاً',
    lede: 'لديك مشروع أو فرصة عمل أو فكرة تريد رأياً ثانياً فيها؟ راسلني وسأردّ خلال يومين تقريباً.',
    copy: 'نسخ البريد',
    copied: 'تم نسخ البريد',
    elsewhere: 'حساباتي',
  },
  footer: {
    rights: 'جميع الحقوق محفوظة.',
    source: 'الشيفرة على GitHub',
    backToTop: 'العودة للأعلى',
  },
  duration: {
    year: (n: number) => (n === 1 ? 'سنة' : n === 2 ? 'سنتان' : n <= 10 ? `${n} سنوات` : `${n} سنة`),
    month: (n: number) => (n === 1 ? 'شهر' : n === 2 ? 'شهران' : n <= 10 ? `${n} أشهر` : `${n} شهراً`),
    joiner: ' و',
  },
};

export const dictionaries: Record<Language, Dictionary> = { en, ar };
