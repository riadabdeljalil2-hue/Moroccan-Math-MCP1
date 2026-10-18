import express, { Request, Response } from 'express';
import cors from 'cors';
import { requireMcpAuth, getExpectedApiKey } from './auth.ts';
import {
  handleStreamableHttpRequest,
  handleSseConnect,
  handleSsePostMessage
} from './mcp/transport.ts';
import { defaultCurriculumRepository } from './curriculum/repository.ts';
import { CalculationVerifier } from './math/verifier.ts';
import { MoroccanExerciseGenerator } from './math/exerciseGenerator.ts';

export function createApp() {
  const app = express();

  // CORS configuration allowing external MCP clients and inspector
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-api-key',
        'x-mcp-api-key',
        'mcp-session-id',
        'Last-Event-ID'
      ],
      exposedHeaders: ['mcp-session-id', 'Content-Type']
    })
  );

  // Strict JSON payload size limit
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // --- Public Health & Diagnostics ---
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      serverName: 'Moroccan Math MCP Server',
      version: '1.0.0',
      protocol: 'Model Context Protocol (MCP)',
      transports: {
        streamableHttp: '/mcp',
        sse: '/sse',
        ssePost: '/messages'
      },
      authConfigured: !!process.env.MCP_API_KEY,
      tools: [
        {
          name: 'list_curriculum',
          descriptionAr: 'يعرض المستويات الدراسية والدروس الرياضية المتوفرة حالياً في المنهاج المغربي.',
          status: 'verified_pilot_data'
        },
        {
          name: 'search_lessons',
          descriptionAr: 'يبحث عن دروس الرياضيات بالعربية أو الفرنسية ويعيد تفاصيل الدرس والكفايات والمراجع.',
          status: 'verified_pilot_data'
        },
        {
          name: 'verify_calculation',
          descriptionAr: 'يتحقق من العمليات الحسابية والعددية والجبرية المدعومة مع توضيح حدود التحقق.',
          status: 'verified_deterministic'
        },
        {
          name: 'generate_exercises',
          descriptionAr: 'يولّد تمارين رياضية وفق المنهاج المغربي مع حلول مرجعية قابلة للاختبار.',
          status: 'verified_pilot_generator'
        }
      ],
      dataset: {
        status: 'pilot_data',
        officialStandard: 'التوجيهات التربوية الرسمية لوزارة التربية الوطنية المغربية (عينة أولية تجريبية)'
      },
      timestamp: new Date().toISOString()
    });
  });

  // --- MCP Official Protocol Endpoints (Protected by Auth) ---
  app.post('/mcp', requireMcpAuth, handleStreamableHttpRequest);
  app.get('/mcp', requireMcpAuth, handleStreamableHttpRequest);
  app.delete('/mcp', requireMcpAuth, handleStreamableHttpRequest);

  // Classic SSE transport endpoints (Protected by Auth)
  app.get('/sse', requireMcpAuth, handleSseConnect);
  app.post('/messages', requireMcpAuth, handleSsePostMessage);

  // --- Inspector & Developer Helper APIs ---
  // Direct tool executor for Inspector UI
  app.post('/api/tools/execute', requireMcpAuth, async (req: Request, res: Response) => {
    const { toolName, args } = req.body;
    try {
      switch (toolName) {
        case 'list_curriculum': {
          const result = await defaultCurriculumRepository.getCurriculumSummary(args || {});
          return res.json({ success: true, toolName, result });
        }
        case 'search_lessons': {
          if (!args?.query) {
            return res.status(400).json({ success: false, error: 'المعامل query مطلوب للبحث' });
          }
          const result = await defaultCurriculumRepository.searchLessons(args.query, {
            level: args.level,
            language: args.language
          });
          return res.json({ success: true, toolName, result });
        }
        case 'verify_calculation': {
          if (!args?.operation_type || !args?.parameters) {
            return res.status(400).json({
              success: false,
              error: 'المعاملات operation_type و parameters مطلوبة'
            });
          }
          const result = CalculationVerifier.verify({
            operationType: args.operation_type,
            parameters: args.parameters,
            expectedResult: args.expected_result
          });
          return res.json({ success: true, toolName, result });
        }
        case 'generate_exercises': {
          if (!args?.lesson_id) {
            return res.status(400).json({
              success: false,
              error: 'المعامل lesson_id مطلوب'
            });
          }
          const result = await MoroccanExerciseGenerator.generate({
            lessonId: args.lesson_id,
            skill: args.skill,
            difficulty: args.difficulty,
            count: args.count
          });
          return res.json({ success: true, toolName, result });
        }
        default:
          return res.status(404).json({ success: false, error: `الأداة "${toolName}" غير موجودة.` });
      }
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || String(err) });
    }
  });

  // Automated Test Suite Runner Endpoint (runs in-memory tests and returns real results)
  app.post('/api/tests/run', requireMcpAuth, async (req: Request, res: Response) => {
    const testResults = await runInlineDiagnostics();
    res.json(testResults);
  });

  return app;
}

/**
 * Diagnostic runner used by /api/tests/run and internal verification
 */
export async function runInlineDiagnostics() {
  const tests: { name: string; category: string; passed: boolean; details?: string; durationMs: number }[] = [];
  const startAll = Date.now();

  // Test 1: list_curriculum
  const t1Start = Date.now();
  try {
    const summary = await defaultCurriculumRepository.getCurriculumSummary();
    const passed =
      summary.totalLessonsLoaded >= 10 &&
      summary.levelsCovered.some(l => l.levelId === '1AC') &&
      summary.goldPacksActive.includes('MOROCCO-MATH-1AC-GOLD-v1');
    tests.push({
      name: 'list_curriculum: استرجاع ملخص المنهاج والحزمة الذهبية للأولى إعدادي (1AC)',
      category: 'Curriculum Tool',
      passed,
      details: `تم تحميل ${summary.totalLessonsLoaded} درساً، مع تفعيل الحزمة الذهبية 1AC الرسمية و ${summary.levelsCovered.length} مستويات.`,
      durationMs: Date.now() - t1Start
    });
  } catch (e: any) {
    tests.push({
      name: 'list_curriculum: استرجاع ملخص المنهاج',
      category: 'Curriculum Tool',
      passed: false,
      details: e.message,
      durationMs: Date.now() - t1Start
    });
  }

  // Test 2: search_lessons (Arabic)
  const t2Start = Date.now();
  try {
    const resAr = await defaultCurriculumRepository.searchLessons('فيثاغورس');
    const passed = resAr.totalMatches > 0 && resAr.lessons.some(l => l.id === '3apic-pythagore');
    tests.push({
      name: 'search_lessons: البحث بالعربية ("فيثاغورس")',
      category: 'Search Tool',
      passed,
      details: `تم العثور على ${resAr.totalMatches} درس مطابق، أول تطابق: ${resAr.lessons[0]?.titleAr}`,
      durationMs: Date.now() - t2Start
    });
  } catch (e: any) {
    tests.push({
      name: 'search_lessons: البحث بالعربية',
      category: 'Search Tool',
      passed: false,
      details: e.message,
      durationMs: Date.now() - t2Start
    });
  }

  // Test 3: search_lessons (French)
  const t3Start = Date.now();
  try {
    const resFr = await defaultCurriculumRepository.searchLessons('systèmes');
    const passed = resFr.totalMatches > 0 && resFr.lessons.some(l => l.id === '3apic-systemes');
    tests.push({
      name: 'search_lessons: البحث بالفرنسية ("systèmes")',
      category: 'Search Tool',
      passed,
      details: `تم العثور على ${resFr.totalMatches} درس مطابق: ${resFr.lessons[0]?.titleFr}`,
      durationMs: Date.now() - t3Start
    });
  } catch (e: any) {
    tests.push({
      name: 'search_lessons: البحث بالفرنسية',
      category: 'Search Tool',
      passed: false,
      details: e.message,
      durationMs: Date.now() - t3Start
    });
  }

  // Test 4: verify_calculation (arithmetic & boundaries)
  const t4Start = Date.now();
  try {
    const resArith = CalculationVerifier.verify({
      operationType: 'arithmetic',
      parameters: { expression: '2 * (3 + 4) - 2^3' },
      expectedResult: 6
    });
    const passed =
      resArith.verified &&
      resArith.computedResult === 6 &&
      resArith.matchesExpected === true &&
      resArith.verificationBoundariesNoticeAr.includes('حدود التحقق');
    tests.push({
      name: 'verify_calculation: حساب عددي مع بيان حدود التحقق وعدم ادعاء البراهين',
      category: 'Verifier Tool',
      passed,
      details: `الناتج المحسوب: ${resArith.computedResult}، التطابق: ${resArith.matchesExpected}، توضيح الحدود موجود ومفعل.`,
      durationMs: Date.now() - t4Start
    });
  } catch (e: any) {
    tests.push({
      name: 'verify_calculation: حساب عددي',
      category: 'Verifier Tool',
      passed: false,
      details: e.message,
      durationMs: Date.now() - t4Start
    });
  }

  // Test 5: verify_calculation (GCD & LCM Euclidean)
  const t5Start = Date.now();
  try {
    const resGcd = CalculationVerifier.verify({
      operationType: 'gcd_lcm',
      parameters: { a: 48, b: 36 }
    });
    const data = resGcd.computedResult as any;
    const passed = data.gcd === 12 && data.lcm === 144 && resGcd.stepByStepStepsAr.length > 2;
    tests.push({
      name: 'verify_calculation: خوارزمية إقليدس لـ PGCD(48, 36) و PPCM',
      category: 'Verifier Tool',
      passed,
      details: `PGCD=12, PPCM=144, خطوات إقليدس: ${resGcd.stepByStepStepsAr.length} مراحل مفصلة.`,
      durationMs: Date.now() - t5Start
    });
  } catch (e: any) {
    tests.push({
      name: 'verify_calculation: PGCD و PPCM',
      category: 'Verifier Tool',
      passed: false,
      details: e.message,
      durationMs: Date.now() - t5Start
    });
  }

  // Test 6: verify_calculation (Quadratic equations & Delta)
  const t6Start = Date.now();
  try {
    const resQuad = CalculationVerifier.verify({
      operationType: 'quadratic_equation',
      parameters: { a: 1, b: -5, c: 6 }
    });
    const qData = resQuad.computedResult as any;
    const passed = qData.delta === 1 && qData.solutionsCount === 2 && qData.solutionsReal.includes(2) && qData.solutionsReal.includes(3);
    tests.push({
      name: 'verify_calculation: معادلة من الدرجة الثانية (x² - 5x + 6 = 0)',
      category: 'Verifier Tool',
      passed,
      details: `Δ=${qData.delta}, الحلان: S = {2, 3}`,
      durationMs: Date.now() - t6Start
    });
  } catch (e: any) {
    tests.push({
      name: 'verify_calculation: معادلة الدرجة الثانية',
      category: 'Verifier Tool',
      passed: false,
      details: e.message,
      durationMs: Date.now() - t6Start
    });
  }

  // Test 7: generate_exercises with testable reference solutions
  const t7Start = Date.now();
  try {
    const exResp = await MoroccanExerciseGenerator.generate({
      lessonId: '3apic-pythagore',
      difficulty: 'medium',
      count: 1
    });
    const ex = exResp.exercises[0];
    const passed =
      exResp.totalGenerated === 1 &&
      ex.lessonId === '3apic-pythagore' &&
      ex.contentTag === 'PILOT_EXPERIMENTAL_DATA' &&
      ex.referenceSolution.finalAnswer.includes('10') &&
      ex.statementAr.length > 10;
    tests.push({
      name: 'generate_exercises: توليد تمرين فيثاغورس مع حل مرجعي قابل للاختبار وتمييز البيانات التجريبية',
      category: 'Generator Tool',
      passed,
      details: `معرف التمرين: ${ex?.id}، الحل المرجعي: ${ex?.referenceSolution?.finalAnswer}، وسم البيانات التجريبية: ${ex?.contentTag}`,
      durationMs: Date.now() - t7Start
    });
  } catch (e: any) {
    tests.push({
      name: 'generate_exercises: توليد تمرين فيثاغورس',
      category: 'Generator Tool',
      passed: false,
      details: e.message,
      durationMs: Date.now() - t7Start
    });
  }

  // Test 8: Input validation & error rejection
  const t8Start = Date.now();
  try {
    let errorCaught = false;
    try {
      CalculationVerifier.verify({
        operationType: 'fraction',
        parameters: { num1: 5, den1: 0 } // invalid denominator 0
      });
    } catch {
      errorCaught = true;
    }

    let searchErrorCaught = false;
    try {
      await MoroccanExerciseGenerator.generate({
        lessonId: 'non-existent-lesson-id-9999'
      });
    } catch {
      searchErrorCaught = true;
    }

    const passed = errorCaught && searchErrorCaught;
    tests.push({
      name: 'التحقق الصارم من المدخلات ورفض البيانات غير الصالحة برسائل خطأ صريحة',
      category: 'Validation & Security',
      passed,
      details: `تم رفض القسمة على صفر في الكسور، ورُفض طلب توليد تمرين لدرس غير موجود.`,
      durationMs: Date.now() - t8Start
    });
  } catch (e: any) {
    tests.push({
      name: 'التحقق الصارم من المدخلات',
      category: 'Validation & Security',
      passed: false,
      details: e.message,
      durationMs: Date.now() - t8Start
    });
  }

  const allPassed = tests.every(t => t.passed);
  return {
    success: allPassed,
    totalTests: tests.length,
    passedTests: tests.filter(t => t.passed).length,
    failedTests: tests.filter(t => !t.passed).length,
    totalDurationMs: Date.now() - startAll,
    tests
  };
}
