/**
 * Moroccan Math MCP Server - Core Domain Types
 * Defines data contracts for the Moroccan curriculum, tools, and verification engine.
 */

export type EducationCycle = 'college' | 'lycee_qualifiant';

export type MoroccanEducationLevel =
  | '1AC'         // الأولى إعدادي (1ère Année Collégiale - 1AC)
  | '3APIC'       // السنة الثالثة ثانوي إعدادي (3ème Année Collège)
  | 'TCS'         // الجذع المشترك العلمي والتكنولوجي (Tronc Commun Scientifique)
  | '1BAC_SM'     // الأولى بكالوريا علوم رياضية (1ère Bac Sciences Mathématiques)
  | '1BAC_EXP'    // الأولى بكالوريا علوم تجريبية (1ère Bac Sciences Expérimentales)
  | '2BAC_SM'     // الثانية بكالوريا علوم رياضية (2ème Bac Sciences Mathématiques A/B)
  | '2BAC_PC_SVT';// الثانية بكالوريا علوم تجريبية (PC / SVT)

export type MathDomain =
  | 'arithmetic'      // الحسابيات (Arithmétique)
  | 'algebra'         // الجبر والتحليل الأولي (Algèbre)
  | 'geometry'        // الهندسة والمستقيم في المستوى والفضاء (Géométrie)
  | 'trigonometry'    // الحساب المثلثي (Trigonométrie)
  | 'analysis'        // التحليل والدوال والاتصال والاشتقاق (Analyse)
  | 'complex_numbers' // الأعداد العقدية (Nombres complexes)
  | 'probability'     // الاحتمالات والإحصاء (Probabilités et Statistiques);

export interface CurriculumSourceReference {
  sourceName: string;
  officialDocument?: string;
  status: 'pilot_data' | 'official_curriculum';
  noteAr: string;
  noteFr: string;
}

export interface LessonConcept {
  id: string;
  name: string;
  formalDefinition: string;
  summary?: string;
  keywords?: string[];
}

export interface CommonMistake {
  id: string;
  mistakeDescription: string;
  whyItHappens?: string;
  howToCorrect?: string;
}

export interface LessonExample {
  id: string;
  title: string;
  prompt: string;
  stepByStepSolution: string[];
  finalAnswer: string;
}

export interface MoroccanLesson {
  id: string;
  code: string;
  level: MoroccanEducationLevel;
  cycle: EducationCycle;
  domain: MathDomain;
  titleAr: string;
  titleFr: string;
  semester: 1 | 2;
  objectives: string[];
  prerequisites: string[];
  targetedSkills: string[];
  isPilotData: boolean;
  reference: CurriculumSourceReference;
  concepts?: LessonConcept[];
  commonMistakes?: CommonMistake[];
  examples?: LessonExample[];
  curriculumPackId?: string;
}

export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

export interface GeneratedExercise {
  id: string;
  lessonId: string;
  lessonTitleAr: string;
  lessonTitleFr: string;
  level: MoroccanEducationLevel;
  skill: string;
  difficulty: ExerciseDifficulty;
  statementAr: string;
  statementFr: string;
  hintsAr?: string[];
  hintsFr?: string[];
  referenceSolution: {
    stepsAr: string[];
    stepsFr: string[];
    finalAnswer: string;
    testVerificationKey?: string;
  };
  evaluationRubricAr?: string[];
  isPilotData: boolean;
  contentTag: 'PILOT_EXPERIMENTAL_DATA' | 'OFFICIAL_CURRICULUM_BASELINE';
}

export type CalculationOperationType =
  | 'arithmetic'           // عمليات عددية وحساب قوى وجذور
  | 'fraction'             // تبسيط وجمع وطرح وضرب الكسور
  | 'gcd_lcm'              // القاسم المشترك الأكبر والمضاعف المشترك الأصغر
  | 'quadratic_equation'   // معادلات من الدرجة الثانية بمجهول واحد
  | 'linear_system_2x2'    // نظمة معادلتين من الدرجة الأولى بمجهولين
  | 'modular_arithmetic';  // الحسابيات المعيارية والتطابقات في Z

export interface CalculationVerificationRequest {
  operationType: CalculationOperationType;
  parameters: Record<string, any>;
  expectedResult?: string | number;
}

export interface CalculationVerificationResult {
  verified: boolean;
  operationType: CalculationOperationType;
  normalizedInput: string;
  computedResult: string | number | Record<string, any>;
  matchesExpected?: boolean;
  stepByStepStepsAr: string[];
  stepByStepStepsFr: string[];
  verificationBoundariesNoticeAr: string;
  verificationBoundariesNoticeFr: string;
  isPilotVerifier: boolean;
}
