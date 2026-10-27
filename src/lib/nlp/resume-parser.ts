export interface ParsedResume {
  rawText: string;
  name?: string;
  email?: string;
  skills: string[];
  estimatedExperienceYears: number;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  projects: string[];
  education: string[];
}

export interface JdAlignment {
  matchScore: number; // 0 - 100%
  matchedSkills: string[];
  missingSkills: string[];
  recommendedTopics: string[];
}

const COMMON_TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'rust',
  'react', 'next.js', 'vue', 'angular', 'node.js', 'express', 'nestjs', 'fastapi',
  'django', 'flask', 'spring boot', 'postgresql', 'mysql', 'mongodb', 'redis',
  'graphql', 'rest api', 'docker', 'kubernetes', 'aws', 'gcp', 'azure',
  'git', 'ci/cd', 'kafka', 'rabbitmq', 'microservices', 'system design',
  'tailwind css', 'prisma', 'drizzle', 'linux', 'nlp', 'llm', 'machine learning'
];

/**
 * Extracts structured skills, projects, and experience level from raw resume text.
 */
export function parseResumeText(rawText: string): ParsedResume {
  const normalized = rawText.toLowerCase();

  // 1. Email extraction
  const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const email = emailMatch ? emailMatch[0] : undefined;

  // 2. Skill matching
  const skills: string[] = [];
  for (const skill of COMMON_TECH_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|\\W)${escaped}(\\W|$)`, 'i');
    if (regex.test(normalized)) {
      skills.push(skill);
    }
  }

  // 3. Years of experience estimation
  let estimatedYears = 2; // Default mid
  const yearMatches = normalized.match(/(\d+)\+?\s*(?:years|yrs)\b/g);
  if (yearMatches) {
    const numbers = yearMatches.map(m => parseInt(m.match(/\d+/)![0], 10)).filter(n => n > 0 && n < 40);
    if (numbers.length > 0) {
      estimatedYears = Math.max(...numbers);
    }
  }

  // 4. Experience Level
  let experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' = 'Mid';
  if (estimatedYears <= 2) experienceLevel = 'Entry';
  else if (estimatedYears <= 5) experienceLevel = 'Mid';
  else if (estimatedYears <= 9) experienceLevel = 'Senior';
  else experienceLevel = 'Lead';

  // 5. Rough project extraction (look for project or experience blocks)
  const projects: string[] = [];
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 20);
  for (const line of lines) {
    if (/project|built|developed|architected|created|implemented|redesigned/i.test(line)) {
      projects.push(line);
      if (projects.length >= 5) break;
    }
  }

  // 6. Education
  const education: string[] = [];
  for (const line of lines) {
    if (/bachelor|master|b\.s\.|m\.s\.|phd|degree|university|institute/i.test(line)) {
      education.push(line);
      if (education.length >= 3) break;
    }
  }

  return {
    rawText,
    email,
    skills,
    estimatedExperienceYears: estimatedYears,
    experienceLevel,
    projects,
    education,
  };
}

/**
 * Compares candidate resume against a Job Description to generate alignment scores and interview blueprint.
 */
export function alignResumeWithJd(parsedResume: ParsedResume, jdText: string): JdAlignment {
  const normalizedJd = jdText.toLowerCase();

  // Find which known skills are mentioned in the JD
  const jdRequiredSkills: string[] = [];
  for (const skill of COMMON_TECH_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|\\W)${escaped}(\\W|$)`, 'i');
    if (regex.test(normalizedJd)) {
      jdRequiredSkills.push(skill);
    }
  }

  const candidateSkills = new Set(parsedResume.skills.map(s => s.toLowerCase()));
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of jdRequiredSkills) {
    if (candidateSkills.has(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  let matchScore = 70;
  if (jdRequiredSkills.length > 0) {
    matchScore = Math.round((matchedSkills.length / jdRequiredSkills.length) * 100);
  }

  const recommendedTopics = [
    ...matchedSkills.slice(0, 3).map(s => `Deep-dive on ${s} implementation in recent project`),
    ...missingSkills.slice(0, 2).map(s => `Assess willingness & foundation in ${s}`),
    'System scalability & architecture tradeoff assessment',
    'Behavioral: Conflict resolution & cross-functional communication'
  ];

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    recommendedTopics,
  };
}
