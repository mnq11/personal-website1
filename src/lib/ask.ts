import {
  certificates,
  degrees,
  projects,
  roles,
  skills,
  type Degree,
  type Project,
  type Role,
  type Skill,
  type SkillDomain,
} from '../data/resume';
import { buildStats, type StatId } from './stats';

/**
 * "Ask my CV": turns a free-text question, in English or Arabic, into a structured answer built
 * only from the resume data, plus the place on the page that answer lives. It is plain keyword
 * matching on purpose: no server, no key, and an answer can never say more than the data does.
 */

export type SectionId = 'about' | 'numbers' | 'skills' | 'experience' | 'projects' | 'education' | 'writing' | 'contact';

/** Where an answer lives on the page; the sections react to it. */
export interface Target {
  section: SectionId;
  skill?: string;
  domain?: SkillDomain;
  projectId?: string;
  roleId?: string;
  stat?: StatId;
}

export type Topic = 'contact' | 'location' | 'languages' | 'certificates' | 'projects' | 'writing' | 'about' | 'help';

export type Answer =
  | { kind: 'skill'; skill: Skill; projects: Project[]; target: Target }
  | { kind: 'tech'; name: string; projects: Project[]; target: Target }
  | { kind: 'domain'; domain: SkillDomain; skills: Skill[]; target: Target }
  | { kind: 'project'; project: Project; latest: boolean; target: Target }
  | { kind: 'role'; role: Role; target: Target }
  | { kind: 'degree'; degree: Degree; target: Target }
  | { kind: 'stat'; stat: StatId; value: number; target: Target }
  | { kind: 'topic'; topic: Topic; target: Target }
  | { kind: 'none' };

/** Lower-cases, strips diacritics and Arabic spelling variants, and keeps letters, digits and + # . */
export function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#.]+/gu, ' ')
    .replace(/(^|\s)\.+|\.+(?=\s|$)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

const ARABIC_PREFIXES = ['وبال', 'وال', 'بال', 'كال', 'فال', 'لل', 'ال', 'و', 'ب', 'ل', 'ف', 'ك'];

/** A word as written, plus the word without Arabic prefixes (و، ب، ل، ال…) so "بالجافا" finds "جافا". */
function variants(token: string): string[] {
  const out = [token];
  if (/[؀-ۿ]/.test(token)) {
    for (const prefix of ARABIC_PREFIXES) {
      if (token.startsWith(prefix) && token.length - prefix.length >= 3) out.push(token.slice(prefix.length));
    }
  }
  return out;
}

type Phrase = string[];

const phrase = (text: string): Phrase => normalize(text).split(' ').filter(Boolean);

function matchLength(query: string[][], needle: Phrase): number {
  if (needle.length === 0) return 0;
  for (let start = 0; start + needle.length <= query.length; start++) {
    if (needle.every((word, offset) => query[start + offset]?.includes(word))) return needle.length;
  }
  return 0;
}

interface Entry<T> {
  phrases: Phrase[];
  value: T;
}

function entry<T>(value: T, ...names: string[]): Entry<T> {
  return { value, phrases: names.map(phrase).filter((p) => p.length > 0) };
}

/** Spoken-name aliases, English and Arabic, for skills whose written name is not what people type. */
const SKILL_ALIASES: Record<string, string[]> = {
  React: ['reactjs', 'react js', 'رياكت', 'ريأكت'],
  JavaScript: ['js', 'ecmascript', 'جافا سكربت', 'جافاسكربت', 'جافا سكريبت', 'جافاسكريبت'],
  TypeScript: ['ts', 'تايب سكربت', 'تايبسكربت', 'تايب سكريبت'],
  'Next.js': ['next', 'nextjs', 'next js', 'نكست'],
  'Tailwind CSS': ['tailwind', 'تيلويند'],
  Angular: ['angularjs', 'انجولار', 'أنجولار'],
  HTML: ['html5', 'اتش تي ام ال'],
  CSS: ['css3', 'سي اس اس'],
  jQuery: ['جي كويري'],
  Java: ['جافا'],
  Spring: ['spring boot', 'springboot', 'spring framework', 'سبرينج', 'سبرنج', 'سبرينق'],
  Python: ['py', 'بايثون', 'بايثن'],
  'Node.js': ['node', 'nodejs', 'node js', 'نود', 'نود جي اس'],
  'C#': ['csharp', 'c sharp', 'سي شارب'],
  '.NET': ['dotnet', 'dot net', 'net core', '.net core', 'دوت نت'],
  'REST APIs': ['rest', 'api', 'apis', 'restful', 'ريست', 'واجهات برمجيه'],
  OOP: ['object oriented', 'البرمجه الكائنيه', 'برمجه كائنيه'],
  'ASP.NET Core': ['asp.net', 'asp net', 'aspnet', 'asp'],
  Express: ['expressjs', 'express js', 'اكسبريس'],
  NestJS: ['nest', 'nest js', 'nestjs', 'نيست'],
  Hibernate: ['هايبرنيت'],
  SQL: ['اس كيو ال', 'sql server'],
  MongoDB: ['mongo', 'مونجو', 'مونغو'],
  MySQL: ['ماي اس كيو ال'],
  NoSQL: ['no sql', 'نو اس كيو ال'],
  PostgreSQL: ['postgres', 'بوستجرس', 'بوستغرس'],
  'Machine learning': ['ml', 'تعلم الاله', 'تعلم آلي', 'التعلم الالي'],
  'Generative AI': ['genai', 'gen ai', 'llm', 'llms', 'chatgpt', 'prompt engineering', 'الذكاء التوليدي'],
  'Data analysis': ['analytics', 'تحليل البيانات'],
  TensorFlow: ['tensor flow', 'تنسرفلو', 'تنسورفلو'],
  'Apache Spark': ['spark', 'pyspark', 'سبارك'],
  'Big data': ['bigdata', 'البيانات الضخمه'],
  Git: ['github', 'جيت', 'جيت هب'],
  Agile: ['scrum', 'agile scrum', 'اجايل', 'ايجايل', 'سكرم'],
  'Unit testing': ['unit tests', 'unit test', 'اختبار الوحدات'],
  JUnit: ['junit5', 'جي يونيت'],
  'Test-driven development': ['tdd', 'test driven', 'test driven development'],
  Linux: ['ubuntu', 'لينكس'],
  'Azure DevOps': ['azure', 'devops', 'ازور'],
  AWS: ['amazon web services', 'deepracer', 'امازون'],
  'Google Cloud': ['gcp', 'google cloud platform'],
  Docker: ['containers', 'دوكر', 'دوكير'],
  Android: ['اندرويد'],
  'React Native': ['rn', 'ريأكت نيتف', 'رياكت نيتف'],
  Flutter: ['dart', 'فلاتر'],
  'UX design': ['ux', 'ui ux', 'تصميم تجربه المستخدم'],
  JavaFX: ['java fx', 'جافا اف اكس'],
};

const DOMAIN_WORDS: Record<SkillDomain, string[]> = {
  frontend: ['front end', 'frontend', 'front-end', 'ui', 'الواجهات', 'واجهات', 'فرونت اند', 'فرونت'],
  backend: ['back end', 'backend', 'back-end', 'server side', 'server', 'servers', 'الخوادم', 'خوادم', 'باك اند', 'باك'],
  data: ['database', 'databases', 'data', 'قواعد البيانات', 'قاعده بيانات', 'قواعد بيانات', 'داتابيس', 'البيانات'],
  ai: ['ai', 'artificial intelligence', 'data science', 'الذكاء الاصطناعي', 'ذكاء اصطناعي', 'علم البيانات'],
  delivery: ['testing', 'tests', 'devops', 'security', 'ci cd', 'cicd', 'الاختبار', 'اختبار', 'الامن', 'امن'],
  mobile: ['mobile', 'desktop', 'apps', 'الجوال', 'جوال', 'موبايل', 'تطبيقات الجوال', 'سطح المكتب'],
};

const TOPIC_WORDS: Record<Topic, string[]> = {
  contact: ['contact', 'email', 'e-mail', 'mail', 'reach you', 'reach out', 'hire', 'hiring', 'available', 'message you', 'get in touch', 'تواصل', 'اتواصل', 'التواصل', 'بريد', 'ايميل', 'راسل', 'توظيف', 'اوظفك', 'متاح'],
  location: ['where do you live', 'where are you based', 'where are you from', 'where you live', 'location', 'based in', 'country', 'city', 'sweden', 'egypt', 'cairo', 'skane', 'اين تسكن', 'اين تعيش', 'اين تقيم', 'اين تقطن', 'مكان', 'بلد', 'تسكن', 'تعيش', 'السويد', 'مصر', 'القاهره'],
  languages: ['speak', 'spoken', 'swedish', 'native language', 'تتكلم', 'تتحدث', 'اللغات', 'سويدي', 'السويديه'],
  certificates: ['certificate', 'certificates', 'certified', 'courses', 'course', 'شهاده', 'شهادات', 'دورات', 'دوره'],
  projects: ['projects', 'project', 'portfolio', 'built', 'build', 'made', 'مشاريع', 'مشروع', 'اعمالك', 'بنيت', 'اعمال'],
  writing: ['article', 'articles', 'blog', 'writing', 'write', 'dev.to', 'مقالات', 'مقاله', 'تكتب', 'مدونه', 'كتابه'],
  about: ['who are you', 'about you', 'about yourself', 'introduce', 'yourself', 'strengths', 'how do you work', 'من انت', 'عن نفسك', 'نبذه', 'عرفني', 'كيف تعمل', 'مميزاتك', 'صفاتك'],
  help: ['hi', 'hello', 'hey', 'help', 'مرحبا', 'اهلا', 'السلام عليكم', 'مساعده', 'ماذا يمكنني'],
};

const LATEST_WORDS = ['latest', 'recent', 'newest', 'last', 'احدث', 'اخر', 'اخير', 'الاخير', 'حديث'];
const WORK_WORDS = ['work', 'works', 'working', 'job', 'employer', 'company', 'currently', 'role', 'position', 'اعمل', 'تعمل', 'وظيفه', 'شركه', 'حاليا', 'عملك', 'منصبك'];
const STUDY_WORDS = ['study', 'studied', 'degree', 'university', 'education', 'thesis', 'school', 'graduate', 'دراسه', 'درست', 'تدرس', 'جامعه', 'تخرجت', 'رساله', 'تعليم', 'تعليمك'];
const MASTER_WORDS = ['master', 'masters', 'msc', 'ماجستير'];
const BACHELOR_WORDS = ['bachelor', 'bachelors', 'bsc', 'بكالوريوس'];
const COUNT_WORDS = ['how many', 'count', 'number of', 'كم', 'عدد'];
const YEARS_WORDS = ['years', 'experience', 'how long', 'since', 'سنوات', 'خبره', 'خبرتك', 'منذ', 'سنه'];
const STAT_NOUNS: Record<string, StatId> = {
  project: 'projects',
  projects: 'projects',
  skill: 'skills',
  skills: 'skills',
  course: 'courses',
  courses: 'courses',
  credit: 'credits',
  credits: 'credits',
  certificate: 'certificates',
  certificates: 'certificates',
  مشاريع: 'projects',
  مشروع: 'projects',
  مهارات: 'skills',
  مهاره: 'skills',
  مقررات: 'courses',
  مقرر: 'courses',
  وحدات: 'credits',
  شهادات: 'certificates',
};

const TOPIC_SECTION: Record<Topic, SectionId> = {
  contact: 'contact',
  location: 'about',
  languages: 'about',
  certificates: 'education',
  projects: 'projects',
  writing: 'writing',
  about: 'about',
  help: 'about',
};

const wordsOf = (list: string[]): Phrase[] => list.map(phrase);

function best(query: string[][], list: Phrase[]): number {
  return list.reduce((top, item) => Math.max(top, matchLength(query, item)), 0);
}

/** The most recent project: the one with the latest start month. */
function latestProject(): Project | undefined {
  return [...projects].sort((a, b) => (b.start ?? '').localeCompare(a.start ?? ''))[0];
}

interface Candidate {
  score: number;
  answer: Answer;
}

const skillEntries = skills.map((skill) => entry(skill, skill.name, ...(SKILL_ALIASES[skill.name] ?? [])));

const stackNames = [...new Set(projects.flatMap((project) => project.stack))].filter(
  (name) => !skills.some((skill) => normalize(skill.name) === normalize(name)),
);
const techEntries = stackNames.map((name) => entry(name, name));

const roleEntries = roles.map((role) =>
  entry(
    role,
    role.organisation.en.split(',')[0] ?? role.organisation.en,
    role.organisation.ar.replace(/\(.*?\)/g, '').split('،')[0] ?? role.organisation.ar,
    role.organisation.ar.match(/\((.*?)\)/)?.[1] ?? '',
  ),
);

const projectEntries = projects.map((project) => entry(project, project.name, project.id.replace(/-/g, ' ')));

const domainEntries = (Object.keys(DOMAIN_WORDS) as SkillDomain[]).map((domain) => entry(domain, ...DOMAIN_WORDS[domain]));

function usingProjects(name: string): Project[] {
  const wanted = normalize(name);
  const aliases = (SKILL_ALIASES[name] ?? []).map(normalize);
  return projects.filter((project) =>
    project.stack.some((item) => {
      const n = normalize(item);
      return n === wanted || aliases.includes(n);
    }),
  );
}

/** Answers a question from the resume data, or `{ kind: 'none' }` when it has nothing to say. */
export function ask(question: string): Answer {
  const text = normalize(question);
  if (!text) return { kind: 'none' };
  const query = text.split(' ').map(variants);
  const has = (list: string[]) => best(query, wordsOf(list)) > 0;

  const wantsProjects = has(TOPIC_WORDS.projects) || has(['use', 'used', 'using', 'with', 'استخدمت', 'باستخدام']);
  const candidates: Candidate[] = [];

  // "How many projects?" and "how many years?" read a headline number.
  const stats = buildStats();
  if (has(COUNT_WORDS) || has(YEARS_WORDS)) {
    const noun = query.flat().map((word) => STAT_NOUNS[word]).find(Boolean);
    const wanted: StatId | undefined = noun ?? (has(YEARS_WORDS) ? 'years' : undefined);
    const stat = stats.find((item) => item.id === wanted);
    if (stat) {
      // The skyline is the picture of these numbers, so the tower itself lights up.
      candidates.push({ score: 9, answer: { kind: 'stat', stat: stat.id, value: stat.value, target: { section: 'numbers', stat: stat.id } } });
    }
  }

  for (const item of skillEntries) {
    const length = Math.max(0, ...item.phrases.map((p) => matchLength(query, p)));
    if (length === 0) continue;
    const used = usingProjects(item.value.name);
    const target: Target =
      wantsProjects && used[0]
        ? { section: 'projects', projectId: used[0].id, skill: item.value.name, domain: item.value.domain }
        : { section: 'skills', skill: item.value.name, domain: item.value.domain };
    candidates.push({ score: 10 * length + 1, answer: { kind: 'skill', skill: item.value, projects: used, target } });
  }

  for (const item of techEntries) {
    const length = Math.max(0, ...item.phrases.map((p) => matchLength(query, p)));
    if (length === 0) continue;
    const used = usingProjects(item.value);
    candidates.push({
      score: 10 * length,
      answer: { kind: 'tech', name: item.value, projects: used, target: { section: 'projects', ...(used[0] ? { projectId: used[0].id } : {}) } },
    });
  }

  for (const item of domainEntries) {
    const length = Math.max(0, ...item.phrases.map((p) => matchLength(query, p)));
    if (length === 0) continue;
    const inDomain = skills.filter((skill) => skill.domain === item.value);
    candidates.push({
      score: 8 * length,
      answer: { kind: 'domain', domain: item.value, skills: inDomain, target: { section: 'skills', domain: item.value } },
    });
  }

  for (const item of roleEntries) {
    const length = Math.max(0, ...item.phrases.map((p) => matchLength(query, p)));
    if (length === 0) continue;
    candidates.push({ score: 12 * length, answer: { kind: 'role', role: item.value, target: { section: 'experience', roleId: item.value.id } } });
  }

  for (const item of projectEntries) {
    const length = Math.max(0, ...item.phrases.map((p) => matchLength(query, p)));
    if (length === 0) continue;
    candidates.push({
      score: 11 * length,
      answer: { kind: 'project', project: item.value, latest: false, target: { section: 'projects', projectId: item.value.id } },
    });
  }

  if (has(LATEST_WORDS) && (has(TOPIC_WORDS.projects) || !has(WORK_WORDS))) {
    const latest = latestProject();
    if (latest) {
      candidates.push({
        score: 14,
        answer: { kind: 'project', project: latest, latest: true, target: { section: 'projects', projectId: latest.id } },
      });
    }
  }

  if (has(WORK_WORDS)) {
    const current = roles.find((role) => !role.end) ?? roles[0];
    if (current) {
      candidates.push({ score: 7, answer: { kind: 'role', role: current, target: { section: 'experience', roleId: current.id } } });
    }
  }

  if (has(STUDY_WORDS) || has(MASTER_WORDS) || has(BACHELOR_WORDS)) {
    const wanted = has(BACHELOR_WORDS) && !has(MASTER_WORDS) ? 'bachelor' : 'master-level';
    const degree = degrees.find((item) => item.id === wanted) ?? degrees[0];
    if (degree) {
      candidates.push({ score: 7 + (has(MASTER_WORDS) || has(BACHELOR_WORDS) ? 1 : 0), answer: { kind: 'degree', degree, target: { section: 'education' } } });
    }
  }

  for (const topic of Object.keys(TOPIC_WORDS) as Topic[]) {
    const length = best(query, wordsOf(TOPIC_WORDS[topic]));
    if (length === 0) continue;
    // Courses are a certificate-style question, but a studies question beats them.
    const score = (topic === 'help' ? 3 : topic === 'projects' ? 5 : 6) * length;
    candidates.push({ score, answer: { kind: 'topic', topic, target: { section: TOPIC_SECTION[topic] } } });
  }

  const winner = candidates.sort((a, b) => b.score - a.score)[0];
  return winner ? winner.answer : { kind: 'none' };
}

/** The skill names a few suggested questions can be tried against; used to keep suggestions honest. */
export const askCoverage = { skills: skills.length, projects: projects.length, certificates: certificates.length };
