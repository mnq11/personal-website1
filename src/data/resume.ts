import type { Localized } from '../i18n/types';

/**
 * Single source of truth for everything personal on the site.
 * Sources: CV (English and Arabic), official transcript of records and certificate of registration
 * from Kristianstad University. Identity numbers, control codes and phone numbers are deliberately
 * not reproduced here.
 */

export type SkillDomain = 'frontend' | 'backend' | 'data' | 'ai' | 'delivery' | 'mobile';

/** How much hands-on depth a skill has: daily core tool, proficient, or working knowledge. */
export type SkillTier = 'core' | 'proficient' | 'familiar';

export interface Skill {
  name: string;
  domain: SkillDomain;
  tier: SkillTier;
  /** Passed the LinkedIn skill assessment for this skill. */
  verified?: boolean;
}

export interface Role {
  id: string;
  organisation: Localized;
  title: Localized;
  url?: string;
  /** ISO months (YYYY-MM). `end` omitted means the role is ongoing. */
  start: string;
  end?: string;
  summary: Localized;
  highlights: Localized[];
}

export interface Degree {
  id: string;
  title: Localized;
  institution: Localized;
  programme: Localized;
  start: string;
  end: string;
  /** Credits of the awarded degree, when the transcript states it. */
  credits?: number;
  thesis: { title: Localized; distinction: boolean };
  activities?: Localized[];
}

/** Earlier vocational diplomas, shown under "Earlier studies". */
export interface Diploma {
  id: string;
  title: Localized;
  institution: Localized;
  start: number;
  end: number;
  detail: Localized;
}

export interface Course {
  code: string;
  name: Localized;
  credits: number;
  /** 1 = bachelor (first cycle), 2 = master's level (second cycle). */
  cycle: 1 | 2;
  completed: string;
  /** Pass with distinction (grade 5 or VG). Other grades are intentionally not published. */
  distinction: boolean;
}

export type ProjectKind = 'web' | 'mobile' | 'desktop' | 'research';

export interface Project {
  id: string;
  name: string;
  kind: ProjectKind;
  /** ISO month; omitted when the source documents give no date. */
  start?: string;
  end?: string;
  summary: Localized;
  features: Localized[];
  stack: string[];
  url?: string;
}

export interface Certificate {
  id: string;
  name: Localized;
  issuer: string;
  year: number;
  summary: Localized;
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
  /** Spelled out by the particles when the visitor reaches the contact section. */
  greeting: { lines: ['Hej · Hello', 'مرحباً'] },
  role: { en: 'Full-stack developer', ar: 'مطوّر برمجيات متكاملة' },
  location: { en: 'Skåne, Sweden', ar: 'سكونه، السويد' },
  email: 'mnq_77@yahoo.com',
  githubUser: 'mnq11',
  devtoUser: 'mnq11',
  portrait: {
    small: 'images/portrait-360.webp',
    large: 'images/portrait-720.webp',
    fallback: 'images/portrait-720.jpg',
  },
  intro: {
    en: 'I build web, mobile and machine-learning products end to end, from the database schema to the screen people touch.',
    ar: 'أبني منتجات الويب والجوال وتعلّم الآلة من البداية إلى النهاية، من قاعدة البيانات حتى الشاشة التي يلمسها المستخدم.',
  },
  about: [
    {
      en: 'I’m a full-stack developer who likes problems that look messy at first: a tangle of requirements, data that doesn’t fit, a process nobody has written down. My work is turning those into software that is simple to use and easy to keep running.',
      ar: 'أنا مطوّر برمجيات متكاملة أحبّ المشكلات التي تبدو فوضوية في البداية: متطلبات متشابكة، وبيانات لا تتّسق، وعمليات لم يوثّقها أحد. عملي هو تحويل ذلك إلى برمجيات سهلة الاستخدام وسهلة الصيانة.',
    },
    {
      en: 'I studied at Kristianstad University: a bachelor’s in software engineering in 2022, then a master’s in computer science focused on machine learning, finishing in 2025 with a thesis on an AI-assisted tool for creating children’s books that passed with distinction. Today I lead development at the start-up Hlkat Wsl and take on freelance projects.',
      ar: 'درست في جامعة كريستيانستاد: بكالوريوس هندسة البرمجيات عام 2022، ثم ماجستير علوم الحاسوب بتركيز على تعلّم الآلة أنهيته عام 2025 برسالة عن أداة مدعومة بالذكاء الاصطناعي لتأليف كتب الأطفال نالت تقدير "ناجح بامتياز". أقود اليوم التطوير في الشركة الناشئة Hlkat Wsl وأعمل على مشاريع مستقلة.',
    },
    {
      en: 'Alongside software, I have worked for years as a support worker with children affected by war and with special needs. It taught me to listen first, stay calm under pressure, and act as a bridge between languages and cultures, which is most of what good engineering asks for.',
      ar: 'وإلى جانب البرمجة، عملت لسنوات كعامل دعم متخصص مع أطفال متأثرين بالحرب ومن ذوي الاحتياجات الخاصة. تعلّمت من ذلك أن أستمع أولاً، وأن أبقى هادئاً تحت الضغط، وأن أكون جسراً بين اللغات والثقافات، وهذا جوهر ما تحتاجه الهندسة الجيدة.',
    },
  ] satisfies Localized[],
  languages: [
    { name: { en: 'Arabic', ar: 'العربية' }, level: { en: 'Native', ar: 'اللغة الأم' } },
    { name: { en: 'English', ar: 'الإنجليزية' }, level: { en: 'Full professional', ar: 'إتقان مهني كامل' } },
    { name: { en: 'Swedish', ar: 'السويدية' }, level: { en: 'Full professional', ar: 'إتقان مهني كامل' } },
  ],
  interests: [
    { en: 'Reading', ar: 'القراءة' },
    { en: 'Football', ar: 'كرة القدم' },
    { en: 'Horse riding', ar: 'ركوب الخيل' },
    { en: 'Training', ar: 'ممارسة الرياضة' },
  ] satisfies Localized[],
  traits: [
    { en: 'Creative', ar: 'مبدع' },
    { en: 'Critical thinking', ar: 'تفكير نقدي' },
    { en: 'Team player', ar: 'روح الفريق' },
    { en: 'Problem solving', ar: 'حل المشكلات' },
    { en: 'Open-minded', ar: 'انفتاح ذهني' },
    { en: 'Adaptable', ar: 'سريع التكيّف' },
    { en: 'Active listening', ar: 'إصغاء فعّال' },
    { en: 'Cultural bridge', ar: 'جسر ثقافي' },
    { en: 'Calm under pressure', ar: 'هدوء تحت الضغط' },
    { en: 'Clear communication', ar: 'تواصل واضح' },
    { en: 'Ownership', ar: 'تحمّل المسؤولية' },
    { en: 'Curiosity', ar: 'فضول معرفي' },
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
    id: 'hlkat-wsl',
    organisation: { en: 'Hlkat Wsl', ar: 'حلقة وصل (Hlkat Wsl)' },
    title: { en: 'Full-stack developer and team lead', ar: 'مطوّر برمجيات متكاملة وقائد فريق' },
    url: 'https://www.hlkatwsl.com/',
    start: '2022-08',
    summary: {
      en: 'Start-up building a range of software systems and services. I lead the development team and work directly with clients to shape each solution around their goals.',
      ar: 'شركة ناشئة تبني أنظمة وخدمات برمجية متنوعة. أقود فريق التطوير وأعمل مباشرة مع العملاء لتصميم كل حل وفق أهدافهم.',
    },
    highlights: [
      {
        en: 'Built and shipped diverse systems and services as team lead.',
        ar: 'بنيت وأطلقت أنظمة وخدمات متنوعة بصفتي قائداً للفريق.',
      },
      {
        en: 'Wrote project plans and functional requirements, managed resources and tracked delivery.',
        ar: 'أعددت خطط المشاريع والمتطلبات الوظيفية، وأدرت الموارد وتابعت التسليم.',
      },
      {
        en: 'Worked closely with clients to keep solutions tailored to their needs.',
        ar: 'عملت عن قرب مع العملاء لتبقى الحلول مصمّمة وفق احتياجاتهم.',
      },
    ],
  },
  {
    id: 'freelance',
    organisation: { en: 'Self-employed, Kristianstad', ar: 'عمل حر، كريستيانستاد' },
    title: { en: 'Freelance software developer', ar: 'مطوّر برمجيات مستقل' },
    start: '2015-01',
    summary: {
      en: 'Full-stack web applications for a mix of clients, built with Java, Python, React, Spring and MongoDB, from first conversation to deployment.',
      ar: 'تطبيقات ويب متكاملة لعملاء متنوعين باستخدام Java وPython وReact وSpring وMongoDB، من أول حوار حتى النشر.',
    },
    highlights: [
      {
        en: 'Developed and deployed multiple full-stack applications within agreed timelines and budgets.',
        ar: 'طوّرت ونشرت عدة تطبيقات متكاملة ضمن الجداول الزمنية والميزانيات المتفق عليها.',
      },
      {
        en: 'Turned each client’s goals into concrete requirements and tailored solutions.',
        ar: 'حوّلت أهداف كل عميل إلى متطلبات واضحة وحلول مخصّصة.',
      },
      {
        en: 'Used unit and integration testing to keep the software reliable.',
        ar: 'اعتمدت اختبارات الوحدة والتكامل لضمان موثوقية البرمجيات.',
      },
    ],
  },
  {
    id: 'support-worker',
    organisation: {
      en: 'Kristianstad and Östra Göinge municipalities',
      ar: 'بلديتا كريستيانستاد وأوسترا يوينغه',
    },
    title: { en: 'Specialized support worker', ar: 'عامل دعم متخصص' },
    start: '2015-01',
    summary: {
      en: 'Supported children affected by war and children with special needs, as part of a team of teachers, therapists and families.',
      ar: 'دعمت أطفالاً متأثرين بالحرب وأطفالاً من ذوي الاحتياجات الخاصة، ضمن فريق من المعلمين والمعالجين والأسر.',
    },
    highlights: [
      {
        en: 'Designed individual care plans covering emotional, social and physical well-being.',
        ar: 'صمّمت خطط رعاية فردية تشمل الجوانب العاطفية والاجتماعية والجسدية.',
      },
      {
        en: 'Acted as a cultural and language bridge between children, families and professionals.',
        ar: 'كنت جسراً ثقافياً ولغوياً بين الأطفال وأسرهم والمختصين.',
      },
      {
        en: 'Handled crisis situations with de-escalation and quick coordination of the right support.',
        ar: 'تعاملت مع حالات الأزمات بالتهدئة والتنسيق السريع مع جهات الدعم المناسبة.',
      },
    ],
  },
];

export const degrees: Degree[] = [
  {
    id: 'master-level',
    title: { en: 'Master’s degree, Computer Science', ar: 'ماجستير علوم الحاسوب' },
    institution: { en: 'Kristianstad University', ar: 'جامعة كريستيانستاد' },
    programme: {
      en: 'Focus on machine learning, with mobile platforms, wireless network security and sustainable development',
      ar: 'بتركيز على تعلّم الآلة، مع منصات الجوال وأمن الشبكات اللاسلكية والتنمية المستدامة',
    },
    start: '2022-08',
    end: '2025-06',
    thesis: {
      title: {
        en: 'Leveraging AI for Creative Writing: Development and Evaluation of an AI-Assisted Tool for Children’s Book Creation',
        ar: 'توظيف الذكاء الاصطناعي في الكتابة الإبداعية: تطوير وتقييم أداة مدعومة بالذكاء الاصطناعي لتأليف كتب الأطفال',
      },
      distinction: true,
    },
    activities: [
      { en: 'Machine learning study groups', ar: 'مجموعات دراسة تعلّم الآلة' },
      { en: 'AI and data science seminars', ar: 'ندوات الذكاء الاصطناعي وعلم البيانات' },
      { en: 'Collaborative research workshops', ar: 'ورش بحث تعاونية' },
      { en: 'University hackathons', ar: 'هاكاثونات جامعية' },
      { en: 'Peer mentoring in programming and machine learning', ar: 'إرشاد الزملاء في البرمجة وتعلّم الآلة' },
      { en: 'Computer Science Student Association', ar: 'جمعية طلاب علوم الحاسوب' },
    ],
  },
  {
    id: 'bachelor',
    title: { en: 'BSc, Computer Science', ar: 'بكالوريوس العلوم في علوم الحاسوب' },
    institution: { en: 'Kristianstad University', ar: 'جامعة كريستيانستاد' },
    programme: { en: 'Bachelor Programme in Software Development (software engineering)', ar: 'برنامج بكالوريوس تطوير البرمجيات (هندسة البرمجيات)' },
    start: '2019-09',
    end: '2022-11',
    credits: 180,
    thesis: {
      title: { en: 'Rain Risk-Index Analysis', ar: 'تحليل مؤشر مخاطر الأمطار' },
      distinction: false,
    },
  },
];

export const diplomas: Diploma[] = [
  {
    id: 'graphic-design',
    title: { en: 'Diploma in graphic design', ar: 'دبلوم التصميم الجرافيكي' },
    institution: { en: 'General Telecom Institute', ar: 'معهد الاتصالات العام' },
    start: 2007,
    end: 2009,
    detail: {
      en: 'Photoshop, Illustrator, After Effects, 3ds Max and Flash. Graduation project graded A.',
      ar: 'فوتوشوب وإليستريتور وأفتر إفكتس و3ds Max وفلاش. مشروع التخرج بتقدير A.',
    },
  },
  {
    id: 'computer-maintenance',
    title: { en: 'Diploma in computer maintenance', ar: 'دبلوم صيانة الحاسوب' },
    institution: { en: 'General Telecom Institute', ar: 'معهد الاتصالات العام' },
    start: 2008,
    end: 2008,
    detail: { en: 'Hardware and computer engineering. Graded A.', ar: 'العتاد وهندسة الحاسوب. بتقدير A.' },
  },
];

const course = (
  code: string,
  en: string,
  ar: string,
  credits: number,
  cycle: 1 | 2,
  completed: string,
  distinction = false,
): Course => ({ code, name: { en, ar }, credits, cycle, completed, distinction });

/** Completed courses from the official transcript, oldest first. 222 credits in total. */
export const courses: Course[] = [
  course('DA110E', 'Fundamental Programming', 'أساسيات البرمجة', 7.5, 1, '2019-12'),
  course('DA120C', 'Project Course 1', 'مقرر المشروع 1', 7.5, 1, '2020-01', true),
  course('DA114C', 'Object-Oriented Programming', 'البرمجة كائنية التوجه', 7.5, 1, '2020-03', true),
  course('DA122C', 'Project Course 2', 'مقرر المشروع 2', 7.5, 1, '2020-06', true),
  course('DA113E', 'Database Technique', 'تقنيات قواعد البيانات', 7.5, 1, '2020-08'),
  course('DA100C', 'Introduction to Computer Science', 'مدخل إلى علوم الحاسوب', 7.5, 1, '2020-08'),
  course('DT271C', 'Operating Systems', 'أنظمة التشغيل', 7.5, 1, '2020-11'),
  course('MA252B', 'Discrete Mathematics', 'الرياضيات المتقطعة', 7.5, 1, '2020-11'),
  course('DT223B', 'Digital Electronic System Design', 'تصميم الأنظمة الإلكترونية الرقمية', 7.5, 1, '2021-01'),
  course('DA256C', 'Algorithms and Data Structures', 'الخوارزميات وهياكل البيانات', 7.5, 1, '2021-01'),
  course('DA224C', 'Development towards Mobile Platforms', 'التطوير لمنصات الجوال', 7.5, 1, '2021-03', true),
  course('DA270B', 'Data Communication', 'اتصالات البيانات', 7.5, 1, '2021-04'),
  course('DA216C', 'Software Engineering 1', 'هندسة البرمجيات 1', 7.5, 1, '2021-06', true),
  course('EN242K', 'International Relations in a Historical Perspective', 'العلاقات الدولية من منظور تاريخي', 15, 1, '2021-06'),
  course('DA273B', 'Computer Security', 'أمن الحاسوب', 7.5, 1, '2021-08'),
  course('DA374F', 'Network Applications', 'تطبيقات الشبكات', 7.5, 1, '2021-12'),
  course('DA326C', 'Software Engineering 2', 'هندسة البرمجيات 2', 15, 1, '2022-01'),
  course('IE301C', 'Entrepreneurship and Innovation', 'ريادة الأعمال والابتكار', 7.5, 1, '2022-01'),
  course('DA376E', 'Software Development for the Cloud', 'تطوير البرمجيات للسحابة', 7.5, 1, '2022-06'),
  course('DA377C', 'Software Development for the Web', 'تطوير البرمجيات للويب', 7.5, 1, '2022-09'),
  course('DA399C', 'Bachelor Thesis in Computer Science', 'رسالة البكالوريوس في علوم الحاسوب', 15, 1, '2022-11'),
  course('DT581B', 'Mobile Platforms', 'منصات الجوال', 6, 2, '2023-01', true),
  course('DT580C', 'Computer Science Methods and Sustainable Development', 'مناهج علوم الحاسوب والتنمية المستدامة', 6, 2, '2023-01'),
  course('DT586D', 'Project in Multidisciplinary Contexts', 'مشروع في سياقات متعددة التخصصات', 9, 2, '2023-04'),
  course('DT583D', 'Wireless Network Security', 'أمن الشبكات اللاسلكية', 6, 2, '2023-06', true),
  course('DT587C', 'Independent Master Thesis in Computer Science', 'رسالة ماجستير مستقلة في علوم الحاسوب', 15, 2, '2025-06', true),
];

export const projects: Project[] = [
  {
    id: 'joltna',
    name: 'Joltna',
    kind: 'web',
    start: '2023-01',
    url: 'https://www.joltna.com/',
    summary: {
      en: 'Rental platform for houses and entertainment venues, with booking, cancellation and pricing that adapts to the property and the stay.',
      ar: 'منصة لتأجير المنازل وأماكن الترفيه، مع الحجز والإلغاء وتسعير يتكيّف مع خصائص العقار ومدة الإقامة.',
    },
    features: [
      { en: 'Email, password and Google sign-in', ar: 'تسجيل الدخول بالبريد وكلمة المرور وجوجل' },
      { en: 'Image upload and management on Cloudinary', ar: 'رفع الصور وإدارتها عبر Cloudinary' },
      { en: 'Calendar booking with react-date-range', ar: 'حجز عبر التقويم باستخدام react-date-range' },
      { en: 'Owner tools to create and remove listings', ar: 'أدوات للمالكين لإضافة العقارات وحذفها' },
      { en: 'Unit and integration tests', ar: 'اختبارات الوحدة والتكامل' },
    ],
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Cloudinary', 'react-hook-form'],
  },
  {
    id: 'ai-childrens-books',
    name: 'AI children’s book studio',
    kind: 'research',
    start: '2025-03',
    end: '2025-06',
    summary: {
      en: 'My master’s thesis: designing, building and evaluating an AI-assisted tool that helps people create children’s books. Passed with distinction.',
      ar: 'رسالة الماجستير: تصميم وبناء وتقييم أداة مدعومة بالذكاء الاصطناعي تساعد على تأليف كتب الأطفال. نالت تقدير "ناجح بامتياز".',
    },
    features: [
      { en: 'AI-assisted creative writing for children’s books', ar: 'كتابة إبداعية لكتب الأطفال بمساعدة الذكاء الاصطناعي' },
      { en: 'Development and evaluation of the tool', ar: 'تطوير الأداة وتقييمها' },
    ],
    stack: ['Generative AI', 'Prompt engineering', 'Web'],
  },
  {
    id: 'hlkat-wsl-site',
    name: 'Hlkat Wsl',
    kind: 'web',
    start: '2023-03',
    end: '2023-04',
    url: 'https://www.hlkatwsl.com/',
    summary: {
      en: 'Website for a public relations firm covering media and government relations, content creation and public affairs. I built it full stack.',
      ar: 'موقع لشركة علاقات عامة يغطي العلاقات الإعلامية والحكومية وصناعة المحتوى والشؤون العامة. بنيته بالكامل من الواجهة إلى الخادم.',
    },
    features: [
      { en: 'Unit tests for each service area', ar: 'اختبارات وحدة لكل مجال خدمة' },
      { en: 'Integration and user acceptance testing', ar: 'اختبارات التكامل وقبول المستخدم' },
    ],
    stack: ['Full stack', 'Testing', 'UAT'],
  },
  {
    id: 'call-chat',
    name: 'Call & chat platform',
    kind: 'web',
    start: '2021-08',
    end: '2022-02',
    summary: {
      en: 'Real-time communication that brings messaging, voice and video calls together with collaboration tools.',
      ar: 'منصة تواصل فوري تجمع الرسائل والمكالمات الصوتية والمرئية مع أدوات للتعاون.',
    },
    features: [
      { en: 'Text, voice and video in one place', ar: 'نص وصوت وفيديو في مكان واحد' },
      { en: 'Project plan, requirements and feature delivery', ar: 'خطة المشروع والمتطلبات وتنفيذ الميزات' },
    ],
    stack: ['Real-time messaging', 'Voice and video', 'Cloud'],
  },
  {
    id: 'rain-risk',
    name: 'Rain risk index',
    kind: 'research',
    start: '2022-01',
    end: '2022-11',
    summary: {
      en: 'My bachelor’s thesis: analysing rainfall risk through a risk index and a simulation of water levels.',
      ar: 'رسالة البكالوريوس: تحليل مخاطر الأمطار عبر مؤشر للمخاطر ومحاكاة لمستوى المياه.',
    },
    features: [
      { en: 'Risk index model', ar: 'نموذج لمؤشر المخاطر' },
      { en: 'Water-level simulation', ar: 'محاكاة مستوى المياه' },
    ],
    stack: ['Data analysis', 'Simulation'],
  },
  {
    id: 'encryption-tool',
    name: 'Encryption tool',
    kind: 'desktop',
    start: '2022-04',
    end: '2022-04',
    summary: {
      en: 'Desktop app that encrypts files with a hash-based scheme and a key the user chooses.',
      ar: 'تطبيق سطح مكتب يشفّر الملفات بآلية قائمة على دوال الهاش ومفتاح يحدده المستخدم.',
    },
    features: [{ en: 'User-defined encryption key', ar: 'مفتاح تشفير يحدده المستخدم' }],
    stack: ['Java', 'JavaFX', 'Scene Builder'],
  },
  {
    id: 'car-usage',
    name: 'Car usage tracker',
    kind: 'web',
    start: '2021-04',
    end: '2021-07',
    summary: {
      en: 'Role-based system for organisations and individuals to track how their cars are used.',
      ar: 'نظام قائم على الأدوار يتيح للمؤسسات والأفراد تتبّع استخدام سياراتهم.',
    },
    features: [
      { en: 'Role-based access', ar: 'صلاحيات حسب الدور' },
      { en: 'REST API over MongoDB, hosted on Heroku', ar: 'واجهة REST فوق MongoDB مستضافة على Heroku' },
    ],
    stack: ['Node.js', 'MongoDB', 'Heroku', 'CSS'],
  },
  {
    id: 'cinema',
    name: 'Cinema website',
    kind: 'web',
    start: '2021-01',
    end: '2021-03',
    summary: {
      en: 'Interactive cinema site with listings and a scalable back end.',
      ar: 'موقع سينما تفاعلي لعرض الأفلام مع خادم قابل للتوسع.',
    },
    features: [{ en: 'Node.js API with SQLite', ar: 'واجهة برمجية بـ Node.js مع SQLite' }],
    stack: ['JavaScript', 'Node.js', 'SQLite', 'Heroku'],
  },
  {
    id: 'studying-tool',
    name: 'Studying tool',
    kind: 'mobile',
    summary: {
      en: 'Android app that keeps a student’s tasks and conversations with teachers and classmates in one place, with chat and games.',
      ar: 'تطبيق أندرويد يجمع مهام الطالب ومحادثاته مع المعلمين والزملاء في مكان واحد، مع دردشة وألعاب.',
    },
    features: [
      { en: 'Role-based views for students and teachers', ar: 'واجهات حسب الدور للطلاب والمعلمين' },
      { en: 'Chat and games', ar: 'دردشة وألعاب' },
    ],
    stack: ['Android', 'Java'],
  },
  {
    id: 'covid-hospital',
    name: 'CovidHospital19',
    kind: 'desktop',
    start: '2019-09',
    end: '2019-11',
    summary: {
      en: 'Hospital management application with a different interface for every role.',
      ar: 'تطبيق لإدارة المستشفى بواجهة مختلفة لكل دور.',
    },
    features: [{ en: 'Hibernate mapping to MySQL', ar: 'ربط Hibernate مع MySQL' }],
    stack: ['Java', 'JavaFX', 'Hibernate', 'MySQL'],
  },
];

export const certificates: Certificate[] = [
  {
    id: 'edraak-ml',
    name: { en: 'Data Science and Machine Learning', ar: 'علم البيانات وتعلّم الآلة' },
    issuer: 'Edraak',
    year: 2024,
    summary: {
      en: 'Course on the data science workflow and core machine learning methods.',
      ar: 'مقرر في مراحل علم البيانات وأساليب تعلّم الآلة الأساسية.',
    },
  },
  {
    id: 'hp-data-science',
    name: { en: 'Data Science and Analytics', ar: 'علم البيانات والتحليلات' },
    issuer: 'HP LIFE',
    year: 2024,
    summary: {
      en: 'Data-driven business models, the role of ML and AI, data ethics and cybersecurity in data applications.',
      ar: 'نماذج الأعمال المعتمدة على البيانات، ودور تعلّم الآلة والذكاء الاصطناعي، وأخلاقيات البيانات والأمن السيبراني في تطبيقاتها.',
    },
  },
  {
    id: 'hp-digital-business',
    name: { en: 'Digital Business Skills', ar: 'مهارات الأعمال الرقمية' },
    issuer: 'HP LIFE',
    year: 2024,
    summary: {
      en: 'Agile project management with Scrum and Kanban, applied to real projects.',
      ar: 'إدارة المشاريع الرشيقة باستخدام Scrum وKanban وتطبيقها على مشاريع حقيقية.',
    },
  },
  {
    id: 'aws-deepracer',
    name: { en: 'AWS DeepRacer Student League', ar: 'دوري طلاب AWS DeepRacer' },
    issuer: 'Amazon',
    year: 2023,
    summary: {
      en: 'Completed Amazon’s AI & ML Scholarship programme and the DeepRacer reinforcement-learning league.',
      ar: 'أكملت برنامج منحة أمازون للذكاء الاصطناعي وتعلّم الآلة ودوري DeepRacer للتعلّم المعزّز.',
    },
  },
  {
    id: 'prompt-engineering',
    name: { en: 'AI bootcamp: prompt engineering', ar: 'معسكر الذكاء الاصطناعي: هندسة الأوامر' },
    issuer: 'Udemy',
    year: 2023,
    summary: {
      en: 'Hands-on practice with current AI tools applied to real projects.',
      ar: 'تطبيق عملي لأحدث أدوات الذكاء الاصطناعي على مشاريع حقيقية.',
    },
  },
];

/**
 * Skills from the CV and LinkedIn. `verified` marks the ones with a passed LinkedIn skill assessment.
 */
export const skills: Skill[] = [
  // Front-end
  { name: 'React', domain: 'frontend', tier: 'core', verified: true },
  { name: 'JavaScript', domain: 'frontend', tier: 'core', verified: true },
  { name: 'HTML', domain: 'frontend', tier: 'core', verified: true },
  { name: 'CSS', domain: 'frontend', tier: 'core', verified: true },
  { name: 'TypeScript', domain: 'frontend', tier: 'core' },
  { name: 'jQuery', domain: 'frontend', tier: 'proficient', verified: true },
  { name: 'Next.js', domain: 'frontend', tier: 'proficient' },
  { name: 'Tailwind CSS', domain: 'frontend', tier: 'proficient' },
  { name: 'Angular', domain: 'frontend', tier: 'familiar' },
  // Back-end
  { name: 'Java', domain: 'backend', tier: 'core', verified: true },
  { name: 'Spring', domain: 'backend', tier: 'core', verified: true },
  { name: 'Python', domain: 'backend', tier: 'core', verified: true },
  { name: 'Node.js', domain: 'backend', tier: 'core', verified: true },
  { name: 'C#', domain: 'backend', tier: 'core', verified: true },
  { name: '.NET', domain: 'backend', tier: 'core', verified: true },
  { name: 'REST APIs', domain: 'backend', tier: 'core', verified: true },
  { name: 'OOP', domain: 'backend', tier: 'core', verified: true },
  { name: 'ASP.NET Core', domain: 'backend', tier: 'proficient' },
  { name: 'Express', domain: 'backend', tier: 'proficient' },
  { name: 'NestJS', domain: 'backend', tier: 'proficient' },
  { name: 'Hibernate', domain: 'backend', tier: 'proficient' },
  { name: 'Servlets', domain: 'backend', tier: 'proficient' },
  { name: 'Tomcat', domain: 'backend', tier: 'proficient' },
  { name: 'Multithreading', domain: 'backend', tier: 'familiar' },
  // Data
  { name: 'SQL', domain: 'data', tier: 'core' },
  { name: 'MongoDB', domain: 'data', tier: 'core', verified: true },
  { name: 'MySQL', domain: 'data', tier: 'core', verified: true },
  { name: 'NoSQL', domain: 'data', tier: 'core' },
  { name: 'PostgreSQL', domain: 'data', tier: 'proficient' },
  { name: 'SQLite', domain: 'data', tier: 'familiar' },
  { name: 'Real-time databases', domain: 'data', tier: 'familiar' },
  // AI and data science
  { name: 'Machine learning', domain: 'ai', tier: 'proficient' },
  { name: 'Generative AI', domain: 'ai', tier: 'proficient' },
  { name: 'Data analysis', domain: 'ai', tier: 'proficient' },
  { name: 'TensorFlow', domain: 'ai', tier: 'familiar' },
  { name: 'Model training', domain: 'ai', tier: 'familiar' },
  { name: 'Text analytics', domain: 'ai', tier: 'familiar' },
  { name: 'Apache Spark', domain: 'ai', tier: 'familiar' },
  { name: 'Big data', domain: 'ai', tier: 'familiar' },
  { name: 'Data mining', domain: 'ai', tier: 'familiar' },
  // Delivery, testing and security
  { name: 'Git', domain: 'delivery', tier: 'core', verified: true },
  { name: 'Agile', domain: 'delivery', tier: 'core' },
  { name: 'Unit testing', domain: 'delivery', tier: 'core' },
  { name: 'JUnit', domain: 'delivery', tier: 'proficient' },
  { name: 'Integration testing', domain: 'delivery', tier: 'proficient' },
  { name: 'Test-driven development', domain: 'delivery', tier: 'proficient' },
  { name: 'Linux', domain: 'delivery', tier: 'proficient' },
  { name: 'Heroku', domain: 'delivery', tier: 'proficient' },
  { name: 'Azure DevOps', domain: 'delivery', tier: 'familiar' },
  { name: 'AWS', domain: 'delivery', tier: 'familiar' },
  { name: 'Google Cloud', domain: 'delivery', tier: 'familiar' },
  { name: 'Docker', domain: 'delivery', tier: 'familiar' },
  { name: 'Jenkins', domain: 'delivery', tier: 'familiar' },
  { name: 'OWASP', domain: 'delivery', tier: 'familiar' },
  // Mobile and desktop
  { name: 'Android', domain: 'mobile', tier: 'proficient' },
  { name: 'JavaFX', domain: 'mobile', tier: 'proficient' },
  { name: 'React Native', domain: 'mobile', tier: 'proficient' },
  { name: 'UX design', domain: 'mobile', tier: 'proficient' },
  { name: 'Flutter', domain: 'mobile', tier: 'familiar' },
];
