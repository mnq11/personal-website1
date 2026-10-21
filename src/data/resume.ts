import type { Localized } from '../i18n/types';

/**
 * Single source of truth for everything personal on the site.
 * Edit this file to update the portfolio; every section reads from it.
 */

export type SkillDomain = 'frontend' | 'backend' | 'data' | 'delivery' | 'mobile';

/** How much hands-on depth a skill has: daily core tool, proficient, or working knowledge. */
export type SkillTier = 'core' | 'proficient' | 'familiar';

export interface Skill {
  name: string;
  domain: SkillDomain;
  tier: SkillTier;
}

export interface Role {
  id: string;
  organisation: Localized;
  title: Localized;
  url: string;
  /** ISO dates (YYYY-MM). `end` omitted means the role is ongoing. */
  start: string;
  end?: string;
  summary: Localized;
  highlights: Localized[];
}

export interface Education {
  institution: Localized;
  degree: Localized;
  start: string;
  end: string;
  courses: Localized[];
}

export type SocialNetwork = 'github' | 'linkedin' | 'devto' | 'x';

export interface SocialProfile {
  network: SocialNetwork;
  label: string;
  handle: string;
  url: string;
}

export const profile = {
  name: { en: 'Mohammed Nabil', ar: 'محمد نبيل' },
  /** Shorter forms used where the particle name must break onto two lines. */
  nameLines: { en: ['Mohammed', 'Nabil'], ar: ['محمد', 'نبيل'] },
  role: { en: 'Software developer', ar: 'مطوّر برمجيات' },
  location: { en: 'Sweden', ar: 'السويد' },
  email: 'mnq_77@yahoo.com',
  githubUser: 'mnq11',
  devtoUser: 'mnq11',
  portrait: {
    small: 'images/portrait-360.webp',
    large: 'images/portrait-720.webp',
    fallback: 'images/portrait-720.jpg',
  },
  intro: {
    en: 'I design and build full-stack applications: careful on the surface, solid underneath.',
    ar: 'أصمّم وأبني تطبيقات متكاملة: واجهة مدروسة، وأساس متين.',
  },
  about: [
    {
      en: 'I like problems that look messy at first: a tangle of requirements, data that doesn’t fit, a process nobody has written down. My work is turning those into software that is simple to use and easy to keep running.',
      ar: 'أحبّ المشكلات التي تبدو فوضوية في البداية: متطلبات متشابكة، وبيانات لا تتّسق، وعمليات لم يوثّقها أحد. عملي هو تحويل ذلك إلى برمجيات سهلة الاستخدام وسهلة الصيانة.',
    },
    {
      en: 'I hold a bachelor’s degree in software development from Kristianstad University and have delivered projects for clients as an independent consultant, across Java, Node.js, Python and React, working alone or inside a team.',
      ar: 'أحمل درجة البكالوريوس في تطوير البرمجيات من جامعة كريستيانستاد، ونفّذت مشاريع لعملاء كمستشار مستقل باستخدام Java وNode.js وPython وReact، منفرداً أو ضمن فريق.',
    },
    {
      en: 'Before software, I spent four years in education designing programmes for schools and the public. That is where I learned to explain complex things plainly, which turns out to matter a great deal in engineering.',
      ar: 'قبل البرمجة، أمضيت أربع سنوات في التعليم أصمّم برامج للمدارس وللجمهور. هناك تعلّمت شرح الأمور المعقّدة ببساطة، وتبيّن أن لذلك قيمة كبيرة في الهندسة.',
    },
  ] satisfies Localized[],
  languages: [
    { name: { en: 'Arabic', ar: 'العربية' }, level: { en: 'Native', ar: 'اللغة الأم' } },
    { name: { en: 'English', ar: 'الإنجليزية' }, level: { en: 'Fluent', ar: 'بطلاقة' } },
  ],
  interests: [
    { en: 'Travel', ar: 'السفر' },
    { en: 'Dogs', ar: 'الكلاب' },
    { en: 'Good food', ar: 'الطعام الجيد' },
    { en: 'Living in the now', ar: 'عيش اللحظة' },
  ] satisfies Localized[],
} as const;

export const socials: SocialProfile[] = [
  { network: 'github', label: 'GitHub', handle: 'mnq11', url: 'https://github.com/mnq11' },
  {
    network: 'linkedin',
    label: 'LinkedIn',
    handle: 'Mohammed Nabil',
    url: 'https://www.linkedin.com/in/mohammed-nabil-48b539107',
  },
  { network: 'devto', label: 'DEV', handle: 'mnq11', url: 'https://dev.to/mnq11' },
  { network: 'x', label: 'X', handle: 'MohammedlNabil', url: 'https://x.com/MohammedlNabil' },
];

export const roles: Role[] = [
  {
    id: 'consultant',
    organisation: { en: 'Independent', ar: 'عمل مستقل' },
    title: { en: 'Software development consultant', ar: 'مستشار تطوير برمجيات' },
    url: 'https://www.linkedin.com/in/mohammed-nabil-48b539107',
    start: '2022-01',
    end: '2023-01',
    summary: {
      en: 'Built software for clients on a project basis, often several projects at once: scoping what was needed, building it, and advising on how to develop and maintain it.',
      ar: 'بنيت برمجيات لعملاء على أساس المشاريع، وغالباً عدة مشاريع في الوقت نفسه: تحديد المطلوب، وبناؤه، وتقديم المشورة حول تطويره وصيانته.',
    },
    highlights: [
      {
        en: 'Ran concurrent client projects and delivered each on schedule.',
        ar: 'أدرت مشاريع متزامنة لعملاء وسلّمت كلاً منها في موعده.',
      },
      {
        en: 'Advised clients on development practice and project planning.',
        ar: 'قدّمت المشورة للعملاء في ممارسات التطوير وتخطيط المشاريع.',
      },
      {
        en: 'Earned repeat work through clear communication and quick responses to feedback.',
        ar: 'حصلت على أعمال متكررة بفضل التواصل الواضح والاستجابة السريعة للملاحظات.',
      },
    ],
  },
  {
    id: 'jarnia',
    organisation: { en: 'Järnia', ar: 'يارنيا (Järnia)' },
    title: { en: 'Sales associate', ar: 'مستشار مبيعات' },
    url: 'https://jarnia.se/',
    start: '2018-12',
    end: '2018-12',
    summary: {
      en: 'Advised customers at a Swedish hardware chain with more than 120 stores, and learned how supply, stock control and service fit together in retail.',
      ar: 'قدّمت المشورة للعملاء في سلسلة متاجر أدوات سويدية تضم أكثر من 120 فرعاً، وتعلّمت كيف تتكامل سلاسل الإمداد وإدارة المخزون وخدمة العملاء.',
    },
    highlights: [],
  },
  {
    id: 'kristianstad',
    organisation: { en: 'Kristianstad Municipality', ar: 'بلدية كريستيانستاد' },
    title: { en: 'Educator', ar: 'تربوي' },
    url: 'https://www.kristianstad.se/',
    start: '2017-08',
    end: '2019-08',
    summary: {
      en: 'Designed and led environmental education for school groups, community organisations and the public, and worked with other departments to build it into their programmes.',
      ar: 'صمّمت وقدّمت برامج تعليم بيئي لمجموعات مدرسية ومنظمات مجتمعية وللجمهور، وعملت مع إدارات أخرى لدمجها في برامجها.',
    },
    highlights: [],
  },
  {
    id: 'ostra-goinge',
    organisation: { en: 'Östra Göinge Municipality', ar: 'بلدية أوسترا يوينغه' },
    title: { en: 'Educator', ar: 'تربوي' },
    url: 'https://www.ostragoinge.se/',
    start: '2015-08',
    end: '2019-08',
    summary: {
      en: 'Developed educational programmes on sustainability, researched current practice in environmental education, and advocated for policies that support it.',
      ar: 'طوّرت برامج تعليمية حول الاستدامة، وتابعت أحدث الممارسات في التعليم البيئي، ودعمت السياسات التي تعزّزها.',
    },
    highlights: [],
  },
];

export const education: Education[] = [
  {
    institution: { en: 'Kristianstad University', ar: 'جامعة كريستيانستاد' },
    degree: { en: 'BSc, Software Development', ar: 'بكالوريوس تطوير البرمجيات' },
    start: '2019-09',
    end: '2022-09',
    courses: [
      { en: 'Object-oriented programming', ar: 'البرمجة كائنية التوجه' },
      { en: 'Database management systems', ar: 'أنظمة إدارة قواعد البيانات' },
      { en: 'Software engineering', ar: 'هندسة البرمجيات' },
      { en: 'Requirements engineering', ar: 'هندسة المتطلبات' },
      { en: 'Operating systems and computer architecture', ar: 'أنظمة التشغيل وبنية الحاسوب' },
      { en: 'Data communication', ar: 'اتصالات البيانات' },
      { en: 'Mobile development', ar: 'تطوير تطبيقات الجوال' },
      { en: 'Digital electronic system design', ar: 'تصميم الأنظمة الإلكترونية الرقمية' },
      { en: 'Computer security', ar: 'أمن الحاسوب' },
      { en: 'Elements of AI', ar: 'أساسيات الذكاء الاصطناعي' },
    ],
  },
];

export const skills: Skill[] = [
  // Front-end
  { name: 'React', domain: 'frontend', tier: 'core' },
  { name: 'JavaScript', domain: 'frontend', tier: 'core' },
  { name: 'HTML', domain: 'frontend', tier: 'core' },
  { name: 'CSS', domain: 'frontend', tier: 'core' },
  { name: 'jQuery', domain: 'frontend', tier: 'proficient' },
  { name: 'Angular', domain: 'frontend', tier: 'familiar' },
  // Back-end
  { name: 'Java', domain: 'backend', tier: 'core' },
  { name: 'Spring Boot', domain: 'backend', tier: 'core' },
  { name: 'Node.js', domain: 'backend', tier: 'core' },
  { name: 'Express', domain: 'backend', tier: 'core' },
  { name: 'Python', domain: 'backend', tier: 'core' },
  { name: 'Hibernate', domain: 'backend', tier: 'core' },
  { name: 'REST APIs', domain: 'backend', tier: 'core' },
  { name: '.NET', domain: 'backend', tier: 'proficient' },
  { name: 'Servlets', domain: 'backend', tier: 'proficient' },
  { name: 'Tomcat', domain: 'backend', tier: 'proficient' },
  { name: 'JUnit', domain: 'backend', tier: 'familiar' },
  // Data
  { name: 'SQL', domain: 'data', tier: 'core' },
  { name: 'NoSQL', domain: 'data', tier: 'core' },
  { name: 'MongoDB', domain: 'data', tier: 'core' },
  { name: 'PostgreSQL', domain: 'data', tier: 'proficient' },
  { name: 'Real-time databases', domain: 'data', tier: 'familiar' },
  // Delivery
  { name: 'Git', domain: 'delivery', tier: 'core' },
  { name: 'Agile', domain: 'delivery', tier: 'core' },
  { name: 'Heroku', domain: 'delivery', tier: 'proficient' },
  { name: 'Docker', domain: 'delivery', tier: 'familiar' },
  { name: 'AWS', domain: 'delivery', tier: 'familiar' },
  { name: 'Jenkins', domain: 'delivery', tier: 'familiar' },
  // Mobile
  { name: 'React Native', domain: 'mobile', tier: 'core' },
  { name: 'UX design', domain: 'mobile', tier: 'core' },
  { name: 'Android', domain: 'mobile', tier: 'proficient' },
  { name: 'Flutter', domain: 'mobile', tier: 'familiar' },
];
