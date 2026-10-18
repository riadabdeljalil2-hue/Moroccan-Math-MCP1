import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { defaultCurriculumRepository } from '../curriculum/repository.ts';
import { CalculationVerifier } from '../math/verifier.ts';
import { MoroccanExerciseGenerator } from '../math/exerciseGenerator.ts';

export function createMoroccanMathMcpServer(): McpServer {
  const server = new McpServer({
    name: 'moroccan-math-mcp-server',
    version: '1.0.0'
  });

  // Tool 1: list_curriculum
  server.tool(
    'list_curriculum',
    'يعرض المستويات الدراسية والدروس الرياضية المتوفرة حالياً في المنهاج المغربي مع بيان حالتها التجريبية وكفاياتها.',
    {
      level_filter: z
        .string()
        .optional()
        .describe('تصفية حسب المستوى الدراسي: 3APIC (ثالثة إعدادي)، TCS (جذع مشترك علمي)، 1BAC_SM، 2BAC_SM، 2BAC_PC_SVT'),
      domain_filter: z
        .string()
        .optional()
        .describe('تصفية حسب المجال الرياضي: arithmetic, algebra, geometry, analysis, trigonometry, complex_numbers'),
      semester: z
        .number()
        .int()
        .min(1)
        .max(2)
        .optional()
        .describe('تصفية حسب الدورة الدراسية: 1 (الدورة الأولى) أو 2 (الدورة الثانية)')
    },
    async ({ level_filter, domain_filter, semester }) => {
      try {
        const summary = await defaultCurriculumRepository.getCurriculumSummary({
          level: level_filter,
          domain: domain_filter,
          semester: semester as 1 | 2 | undefined
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(summary, null, 2)
            }
          ]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `خطأ أثناء استرجاع بيانات المنهاج: ${err.message || String(err)}`
            }
          ]
        };
      }
    }
  );

  // Tool 2: search_lessons
  server.tool(
    'search_lessons',
    'يبحث عن دروس الرياضيات في المنهاج المغربي بالعربية أو الفرنسية ويعيد تفاصيل الدرس والكفايات والمراجع الرسمية.',
    {
      query: z
        .string()
        .min(2, 'يجب أن يحتوي استعلام البحث على حرفين على الأقل')
        .max(100, 'الحد الأقصى لاستعلام البحث هو 100 حرف')
        .describe('كلمة أو عبارة البحث بالعربية أو الفرنسية (مثال: "فيثاغورس", "systèmes", "الحسابيات", "limites")'),
      level: z
        .string()
        .optional()
        .describe('مستوى دراسي اختياري لتقليص نطاق البحث (مثل: 3APIC, TCS, 1BAC_SM, 2BAC_SM)'),
      language: z
        .enum(['ar', 'fr', 'all'])
        .optional()
        .default('all')
        .describe('لغة البحث المفضلة: ar (عربية)، fr (فرنسية)، أو all (الكل)')
    },
    async ({ query, level, language }) => {
      try {
        const searchResult = await defaultCurriculumRepository.searchLessons(query, {
          level,
          language
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(searchResult, null, 2)
            }
          ]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `خطأ أثناء البحث عن الدروس: ${err.message || String(err)}`
            }
          ]
        };
      }
    }
  );

  // Tool 3: verify_calculation
  server.tool(
    'verify_calculation',
    'يتحقق من صحة العمليات الحسابية والعددية والجبرية المدعومة خطوة بخطوة مع توضيح حدود التحقق وعدم ادعاء إثبات براهين عامة.',
    {
      operation_type: z
        .enum([
          'arithmetic',
          'fraction',
          'gcd_lcm',
          'quadratic_equation',
          'linear_system_2x2',
          'modular_arithmetic'
        ])
        .describe(
          'نوع العملية الرياضية: arithmetic (حساب تعبير عددي)، fraction (كسور واختزال)، gcd_lcm (القاسم والمضاعف المشترك)، quadratic_equation (معادلة من الدرجة الثانية)، linear_system_2x2 (نظمة 2x2)، modular_arithmetic (حسابيات معيارية)'
        ),
      parameters: z
        .record(z.string(), z.any())
        .describe(
          'معاملات العملية حسب نوعها:\n- arithmetic: { expression: "3 * (4 + 5) - 2^3" }\n- fraction: { num1: 18, den1: 24 } أو { num1: 1, den1: 2, num2: 2, den2: 3, op: "+" }\n- gcd_lcm: { a: 48, b: 36 }\n- quadratic_equation: { a: 1, b: -5, c: 6 }\n- linear_system_2x2: { a1: 1, b1: 1, c1: 5, a2: 2, b2: 1, c2: 8 }\n- modular_arithmetic: { a: 17, m: 5 }'
        ),
      expected_result: z
        .union([z.string(), z.number()])
        .optional()
        .describe('قيمة ناتجة متوقعة اختيارية للتحقق من مطابقتها مع الحساب الدقيق')
    },
    async ({ operation_type, parameters, expected_result }) => {
      try {
        const result = CalculationVerifier.verify({
          operationType: operation_type,
          parameters,
          expectedResult: expected_result
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `خطأ في التحقق من الحساب: ${err.message || String(err)}`
            }
          ]
        };
      }
    }
  );

  // Tool 4: generate_exercises
  server.tool(
    'generate_exercises',
    'يولّد تمارين رياضية وفق درس محدد في المنهاج المغربي ومستوى الصعوبة مع حلول مرجعية قابلة للاختبار وتمييز البيانات التجريبية.',
    {
      lesson_id: z
        .string()
        .min(2, 'يجب تزويد معرف درس صالح')
        .describe(
          'معرف الدرس في المنهاج المغربي (أمثلة تجريبية: 3apic-pythagore, 3apic-systemes, tcs-arithmetique, tcs-second-degre, 2bac-limites-continuite)'
        ),
      skill: z
        .string()
        .optional()
        .describe('المهارة أو الكفاية الرياضية المستهدفة اختيارياً'),
      difficulty: z
        .enum(['easy', 'medium', 'hard'])
        .optional()
        .default('medium')
        .describe('مستوى الصعوبة: easy (سهل / تطبيقي مباشر)، medium (متوسط / تركيبي)، hard (متقدم / تعمقي)'),
      count: z
        .number()
        .int()
        .min(1)
        .max(5)
        .optional()
        .default(1)
        .describe('عدد التمارين المطلوبة (بين 1 و 5)')
    },
    async ({ lesson_id, skill, difficulty, count }) => {
      try {
        const generated = await MoroccanExerciseGenerator.generate({
          lessonId: lesson_id,
          skill,
          difficulty,
          count
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(generated, null, 2)
            }
          ]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `خطأ أثناء توليد التمارين: ${err.message || String(err)}`
            }
          ]
        };
      }
    }
  );

  return server;
}
