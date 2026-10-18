import type {
  CalculationOperationType,
  CalculationVerificationRequest,
  CalculationVerificationResult
} from '../types.ts';

const VERIFICATION_BOUNDARIES_NOTICE_AR =
  'حدود التحقق المنهجية: هذه الأداة مخصصة حصراً للتحقق من العمليات الحسابية والعددية والجبرية المدعومة المحددة (العمليات الحسابية، الكسور الاعتيادية، القاسم والمضاعف المشترك، معادلات الدرجة الثانية، النظمات الخطية 2x2، والحسابيات المعيارية). هذه الأداة لا تدعي ولا تمتلك القدرة على إثبات البراهين الرياضية العامة أو حل النظريات الهندسية المجردة دون مدخلات عددية مضبوطة.';

const VERIFICATION_BOUNDARIES_NOTICE_FR =
  'Limites de vérification: Cet outil est strictement conçu pour vérifier des calculs numériques et algébriques supportés (opérations élémentaires, fractions, PGCD/PPCM, équations du 2nd degré, systèmes 2x2, arithmétique modulaire). Il ne prétend pas prouver des théorèmes mathématiques généraux ou des démonstrations abstraites.';

export class CalculationVerifier {
  /**
   * Main verification entry point
   */
  static verify(request: CalculationVerificationRequest): CalculationVerificationResult {
    const { operationType, parameters, expectedResult } = request;

    if (!parameters || typeof parameters !== 'object') {
      throw new Error('المعاملات parameters غير صالحة، يجب تمرير كائن يحتوي على معطيات العملية.');
    }

    switch (operationType) {
      case 'arithmetic':
        return this.verifyArithmetic(parameters, expectedResult);
      case 'fraction':
        return this.verifyFraction(parameters, expectedResult);
      case 'gcd_lcm':
        return this.verifyGcdLcm(parameters, expectedResult);
      case 'quadratic_equation':
        return this.verifyQuadratic(parameters, expectedResult);
      case 'linear_system_2x2':
        return this.verifyLinearSystem(parameters, expectedResult);
      case 'modular_arithmetic':
        return this.verifyModular(parameters, expectedResult);
      default:
        throw new Error(
          `نوع العملية "${operationType}" غير مدعوم. الأنواع المدعومة: arithmetic, fraction, gcd_lcm, quadratic_equation, linear_system_2x2, modular_arithmetic.`
        );
    }
  }

  // --- 1. Arithmetic ---
  private static verifyArithmetic(
    params: Record<string, any>,
    expected?: string | number
  ): CalculationVerificationResult {
    const expression = String(params.expression || '').trim();
    if (!expression) {
      throw new Error('يرجى تزويد تعبير رياضي في الحقل expression (مثال: "3 * (4 + 5) - 2^3").');
    }

    // Safety checks against dangerous characters
    if (/[^0-9+\-*/().^\s,]/.test(expression)) {
      throw new Error('التعبير يحتوي على رموز غير مسموح بها. المسموح به: أرقام، +، -، *، /، ^، وأقواس.');
    }
    if (expression.length > 120) {
      throw new Error('طول التعبير تجاوز الحد الأقصى المسموح به (120 حرفاً).');
    }

    // Parse and evaluate safely
    const computed = this.safeEvaluateMath(expression);
    const rounded = Math.round(computed * 1000000) / 1000000;

    let matchesExpected: boolean | undefined = undefined;
    if (expected !== undefined && expected !== null) {
      const expNum = Number(expected);
      matchesExpected = !isNaN(expNum) && Math.abs(rounded - expNum) < 1e-6;
    }

    return {
      verified: true,
      operationType: 'arithmetic',
      normalizedInput: expression,
      computedResult: rounded,
      matchesExpected,
      stepByStepStepsAr: [
        `التعبير الحسابي المدخل: ${expression}`,
        `تحليل ترتيب الأسبقية: الأقواس أولاً، ثم القوى والأسس، ثم الضرب والقسمة، وأخيراً الجمع والطرح.`,
        `النتيجة العددية المحسوبة بدقة: ${rounded}`
      ],
      stepByStepStepsFr: [
        `Expression saisie: ${expression}`,
        `Ordre des opérations: parenthèses, exposants, multiplication/division, addition/soustraction.`,
        `Résultat numérique calculé: ${rounded}`
      ],
      verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
      verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
      isPilotVerifier: true
    };
  }

  // --- 2. Fraction ---
  private static verifyFraction(
    params: Record<string, any>,
    expected?: string | number
  ): CalculationVerificationResult {
    const { num1, den1, num2, den2, op } = params;

    const n1 = parseInt(num1, 10);
    const d1 = parseInt(den1, 10);

    if (isNaN(n1) || isNaN(d1) || d1 === 0) {
      throw new Error('الكسر الأول غير صالح. يجب أن يكون المقام غير منعدم (den1 != 0).');
    }

    // Case A: Just simplify single fraction
    if (num2 === undefined || den2 === undefined || !op) {
      const divisor = this.calcGcd(Math.abs(n1), Math.abs(d1));
      const simpNum = (n1 / divisor) * (d1 < 0 ? -1 : 1);
      const simpDen = Math.abs(d1 / divisor);
      const simpStr = simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`;

      return {
        verified: true,
        operationType: 'fraction',
        normalizedInput: `${n1}/${d1}`,
        computedResult: { simplified: simpStr, numerator: simpNum, denominator: simpDen, decimal: simpNum / simpDen },
        stepByStepStepsAr: [
          `الكسر الأصلي: ${n1}/${d1}`,
          `القاسم المشترك الأكبر للبسط والمقام: PGCD(|${n1}|, |${d1}|) = ${divisor}`,
          `قسمة البسط والمقام على ${divisor}: ${n1}÷${divisor} = ${simpNum} و ${d1}÷${divisor} = ${simpDen}`,
          `الكسر المختزل غير القابل للاختزال: ${simpStr}`
        ],
        stepByStepStepsFr: [
          `Fraction originale: ${n1}/${d1}`,
          `Plus grand commun diviseur: PGCD(|${n1}|, |${d1}|) = ${divisor}`,
          `Division par le PGCD: ${simpStr}`
        ],
        verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
        verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
        isPilotVerifier: true
      };
    }

    // Case B: Binary operation between two fractions
    const n2 = parseInt(num2, 10);
    const d2 = parseInt(den2, 10);
    if (isNaN(n2) || isNaN(d2) || d2 === 0) {
      throw new Error('الكسر الثاني غير صالح. يجب أن يكون المقام غير منعدم (den2 != 0).');
    }

    let resNum = 0;
    let resDen = 1;
    let opDescAr = '';
    let opDescFr = '';

    if (op === '+' || op === 'add') {
      resNum = n1 * d2 + n2 * d1;
      resDen = d1 * d2;
      opDescAr = 'توحيد المقامات بالضرب التقاطعي ثم جمع البسطين';
      opDescFr = 'Mise au même dénominateur puis addition';
    } else if (op === '-' || op === 'sub') {
      resNum = n1 * d2 - n2 * d1;
      resDen = d1 * d2;
      opDescAr = 'توحيد المقامات بالضرب التقاطعي ثم طرح البسطين';
      opDescFr = 'Mise au même dénominateur puis soustraction';
    } else if (op === '*' || op === 'mul') {
      resNum = n1 * n2;
      resDen = d1 * d2;
      opDescAr = 'جداء كسرين هو جداء البسطين على جداء المقامين';
      opDescFr = 'Produit des numérateurs sur produit des dénominateurs';
    } else if (op === '/' || op === 'div') {
      if (n2 === 0) throw new Error('القسمة على صفر غير معرفة: لا يمكن القسمة على كسر بسطه 0.');
      resNum = n1 * d2;
      resDen = d1 * n2;
      opDescAr = 'قسمة كسرين تؤول لضرب الكسر الأول في مقلوب الثاني';
      opDescFr = 'Multiplication par l\'inverse de la deuxième fraction';
    } else {
      throw new Error(`العملية "${op}" غير مدعومة. المتاح: +, -, *, /`);
    }

    const divisor = this.calcGcd(Math.abs(resNum), Math.abs(resDen));
    const simpNum = (resNum / divisor) * (resDen < 0 ? -1 : 1);
    const simpDen = Math.abs(resDen / divisor);
    const simpStr = simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`;

    let matchesExpected: boolean | undefined = undefined;
    if (expected !== undefined && expected !== null) {
      matchesExpected = String(expected).trim() === simpStr || String(expected).trim() === `${resNum}/${resDen}`;
    }

    return {
      verified: true,
      operationType: 'fraction',
      normalizedInput: `(${n1}/${d1}) ${op} (${n2}/${d2})`,
      computedResult: {
        raw: `${resNum}/${resDen}`,
        simplified: simpStr,
        numerator: simpNum,
        denominator: simpDen,
        decimalValue: simpNum / simpDen
      },
      matchesExpected,
      stepByStepStepsAr: [
        `العملية المطلوبة: (${n1}/${d1}) ${op} (${n2}/${d2})`,
        `${opDescAr}: الناتج الخام = ${resNum}/${resDen}`,
        `حساب PGCD(${Math.abs(resNum)}, ${Math.abs(resDen)}) = ${divisor}`,
        `الكسر المختزل النهائي: ${simpStr}`
      ],
      stepByStepStepsFr: [
        `Opération demandée: (${n1}/${d1}) ${op} (${n2}/${d2})`,
        `${opDescFr}: Résultat brut = ${resNum}/${resDen}`,
        `Simplification par PGCD (${divisor}): ${simpStr}`
      ],
      verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
      verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
      isPilotVerifier: true
    };
  }

  // --- 3. GCD and LCM (PGCD et PPCM) ---
  private static verifyGcdLcm(
    params: Record<string, any>,
    expected?: string | number
  ): CalculationVerificationResult {
    const a = parseInt(params.a, 10);
    const b = parseInt(params.b, 10);

    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
      throw new Error('يرجى إدخال عددين صحيحين طبيعيين موجبين قطعا (a > 0 و b > 0) لحساب PGCD وPPCM.');
    }
    if (a > 1000000000 || b > 1000000000) {
      throw new Error('الأعداد المدخلة تجاوزت الحد الأقصى المسموح به (1,000,000,000) لتفادي استنزاف الذاكرة.');
    }

    // Euclidean steps
    let x = Math.max(a, b);
    let y = Math.min(a, b);
    const euclideanStepsAr: string[] = [];
    const euclideanStepsFr: string[] = [];

    while (y !== 0) {
      const q = Math.floor(x / y);
      const r = x % y;
      euclideanStepsAr.push(`القسمة الإقليدية: ${x} = ${y} × ${q} + ${r}`);
      euclideanStepsFr.push(`Division euclidienne: ${x} = ${y} × ${q} + ${r}`);
      x = y;
      y = r;
    }

    const gcd = x;
    const lcm = (a / gcd) * b;

    let matchesExpected: boolean | undefined = undefined;
    if (expected !== undefined && expected !== null) {
      const expNum = Number(expected);
      matchesExpected = !isNaN(expNum) && (expNum === gcd || expNum === lcm);
    }

    return {
      verified: true,
      operationType: 'gcd_lcm',
      normalizedInput: `PGCD(${a}, ${b}) و PPCM(${a}, ${b})`,
      computedResult: { gcd, lcm, areCoprime: gcd === 1 },
      matchesExpected,
      stepByStepStepsAr: [
        `تطبيق خوارزمية إقليدس بين ${Math.max(a, b)} و ${Math.min(a, b)}:`,
        ...euclideanStepsAr,
        `آخر باقي غير منعدم في خوارزمية إقليدس هو ${gcd}، إذن: PGCD(${a}, ${b}) = ${gcd}.`,
        `باستعمال الخاصية PGCD(a,b) × PPCM(a,b) = a × b:`,
        `PPCM(${a}, ${b}) = (${a} × ${b}) ÷ ${gcd} = ${lcm}`,
        gcd === 1
          ? `ملاحظة خاصة: العددان ${a} و ${b} أوليان فيما بينهما لأن PGCD يساوي 1.`
          : `العددان ليسا أوليين فيما بينهما.`
      ],
      stepByStepStepsFr: [
        `Algorithme d'Euclide entre ${Math.max(a, b)} et ${Math.min(a, b)}:`,
        ...euclideanStepsFr,
        `Le dernier reste non nul est ${gcd}, donc PGCD(${a}, ${b}) = ${gcd}.`,
        `Propriété: PPCM(${a}, ${b}) = (${a} × ${b}) / ${gcd} = ${lcm}.`,
        gcd === 1 ? `Les nombres sont premiers entre eux car PGCD = 1.` : `Les nombres ne sont pas premiers entre eux.`
      ],
      verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
      verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
      isPilotVerifier: true
    };
  }

  // --- 4. Quadratic Equation (ax^2 + bx + c = 0) ---
  private static verifyQuadratic(
    params: Record<string, any>,
    expected?: string | number
  ): CalculationVerificationResult {
    const a = parseFloat(params.a);
    const b = parseFloat(params.b);
    const c = parseFloat(params.c);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      throw new Error('يرجى تزويد المعاملات a و b و c كأعداد حقيقية صالحة.');
    }
    if (a === 0) {
      throw new Error('المعامل a لا يمكن أن يساوي صفراً في معادلة من الدرجة الثانية (a ≠ 0).');
    }

    const delta = b * b - 4 * a * c;
    const roundedDelta = Math.round(delta * 1000000) / 1000000;

    let rootsSummaryAr = '';
    let rootsSummaryFr = '';
    let resultPayload: Record<string, any> = { a, b, c, delta: roundedDelta };

    if (roundedDelta > 0) {
      const sqrtDelta = Math.sqrt(roundedDelta);
      const x1 = (-b - sqrtDelta) / (2 * a);
      const x2 = (-b + sqrtDelta) / (2 * a);
      const r1 = Math.round(x1 * 1000000) / 1000000;
      const r2 = Math.round(x2 * 1000000) / 1000000;
      rootsSummaryAr = `بما أن المميز Δ > 0 فإن للمعادلة حلين حقيقيين متمايزين: x₁ = ${r1} و x₂ = ${r2}. مجموعة الحلول S = {${r1}, ${r2}}.`;
      rootsSummaryFr = `Comme Delta > 0, l'équation admet deux solutions réelles distinctes: x₁ = ${r1} et x₂ = ${r2}. S = {${r1}, ${r2}}.`;
      resultPayload.solutionsCount = 2;
      resultPayload.solutionsReal = [r1, r2];
      resultPayload.nature = 'two_distinct_real_roots';
    } else if (roundedDelta === 0) {
      const x0 = -b / (2 * a);
      const r0 = Math.round(x0 * 1000000) / 1000000;
      rootsSummaryAr = `بما أن المميز Δ = 0 فإن للمعادلة حلاً حقيقياً مزدوجاً: x₀ = -b/(2a) = ${r0}. مجموعة الحلول S = {${r0}}.`;
      rootsSummaryFr = `Comme Delta = 0, l'équation admet une solution double réelle: x₀ = ${r0}. S = {${r0}}.`;
      resultPayload.solutionsCount = 1;
      resultPayload.solutionsReal = [r0];
      resultPayload.nature = 'one_double_real_root';
    } else {
      const sqrtAbsDelta = Math.sqrt(-roundedDelta);
      const realPart = Math.round((-b / (2 * a)) * 1000000) / 1000000;
      const imagPart = Math.round((sqrtAbsDelta / (2 * Math.abs(a))) * 1000000) / 1000000;
      rootsSummaryAr = `بما أن المميز Δ < 0: ليس للمعادلة حل في R (المجموعة الفارغة ∅). أما في مجموعة الأعداد العقدية C فلها حلان عقديان مترافقان: z₁ = ${realPart} - ${imagPart}i و z₂ = ${realPart} + ${imagPart}i.`;
      rootsSummaryFr = `Comme Delta < 0, l'équation n'a pas de solution dans R (S = ensemble vide). Dans C, deux solutions complexes conjuguées: z = ${realPart} ± ${imagPart}i.`;
      resultPayload.solutionsCount = 0;
      resultPayload.solutionsReal = [];
      resultPayload.complexRoots = [`${realPart} - ${imagPart}i`, `${realPart} + ${imagPart}i`];
      resultPayload.nature = 'no_real_roots_two_complex_conjugate';
    }

    return {
      verified: true,
      operationType: 'quadratic_equation',
      normalizedInput: `${a}x² + (${b})x + (${c}) = 0`,
      computedResult: resultPayload,
      stepByStepStepsAr: [
        `المعادلة: ${a}x² + (${b})x + (${c}) = 0`,
        `المعاملات: a = ${a}، b = ${b}، c = ${c}`,
        `حساب مميز ثلاثية الحدود: Δ = b² - 4ac = (${b})² - 4 × (${a}) × (${c}) = ${roundedDelta}`,
        rootsSummaryAr
      ],
      stepByStepStepsFr: [
        `Équation: ${a}x² + (${b})x + (${c}) = 0`,
        `Coefficients: a = ${a}, b = ${b}, c = ${c}`,
        `Calcul du discriminant: Delta = b² - 4ac = ${roundedDelta}`,
        rootsSummaryFr
      ],
      verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
      verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
      isPilotVerifier: true
    };
  }

  // --- 5. Linear System 2x2 ---
  private static verifyLinearSystem(
    params: Record<string, any>,
    expected?: string | number
  ): CalculationVerificationResult {
    // a1*x + b1*y = c1
    // a2*x + b2*y = c2
    const a1 = parseFloat(params.a1);
    const b1 = parseFloat(params.b1);
    const c1 = parseFloat(params.c1);
    const a2 = parseFloat(params.a2);
    const b2 = parseFloat(params.b2);
    const c2 = parseFloat(params.c2);

    if ([a1, b1, c1, a2, b2, c2].some(v => isNaN(v))) {
      throw new Error('يرجى تزويد المعاملات الستة لنظمة 2x2 كاملة: a1, b1, c1, a2, b2, c2.');
    }

    const D = a1 * b2 - a2 * b1;
    const Dx = c1 * b2 - c2 * b1;
    const Dy = a1 * c2 - a2 * c1;

    const round = (n: number) => Math.round(n * 1000000) / 1000000;
    const detD = round(D);
    const detDx = round(Dx);
    const detDy = round(Dy);

    let solutionStatusAr = '';
    let solutionStatusFr = '';
    let computedRes: Record<string, any> = { determinant: detD, detDx, detDy };

    if (detD !== 0) {
      const x = round(Dx / D);
      const y = round(Dy / D);
      computedRes.uniqueSolution = { x, y };
      computedRes.hasUniqueSolution = true;
      solutionStatusAr = `بما أن المحدد D ≠ 0 فإن للنظمة حلاً وحيداً هو الزوج (x, y) = (${x}, ${y}). هندسياً: المستقيمان يتقاطعان في النقطة (${x}, ${y}).`;
      solutionStatusFr = `Puisque D ≠ 0, le système admet un couple unique solution: (x, y) = (${x}, ${y}). Les droites sont sécantes.`;
    } else {
      computedRes.hasUniqueSolution = false;
      if (detDx === 0 && detDy === 0) {
        computedRes.infiniteSolutions = true;
        solutionStatusAr = `بما أن D = 0 و Dx = Dy = 0، فإن معادلتي النظمة متكافئتان، وللنظمة ما لا نهاية له من الحلول (المستقيمان منطبقان).`;
        solutionStatusFr = `Puisque D = Dx = Dy = 0, le système admet une infinité de solutions (droites confondues).`;
      } else {
        computedRes.noSolution = true;
        solutionStatusAr = `بما أن D = 0 بينما أحد المحددين Dx أو Dy غير منعدم، فإن النظمة مستحيلة الحل في R² (مجموعة الحلول ∅، والمستقيمان متوازيان قطعا).`;
        solutionStatusFr = `Puisque D = 0 et Dx ≠ 0 ou Dy ≠ 0, le système n'admet aucune solution: S = vide (droites strictement parallèles).`;
      }
    }

    return {
      verified: true,
      operationType: 'linear_system_2x2',
      normalizedInput: `System: { ${a1}x + ${b1}y = ${c1} ; ${a2}x + ${b2}y = ${c2} }`,
      computedResult: computedRes,
      stepByStepStepsAr: [
        `النظمة المدروسة:`,
        `  (1): ${a1}x + (${b1})y = ${c1}`,
        `  (2): ${a2}x + (${b2})y = ${c2}`,
        `حساب محدد النظمة (D): D = (${a1})×(${b2}) - (${a2})×(${b1}) = ${detD}`,
        `حساب محدد المجهول x: Dx = (${c1})×(${b2}) - (${c2})×(${b1}) = ${detDx}`,
        `حساب محدد المجهول y: Dy = (${a1})×(${c2}) - (${a2})×(${c1}) = ${detDy}`,
        solutionStatusAr
      ],
      stepByStepStepsFr: [
        `Système: { ${a1}x + ${b1}y = ${c1} ; ${a2}x + ${b2}y = ${c2} }`,
        `Déterminant D = (${a1})*(${b2}) - (${a2})*(${b1}) = ${detD}`,
        `Déterminant Dx = ${detDx}, Dy = ${detDy}`,
        solutionStatusFr
      ],
      verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
      verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
      isPilotVerifier: true
    };
  }

  // --- 6. Modular Arithmetic (a mod m) ---
  private static verifyModular(
    params: Record<string, any>,
    expected?: string | number
  ): CalculationVerificationResult {
    const a = parseInt(params.a, 10);
    const m = parseInt(params.m, 10);

    if (isNaN(a) || isNaN(m) || m <= 0) {
      throw new Error('يرجى تزويد العدد a والترديد m كعدد صحيح طبيعي موجب قطعا (m > 0).');
    }

    const remainder = ((a % m) + m) % m;
    const quotient = Math.floor(a / m);

    let matchesExpected: boolean | undefined = undefined;
    if (expected !== undefined && expected !== null) {
      matchesExpected = parseInt(String(expected), 10) === remainder;
    }

    const gcd = this.calcGcd(Math.abs(a), m);

    return {
      verified: true,
      operationType: 'modular_arithmetic',
      normalizedInput: `${a} ≡ r [${m}]`,
      computedResult: { a, modulus: m, remainder, quotient, gcdWithModulus: gcd },
      matchesExpected,
      stepByStepStepsAr: [
        `القسمة الإقليدية للعدد ${a} على الترديد ${m}:`,
        `${a} = ${m} × (${quotient}) + (${remainder}) حيث 0 ≤ ${remainder} < ${m}`,
        `إذن: ${a} ≡ ${remainder} [${m}] (باقي القسمة هو ${remainder})`,
        gcd === 1
          ? `العددان ${a} و ${m} أوليان فيما بينهما، إذن يوجد مقلوب معياري للعدد ${a} بترديد ${m}.`
          : `PGCD(${a}, ${m}) = ${gcd} ≠ 1، إذن ${a} ليس له مقلوب معياري بترديد ${m}.`
      ],
      stepByStepStepsFr: [
        `Division euclidienne de ${a} par le modulo ${m}:`,
        `${a} = ${m} * (${quotient}) + (${remainder}) avec 0 <= ${remainder} < ${m}`,
        `Donc ${a} est congru à ${remainder} modulo ${m} (${a} ≡ ${remainder} [${m}])`
      ],
      verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
      verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
      isPilotVerifier: true
    };
  }

  // Helper gcd
  private static calcGcd(x: number, y: number): number {
    while (y !== 0) {
      const temp = y;
      y = x % y;
      x = temp;
    }
    return x;
  }

  // Safe arithmetic parser
  private static safeEvaluateMath(expr: string): number {
    // Clean string and replace ^ with **
    let clean = expr.replace(/\s+/g, '').replace(/\^/g, '**');

    // Reject non-allowed sequences
    if (/[^0-9+\-*/().*,]/.test(clean) || clean.includes('//') || clean.includes('**--')) {
      throw new Error('تعبير رياضي غير صالح.');
    }

    // Evaluate in safe isolated environment without access to globals
    const fn = new Function(`
      "use strict";
      const result = (${clean});
      if (typeof result !== "number" || !isFinite(result)) {
        throw new Error("الناتج غير معرف أو أدى إلى قسمة على صفر أو قيمة لا نهائية.");
      }
      return result;
    `);

    return fn();
  }
}
