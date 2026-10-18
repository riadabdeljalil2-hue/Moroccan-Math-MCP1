/**
 * Moroccan Math MCP Server - Comprehensive Automated Test Suite
 * Tests all 4 MCP tools, input validation, boundaries, authentication,
 * and executes a live MCP protocol client session over Streamable HTTP.
 */

import http from 'http';
import { defaultCurriculumRepository } from '../src/server/curriculum/repository.ts';
import { CalculationVerifier } from '../src/server/math/verifier.ts';
import { MoroccanExerciseGenerator } from '../src/server/math/exerciseGenerator.ts';
import { createApp } from '../src/server/app.ts';
import { getExpectedApiKey, validateApiKey } from '../src/server/auth.ts';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, errorDetails?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✘ FAIL\x1b[0m ${testName}`);
    if (errorDetails) {
      console.error(`     \x1b[33mError details: ${errorDetails}\x1b[0m`);
    }
  }
}

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log(' Moroccan Math MCP Server - Automated Test Suite');
  console.log('===============================================================\n');

  // --- Suite 1: Curriculum & Pilot Data ---
  console.log('\x1b[1m[Suite 1: Curriculum Repository & Pilot Data]\x1b[0m');
  try {
    const summary = await defaultCurriculumRepository.getCurriculumSummary();
    assert(summary.totalLessonsLoaded >= 8, 'list_curriculum returns at least 8 pilot lessons');
    assert(summary.isPilotBaseline === true, 'Curriculum is explicitly tagged as pilot baseline');
    assert(
      summary.levelsCovered.some(l => l.levelId === '3APIC') &&
      summary.levelsCovered.some(l => l.levelId === 'TCS') &&
      summary.levelsCovered.some(l => l.levelId === '2BAC_PC_SVT'),
      'Curriculum covers 3APIC, TCS, and 2BAC stages'
    );

    // Search Arabic
    const searchAr = await defaultCurriculumRepository.searchLessons('فيثاغورس');
    assert(searchAr.totalMatches > 0, 'search_lessons finds lessons with Arabic query ("فيثاغورس")');
    assert(searchAr.lessons[0].id === '3apic-pythagore', 'search_lessons correctly prioritizes 3APIC Pythagore');
    assert(searchAr.lessons[0].reference.status === 'pilot_data', 'Returned lesson has pilot_data status');

    // Search French
    const searchFr = await defaultCurriculumRepository.searchLessons('systèmes');
    assert(searchFr.totalMatches > 0, 'search_lessons finds lessons with French query ("systèmes")');
    assert(searchFr.lessons[0].id === '3apic-systemes', 'search_lessons prioritizes 3APIC linear systems');
  } catch (err: any) {
    assert(false, 'Suite 1 execution failed', err.message);
  }

  // --- Suite 2: Math Calculation Verifier & Boundary Disclaimers ---
  console.log('\n\x1b[1m[Suite 2: Math Calculation Verifier & Boundaries]\x1b[0m');
  try {
    // 2.1 Arithmetic
    const arithRes = CalculationVerifier.verify({
      operationType: 'arithmetic',
      parameters: { expression: '3 * (4 + 5) - 2^3' },
      expectedResult: 19
    });
    assert(arithRes.verified && arithRes.computedResult === 19, 'verify_calculation computes arithmetic correctly: 3*(4+5)-2^3 = 19');
    assert(arithRes.matchesExpected === true, 'matchesExpected flag is correctly true');
    assert(arithRes.verificationBoundariesNoticeAr.includes('حدود التحقق'), 'Response contains explicit verification boundaries notice in Arabic');

    // 2.2 Fractions
    const fracRes = CalculationVerifier.verify({
      operationType: 'fraction',
      parameters: { num1: 18, den1: 24 }
    });
    const simpData = fracRes.computedResult as any;
    assert(simpData.simplified === '3/4', 'Fraction simplification reduces 18/24 to 3/4');

    const fracAdd = CalculationVerifier.verify({
      operationType: 'fraction',
      parameters: { num1: 1, den1: 3, num2: 1, den2: 6, op: '+' }
    });
    assert((fracAdd.computedResult as any).simplified === '1/2', 'Fraction addition: 1/3 + 1/6 = 1/2');

    // 2.3 GCD & LCM (Euclidean Algorithm)
    const gcdRes = CalculationVerifier.verify({
      operationType: 'gcd_lcm',
      parameters: { a: 48, b: 36 }
    });
    const gcdData = gcdRes.computedResult as any;
    assert(gcdData.gcd === 12 && gcdData.lcm === 144, 'PGCD(48, 36) = 12 and PPCM(48, 36) = 144');
    assert(gcdRes.stepByStepStepsAr.some(s => s.includes('48 = 36 × 1 + 12')), 'Euclidean division steps are documented step-by-step');

    // 2.4 Quadratic Equation
    const quadRes = CalculationVerifier.verify({
      operationType: 'quadratic_equation',
      parameters: { a: 1, b: -5, c: 6 }
    });
    const qData = quadRes.computedResult as any;
    assert(qData.delta === 1, 'Quadratic delta for x² - 5x + 6 is 1');
    assert(qData.solutionsCount === 2 && qData.solutionsReal.includes(2) && qData.solutionsReal.includes(3), 'Solutions are {2, 3}');

    // 2.5 Linear System 2x2
    const sysRes = CalculationVerifier.verify({
      operationType: 'linear_system_2x2',
      parameters: { a1: 1, b1: 1, c1: 5, a2: 2, b2: 1, c2: 8 }
    });
    const sData = sysRes.computedResult as any;
    assert(sData.hasUniqueSolution && sData.uniqueSolution.x === 3 && sData.uniqueSolution.y === 2, 'Linear system solution is (x=3, y=2)');

    // 2.6 Modular Arithmetic
    const modRes = CalculationVerifier.verify({
      operationType: 'modular_arithmetic',
      parameters: { a: 17, m: 5 }
    });
    assert((modRes.computedResult as any).remainder === 2, 'Modular arithmetic 17 mod 5 = 2');
  } catch (err: any) {
    assert(false, 'Suite 2 execution failed', err.message);
  }

  // --- Suite 3: Exercise Generator & Reference Solutions ---
  console.log('\n\x1b[1m[Suite 3: Exercise Generator & Reference Solutions]\x1b[0m');
  try {
    const exResp = await MoroccanExerciseGenerator.generate({
      lessonId: '3apic-pythagore',
      difficulty: 'easy',
      count: 1
    });
    assert(exResp.totalGenerated === 1, 'Generates requested count of exercises');
    const ex = exResp.exercises[0];
    assert(ex.lessonId === '3apic-pythagore', 'Exercise belongs to requested lesson');
    assert(ex.contentTag === 'PILOT_EXPERIMENTAL_DATA', 'Exercise is explicitly tagged as PILOT_EXPERIMENTAL_DATA');
    assert(ex.referenceSolution.finalAnswer.length > 0, 'Exercise includes reference solution');
    assert(!!ex.referenceSolution.testVerificationKey, 'Exercise has testable verification key');

    // Generator for TCS second degree
    const exTcs = await MoroccanExerciseGenerator.generate({
      lessonId: 'tcs-second-degre',
      difficulty: 'medium',
      count: 1
    });
    assert(exTcs.exercises[0].statementAr.includes('x²'), 'Second degree exercise includes quadratic equation');
  } catch (err: any) {
    assert(false, 'Suite 3 execution failed', err.message);
  }

  // --- Suite 4: Strict Input Validation & Error Handling ---
  console.log('\n\x1b[1m[Suite 4: Strict Input Validation & Error Rejections]\x1b[0m');
  try {
    // Zero denominator
    let zeroDenError = false;
    try {
      CalculationVerifier.verify({
        operationType: 'fraction',
        parameters: { num1: 5, den1: 0 }
      });
    } catch (e: any) {
      zeroDenError = e.message.includes('المقام غير منعدم');
    }
    assert(zeroDenError, 'Rejects zero denominator in fractions with clear Arabic error message');

    // Forbidden characters in arithmetic
    let badCharError = false;
    try {
      CalculationVerifier.verify({
        operationType: 'arithmetic',
        parameters: { expression: 'process.exit(1)' }
      });
    } catch (e: any) {
      badCharError = e.message.includes('غير مسموح');
    }
    assert(badCharError, 'Rejects non-math expression injection attempts');

    // Non-existent lesson
    let nonExistentLesson = false;
    try {
      await MoroccanExerciseGenerator.generate({
        lessonId: 'fake-unknown-lesson-id'
      });
    } catch (e: any) {
      nonExistentLesson = e.message.includes('غير موجود');
    }
    assert(nonExistentLesson, 'Rejects invalid lesson ID with helpful guidance to search_lessons');
  } catch (err: any) {
    assert(false, 'Suite 4 execution failed', err.message);
  }

  // --- Suite 5: Authentication & Security ---
  console.log('\n\x1b[1m[Suite 5: Authentication & Security Tokens]\x1b[0m');
  try {
    const validKey = getExpectedApiKey();
    assert(validateApiKey(validKey), 'Accepts valid API key');
    assert(!validateApiKey('invalid-tampered-token'), 'Rejects invalid token');
    assert(!validateApiKey(null), 'Rejects null/missing token');
  } catch (err: any) {
    assert(false, 'Suite 5 execution failed', err.message);
  }

  // --- Suite 6: Live MCP Client Protocol Handshake & Tool Invocations over Streamable HTTP ---
  console.log('\n\x1b[1m[Suite 6: End-to-End MCP Client over Streamable HTTP]\x1b[0m');
  const app = createApp();
  const testPort = 5998;
  const testServer = http.createServer(app);

  await new Promise<void>((resolve) => {
    testServer.listen(testPort, '127.0.0.1', () => {
      resolve();
    });
  });

  try {
    const token = getExpectedApiKey();
    const endpointUrl = new URL(`http://127.0.0.1:${testPort}/mcp`);

    // Official MCP Client with StreamableHTTPClientTransport
    const client = new Client(
      {
        name: 'test-moroccan-math-client',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );

    const clientTransport = new StreamableHTTPClientTransport(endpointUrl, {
      requestInit: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // 6.1 Handshake
    await client.connect(clientTransport);
    assert(true, 'MCP Client successfully connected over Streamable HTTP (/mcp)');

    // 6.2 Tool Discovery
    const toolsResult = await client.listTools();
    const toolNames = toolsResult.tools.map(t => t.name);
    assert(toolNames.includes('list_curriculum'), 'Discovered tool: list_curriculum');
    assert(toolNames.includes('search_lessons'), 'Discovered tool: search_lessons');
    assert(toolNames.includes('verify_calculation'), 'Discovered tool: verify_calculation');
    assert(toolNames.includes('generate_exercises'), 'Discovered tool: generate_exercises');
    assert(toolNames.length === 4, 'All 4 required tools are registered and discovered');

    // 6.3 Tool Invocation 1: list_curriculum
    const callListRes: any = await client.callTool({
      name: 'list_curriculum',
      arguments: { level_filter: '3APIC' }
    });
    const listData = JSON.parse(callListRes.content[0].text);
    assert(listData.levelsCovered.some((l: any) => l.levelId === '3APIC'), 'MCP client called list_curriculum successfully');

    // 6.4 Tool Invocation 2: search_lessons
    const callSearchRes: any = await client.callTool({
      name: 'search_lessons',
      arguments: { query: 'فيثاغورس' }
    });
    const searchData = JSON.parse(callSearchRes.content[0].text);
    assert(searchData.totalMatches > 0, 'MCP client called search_lessons successfully over protocol');

    // 6.5 Tool Invocation 3: verify_calculation
    const callVerifyRes: any = await client.callTool({
      name: 'verify_calculation',
      arguments: {
        operation_type: 'gcd_lcm',
        parameters: { a: 24, b: 18 }
      }
    });
    const verifyData = JSON.parse(callVerifyRes.content[0].text);
    assert(verifyData.computedResult.gcd === 6, 'MCP client called verify_calculation: PGCD(24, 18) = 6');

    // 6.6 Tool Invocation 4: generate_exercises
    const callGenRes: any = await client.callTool({
      name: 'generate_exercises',
      arguments: {
        lesson_id: '3apic-pythagore',
        difficulty: 'medium',
        count: 1
      }
    });
    const genData = JSON.parse(callGenRes.content[0].text);
    assert(genData.exercises.length === 1, 'MCP client called generate_exercises successfully');

    await client.close();
    assert(true, 'MCP Client session closed cleanly (Session Lifecycle verified)');
  } catch (err: any) {
    assert(false, 'MCP Protocol Streamable HTTP test failed', err.message);
  } finally {
    testServer.close();
  }

  // --- Final Summary ---
  console.log('\n===============================================================');
  console.log(` Test Execution Finished: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log('===============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
