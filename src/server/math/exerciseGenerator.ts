import {
  MoroccanLesson,
  ExerciseDifficulty,
  GeneratedExercise
} from '../types.ts';
import { defaultCurriculumRepository } from '../curriculum/repository.ts';

export interface GenerateExercisesRequest {
  lessonId: string;
  skill?: string;
  difficulty?: ExerciseDifficulty;
  count?: number;
}

export interface GenerateExercisesResponse {
  lesson: {
    id: string;
    titleAr: string;
    titleFr: string;
    level: string;
  };
  totalGenerated: number;
  exercises: GeneratedExercise[];
  curriculumCompliance: {
    isPilotData: boolean;
    tag: 'PILOT_EXPERIMENTAL_DATA';
    noticeAr: string;
    noticeFr: string;
  };
}

export class MoroccanExerciseGenerator {
  /**
   * Generates curriculum-aligned exercises with testable reference solutions
   */
  static async generate(req: GenerateExercisesRequest): Promise<GenerateExercisesResponse> {
    const { lessonId, skill, difficulty = 'medium', count = 1 } = req;

    const lesson = await defaultCurriculumRepository.getLessonById(lessonId);
    if (!lesson) {
      throw new Error(
        `الدرس المحدد بمعرف "${lessonId}" غير موجود في قاعدة الدروس التجريبية. يمكنك استخدام أداة "list_curriculum" أو "search_lessons" لمعرفة المعرفات المتاحة.`
      );
    }

    const safeCount = Math.min(Math.max(1, count), 5);
    const exercises: GeneratedExercise[] = [];

    for (let i = 0; i < safeCount; i++) {
      const exercise = this.buildExercise(lesson, skill, difficulty, i + 1);
      exercises.push(exercise);
    }

    return {
      lesson: {
        id: lesson.id,
        titleAr: lesson.titleAr,
        titleFr: lesson.titleFr,
        level: lesson.level
      },
      totalGenerated: exercises.length,
      exercises,
      curriculumCompliance: {
        isPilotData: true,
        tag: 'PILOT_EXPERIMENTAL_DATA',
        noticeAr:
          'محتوى تجريبي (Pilot Data): التمارين المولدة مرفقة بحلول مرجعية قابلة للاختبار الآلي، ومعدة لأغراض التحقق والتقييم الأولي.',
        noticeFr:
          'Contenu pilote (Pilot Data): Exercices générés avec solutions de référence testables automatiquement pour évaluation et validation.'
      }
    };
  }

  private static buildExercise(
    lesson: MoroccanLesson,
    requestedSkill?: string,
    difficulty: ExerciseDifficulty = 'medium',
    index: number = 1
  ): GeneratedExercise {
    const chosenSkill = requestedSkill || lesson.targetedSkills[0] || 'تطبيق المكتسبات الأساسية للدرس';

    // Tailored generator according to lesson
    switch (lesson.id) {
      case '3apic-pythagore':
        return this.generatePythagoreExercise(lesson, difficulty, chosenSkill, index);
      case '3apic-systemes':
        return this.generateSystemeExercise(lesson, difficulty, chosenSkill, index);
      case 'tcs-arithmetique':
        return this.generateArithmetiqueExercise(lesson, difficulty, chosenSkill, index);
      case 'tcs-second-degre':
        return this.generateSecondDegreExercise(lesson, difficulty, chosenSkill, index);
      case '2bac-limites-continuite':
        return this.generateContinuiteExercise(lesson, difficulty, chosenSkill, index);
      default:
        return this.generateGenericCurriculumExercise(lesson, difficulty, chosenSkill, index);
    }
  }

  // 1. Pythagore
  private static generatePythagoreExercise(
    lesson: MoroccanLesson,
    diff: ExerciseDifficulty,
    skill: string,
    idx: number
  ): GeneratedExercise {
    // Generate Pythagorean triples or standard right triangles
    const presets = {
      easy: { a: 3, b: 4, c: 5, unit: 'cm' },
      medium: { a: 6, b: 8, c: 10, unit: 'cm' },
      hard: { a: 5, b: 12, c: 13, unit: 'cm' }
    };
    const p = presets[diff] || presets.medium;

    return {
      id: `EX-PYTH-${diff.toUpperCase()}-${idx}`,
      lessonId: lesson.id,
      lessonTitleAr: lesson.titleAr,
      lessonTitleFr: lesson.titleFr,
      level: lesson.level,
      skill: 'حساب طول الوتر بتطبيق مبرهنة فيثاغورس المباشرة',
      difficulty: diff,
      statementAr: `ليكن ABC مثلثاً قائماً الزاوية في A حيث AB = ${p.a} ${p.unit} و AC = ${p.b} ${p.unit}. احسب طول الوتر BC مع كتابة مراحل البرهان بدقة.`,
      statementFr: `Soit ABC un triangle rectangle en A tel que AB = ${p.a} ${p.unit} et AC = ${p.b} ${p.unit}. Calculer la longueur de l'hypoténuse BC en détaillant votre raisonnement.`,
      hintsAr: [
        'تأكد من ذكر الشرط الأساسي: المثلث قائم الزاوية في الرأس A.',
        'صيغة مبرهنة فيثاغورس: BC² = AB² + AC².'
      ],
      hintsFr: [
        'Vérifiez la condition d\'application: triangle rectangle en A.',
        'Formule: BC² = AB² + AC².'
      ],
      referenceSolution: {
        stepsAr: [
          'المعطيات: المثلث ABC قائم الزاوية في النقطة A.',
          'حسب مبرهنة فيثاغورس المباشرة لدينا: BC² = AB² + AC²',
          `نعوض بالقيم المعطاة: BC² = (${p.a})² + (${p.b})² = ${p.a * p.a} + ${p.b * p.b} = ${p.c * p.c}`,
          `بما أن المسافة موجبة قطعا (BC > 0)، فإن: BC = √(${p.c * p.c}) = ${p.c} ${p.unit}`
        ],
        stepsFr: [
          'Données: Le triangle ABC est rectangle en A.',
          'D\'après le théorème de Pythagore direct: BC² = AB² + AC²',
          `Application numérique: BC² = ${p.a * p.a} + ${p.b * p.b} = ${p.c * p.c}`,
          `Comme une distance est strictement positive, BC = √(${p.c * p.c}) = ${p.c} ${p.unit}`
        ],
        finalAnswer: `${p.c} ${p.unit}`,
        testVerificationKey: `BC=${p.c}`
      },
      evaluationRubricAr: [
        '0.5 نقطة: ذكر شرط تعامد المثلث في A والمبرهنة المطبقة',
        '0.75 نقطة: كتابة الصيغة الحرفية والتعويض العددي السليم',
        '0.75 نقطة: حساب الجذر المربع وكتابة الوحدة المناسبة'
      ],
      isPilotData: true,
      contentTag: 'PILOT_EXPERIMENTAL_DATA'
    };
  }

  // 2. Systèmes 2x2
  private static generateSystemeExercise(
    lesson: MoroccanLesson,
    diff: ExerciseDifficulty,
    skill: string,
    idx: number
  ): GeneratedExercise {
    const config = {
      easy: { x: 2, y: 3, a1: 1, b1: 1, a2: 2, b2: 1 },
      medium: { x: 3, y: -1, a1: 2, b1: 3, a2: 3, b2: -2 },
      hard: { x: 4, y: 5, a1: 3, b1: 4, a2: 5, b2: -2 }
    }[diff];

    const c1 = config.a1 * config.x + config.b1 * config.y;
    const c2 = config.a2 * config.x + config.b2 * config.y;

    return {
      id: `EX-SYS-${diff.toUpperCase()}-${idx}`,
      lessonId: lesson.id,
      lessonTitleAr: lesson.titleAr,
      lessonTitleFr: lesson.titleFr,
      level: lesson.level,
      skill: 'حل نظمة معادلتين من الدرجة الأولى بمجهولين جبرياً',
      difficulty: diff,
      statementAr: `حل في ℝ² النظمة التالية باستعمال طريقة التعويض أو التأليفة الخطية:\n(S): { ${config.a1}x + (${config.b1})y = ${c1} ;\n      ${config.a2}x + (${config.b2})y = ${c2} }`,
      statementFr: `Résoudre dans ℝ² le système suivant par substitution ou combinaison linéaire:\n(S): { ${config.a1}x + (${config.b1})y = ${c1} ;\n      ${config.a2}x + (${config.b2})y = ${c2} }`,
      hintsAr: ['يمكن ضرب إحدى المعادلتين في عدد مناسب للتخلص من أحد المجهولين (x أو y).'],
      referenceSolution: {
        stepsAr: [
          `المعادلة الأولى: ${config.a1}x + (${config.b1})y = ${c1}`,
          `المعادلة الثانية: ${config.a2}x + (${config.b2})y = ${c2}`,
          `بحساب محدد النظمة: D = (${config.a1})×(${config.b2}) - (${config.a2})×(${config.b1}) = ${config.a1 * config.b2 - config.a2 * config.b1}`,
          `إذن للنظمة حل وحيد هو الزوج (x, y) = (${config.x}, ${config.y})`,
          `مجموعة الحلول: S = {(${config.x}, ${config.y})}`
        ],
        stepsFr: [
          `Équation (1): ${config.a1}x + (${config.b1})y = ${c1}`,
          `Équation (2): ${config.a2}x + (${config.b2})y = ${c2}`,
          `Résolution algébrique donne le couple unique (x, y) = (${config.x}, ${config.y})`,
          `Ensemble des solutions: S = {(${config.x}, ${config.y})}`
        ],
        finalAnswer: `(${config.x}, ${config.y})`,
        testVerificationKey: `x=${config.x},y=${config.y}`
      },
      evaluationRubricAr: [
        '1.0 نقطة: اختيار وتطبيق طريقة جبرية سليمة (التعويض أو التأليفة)',
        '0.5 نقطة: تحديد قيمة المجهول الأول بدقة',
        '0.5 نقطة: استنتاج المجهول الثاني وكتابة مجموعة الحلول S'
      ],
      isPilotData: true,
      contentTag: 'PILOT_EXPERIMENTAL_DATA'
    };
  }

  // 3. Arithmétique dans N (TCS)
  private static generateArithmetiqueExercise(
    lesson: MoroccanLesson,
    diff: ExerciseDifficulty,
    skill: string,
    idx: number
  ): GeneratedExercise {
    const config = {
      easy: { a: 48, b: 36, gcd: 12, lcm: 144 },
      medium: { a: 168, b: 180, gcd: 12, lcm: 2520 },
      hard: { a: 396, b: 180, gcd: 36, lcm: 1980 }
    }[diff];

    return {
      id: `EX-ARITH-${diff.toUpperCase()}-${idx}`,
      lessonId: lesson.id,
      lessonTitleAr: lesson.titleAr,
      lessonTitleFr: lesson.titleFr,
      level: lesson.level,
      skill: 'حساب PGCD و PPCM بتفكيك الأعداد أو خوارزمية إقليدس',
      difficulty: diff,
      statementAr: `1) احسب القاسم المشترك الأكبر للعددين ${config.a} و ${config.b} باستعمال خوارزمية إقليدس أو تفكيكهما إلى جداء عوامل أولية.\n2) استنتج المضاعف المشترك الأصغر PPCM(${config.a}, ${config.b}).`,
      statementFr: `1) Calculer le PGCD de ${config.a} et ${config.b} par l'algorithme d'Euclide ou la décomposition en facteurs premiers.\n2) En déduire le PPCM(${config.a}, ${config.b}).`,
      referenceSolution: {
        stepsAr: [
          `بتطبيق خوارزمية إقليدس بين ${config.a} و ${config.b}:`,
          `آخر باقي غير منعدم هو ${config.gcd}، إذن: PGCD(${config.a}, ${config.b}) = ${config.gcd}`,
          `باستعمال العلاقة: PGCD(a,b) × PPCM(a,b) = a × b:`,
          `PPCM(${config.a}, ${config.b}) = (${config.a} × ${config.b}) / ${config.gcd} = ${config.lcm}`
        ],
        stepsFr: [
          `Par l'algorithme d'Euclide: PGCD(${config.a}, ${config.b}) = ${config.gcd}`,
          `Relation fondamentale: PGCD * PPCM = a * b`,
          `PPCM(${config.a}, ${config.b}) = (${config.a} * ${config.b}) / ${config.gcd} = ${config.lcm}`
        ],
        finalAnswer: `PGCD=${config.gcd}, PPCM=${config.lcm}`,
        testVerificationKey: `PGCD=${config.gcd},PPCM=${config.lcm}`
      },
      isPilotData: true,
      contentTag: 'PILOT_EXPERIMENTAL_DATA'
    };
  }

  // 4. Second Degré (TCS)
  private static generateSecondDegreExercise(
    lesson: MoroccanLesson,
    diff: ExerciseDifficulty,
    skill: string,
    idx: number
  ): GeneratedExercise {
    const config = {
      easy: { a: 1, b: -5, c: 6, delta: 1, x1: 2, x2: 3 },
      medium: { a: 2, b: -7, c: 3, delta: 25, x1: 0.5, x2: 3 },
      hard: { a: 3, b: 5, c: -2, delta: 49, x1: -2, x2: '1/3' }
    }[diff];

    return {
      id: `EX-2DEG-${diff.toUpperCase()}-${idx}`,
      lessonId: lesson.id,
      lessonTitleAr: lesson.titleAr,
      lessonTitleFr: lesson.titleFr,
      level: lesson.level,
      skill: 'حل معادلة من الدرجة الثانية بمجهول واحد باستعمال المميز دلتا',
      difficulty: diff,
      statementAr: `حل في ℝ المعادلة التالية:\n${config.a}x² + (${config.b})x + (${config.c}) = 0\nمع تحديد إشارة ثلاثية الحدود.`,
      statementFr: `Résoudre dans ℝ l'équation:\n${config.a}x² + (${config.b})x + (${config.c}) = 0\net préciser le signe du trinôme.`,
      referenceSolution: {
        stepsAr: [
          `المعاملات: a = ${config.a}، b = ${config.b}، c = ${config.c}`,
          `المميز Δ = b² - 4ac = (${config.b})² - 4 × (${config.a}) × (${config.c}) = ${config.delta}`,
          `بما أن Δ > 0، فإن للمعادلة حلين حقيقيين متمايزين: x₁ = ${config.x1} و x₂ = ${config.x2}`,
          `مجموعة الحلول: S = {${config.x1}, ${config.x2}}`
        ],
        stepsFr: [
          `Discriminant: Delta = b² - 4ac = ${config.delta}`,
          `Delta > 0 donc deux solutions réelles distinctes: x₁ = ${config.x1}, x₂ = ${config.x2}`,
          `Ensemble des solutions: S = {${config.x1}, ${config.x2}}`
        ],
        finalAnswer: `S = {${config.x1}, ${config.x2}}`,
        testVerificationKey: `delta=${config.delta}`
      },
      isPilotData: true,
      contentTag: 'PILOT_EXPERIMENTAL_DATA'
    };
  }

  // 5. Continuité et TVI (2BAC)
  private static generateContinuiteExercise(
    lesson: MoroccanLesson,
    diff: ExerciseDifficulty,
    skill: string,
    idx: number
  ): GeneratedExercise {
    return {
      id: `EX-TVI-${diff.toUpperCase()}-${idx}`,
      lessonId: lesson.id,
      lessonTitleAr: lesson.titleAr,
      lessonTitleFr: lesson.titleFr,
      level: lesson.level,
      skill: 'تطبيق مبرهنة القيم الوسيطية لإثبات وجود حل لمعادلة f(x)=0',
      difficulty: diff,
      statementAr: `نعتبر الدالة f المعرفة على ℝ بما يلي: f(x) = x³ + 2x - 1.\n1) بين أن الدالة f متصلة ورتيبة قطعا على المجال [0, 1].\n2) بين أن المعادلة f(x) = 0 تقبل حلاً وحيداً α في المجال ]0, 1[.`,
      statementFr: `Soit la fonction f définie sur ℝ par f(x) = x³ + 2x - 1.\n1) Montrer que f est continue et strictement croissante sur [0, 1].\n2) Démontrer que l'équation f(x) = 0 admet une unique solution α dans ]0, 1[.`,
      referenceSolution: {
        stepsAr: [
          '1) f دالة حدودية، إذن متصلة على ℝ وبالخصوص متصلة على المجال المغلق [0, 1].',
          'دالة مشتقة: f\'(x) = 3x² + 2 > 0 لكل x من ℝ، إذن f تزايدية قطعا على [0, 1].',
          '2) نحسب الصورتين: f(0) = -1 < 0 و f(1) = 1 + 2 - 1 = 2 > 0.',
          'بما أن f(0) × f(1) < 0 و f متصلة ورتيبة قطعا، فحسب مبرهنة القيم الوسيطية (TVI)، المعادلة f(x)=0 تقبل حلاً وحيداً α ∈ ]0, 1[.'
        ],
        stepsFr: [
          '1) f est une fonction polynôme, donc continue sur ℝ et en particulier sur [0, 1].',
          'f\'(x) = 3x² + 2 > 0 pour tout x, donc f est strictement croissante sur [0, 1].',
          '2) f(0) = -1 < 0 et f(1) = 2 > 0, donc f(0) * f(1) < 0.',
          'D\'après le Théorème des Valeurs Intermédiaires (TVI), il existe un unique α dans ]0, 1[ tel que f(α) = 0.'
        ],
        finalAnswer: 'حل وحيد α ينتمي إلى المجال ]0, 1[ حسب مبرهنة القيم الوسيطية',
        testVerificationKey: 'TVI_alpha_unique_in_]0,1['
      },
      isPilotData: true,
      contentTag: 'PILOT_EXPERIMENTAL_DATA'
    };
  }

  // Generic fallback
  private static generateGenericCurriculumExercise(
    lesson: MoroccanLesson,
    diff: ExerciseDifficulty,
    skill: string,
    idx: number
  ): GeneratedExercise {
    return {
      id: `EX-${lesson.code}-${diff.toUpperCase()}-${idx}`,
      lessonId: lesson.id,
      lessonTitleAr: lesson.titleAr,
      lessonTitleFr: lesson.titleFr,
      level: lesson.level,
      skill,
      difficulty: diff,
      statementAr: `تمرين تطبيقي لدرس "${lesson.titleAr}" (${lesson.level}):\nبناءً على الكفاية المستهدفة: "${skill}"، بيّن الخطوات المنهجية المتبعة لحل مسألة تهم هذا المحور بمستوى صعوبة (${diff}).`,
      statementFr: `Exercice d'application pour la leçon "${lesson.titleFr}" (${lesson.level}):\nSur la compétence "${skill}", explicitez les étapes méthodologiques conformes au programme marocain.`,
      referenceSolution: {
        stepsAr: [
          `تحديد المكتسبات القبلية والشروط الرياضية لتطبيق الخاصية المعنية في درس ${lesson.titleAr}.`,
          `صياغة التعبير الرياضي وتحويل المعطيات إلى نموذج قابل للحساب أو البرهان.`,
          `الاستنتاج النهائي والتحقق من انسجام النتيجة مع المجال المدروس.`
        ],
        stepsFr: [
          `Vérification des conditions préalables selon le programme marocain.`,
          `Formulation mathématique et résolution méthodique.`,
          `Conclusion et validation du domaine.`
        ],
        finalAnswer: `حل مرجعي مكتمل لدرس ${lesson.titleAr}`,
        testVerificationKey: `GENERIC_${lesson.id}`
      },
      isPilotData: true,
      contentTag: 'PILOT_EXPERIMENTAL_DATA'
    };
  }
}
