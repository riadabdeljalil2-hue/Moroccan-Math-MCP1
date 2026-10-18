import React, { useState, useEffect } from 'react';
import {
  Server,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  BookOpen,
  Search,
  Calculator,
  FileQuestion,
  RefreshCw,
  ExternalLink,
  Code2,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

interface HealthData {
  status: string;
  serverName: string;
  version: string;
  protocol: string;
  transports: { streamableHttp: string; sse: string; ssePost: string };
  authConfigured: boolean;
  tools: { name: string; descriptionAr: string; status: string }[];
  dataset: { status: string; officialStandard: string };
  timestamp: string;
}

interface TestRunResult {
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDurationMs: number;
  tests: { name: string; category: string; passed: boolean; details?: string; durationMs: number }[];
}

export default function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tools' | 'tests' | 'curriculum' | 'deploy'>('tools');
  const [selectedTool, setSelectedTool] = useState<string>('list_curriculum');
  const [authToken, setAuthToken] = useState<string>('moroccan-math-mcp-dev-token-secret-2025');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tool execution states
  const [toolLoading, setToolLoading] = useState(false);
  const [toolResult, setToolResult] = useState<any>(null);
  const [toolError, setToolError] = useState<string | null>(null);

  // Tool inputs
  const [listLevelFilter, setListLevelFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('فيثاغورس');
  const [calcOpType, setCalcOpType] = useState('gcd_lcm');
  const [calcParamsRaw, setCalcParamsRaw] = useState(JSON.stringify({ a: 48, b: 36 }, null, 2));
  const [genLessonId, setGenLessonId] = useState('3apic-pythagore');
  const [genDifficulty, setGenDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [genCount, setGenCount] = useState<number>(1);

  // Diagnostics state
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<TestRunResult | null>(null);

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.error('Error fetching health:', e);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const executeSelectedTool = async () => {
    setToolLoading(true);
    setToolResult(null);
    setToolError(null);

    let args: any = {};
    try {
      if (selectedTool === 'list_curriculum') {
        args = listLevelFilter !== 'ALL' ? { level_filter: listLevelFilter } : {};
      } else if (selectedTool === 'search_lessons') {
        args = { query: searchQuery };
      } else if (selectedTool === 'verify_calculation') {
        args = {
          operation_type: calcOpType,
          parameters: JSON.parse(calcParamsRaw)
        };
      } else if (selectedTool === 'generate_exercises') {
        args = {
          lesson_id: genLessonId,
          difficulty: genDifficulty,
          count: genCount
        };
      }

      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ toolName: selectedTool, args })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setToolError(data.error || 'فشل استدعاء الأداة.');
      } else {
        setToolResult(data.result);
      }
    } catch (err: any) {
      setToolError(err.message || 'خطأ غير متوقع في الاتصال بالخادم.');
    } finally {
      setToolLoading(false);
    }
  };

  const runDiagnostics = async () => {
    setDiagnosticsLoading(true);
    try {
      const res = await fetch('/api/tests/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      setDiagnosticsResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const clientConfigJson = JSON.stringify(
    {
      mcpServers: {
        'moroccan-math': {
          url: `${window.location.origin}/mcp`,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      }
    },
    null,
    2
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
      {/* Top Header / Identity */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100">Moroccan Math MCP Server</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  v1.0.0
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>1AC Gold Pack + Pilot Baseline</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                خادم بروتوكول سياق النموذج (MCP) الموثوق للرياضيات وفق المنهاج المغربي | Streamable HTTP & Vercel Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Port: 3000</span>
              <span className="text-slate-500">|</span>
              <span>Streamable: /mcp</span>
            </div>
            <button
              onClick={fetchHealth}
              disabled={healthLoading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="تحديث حالة الخادم"
            >
              <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-6">
        {/* Banner with Key Architectural Declarations */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-emerald-300">خادم أدوات مستقل ومصادق بالكامل: </span>
              <span className="text-slate-300">
                يوفر 4 أدوات مطابقة للمنهاج المغربي عبر نقل Streamable HTTP الرسمي، مع التمييز الصريح للبيانات التجريبية وبيان حدود التحقق الحسابي.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>رمز المصادقة:</span>
              <code className="text-emerald-400 font-mono">Bearer ***</code>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'tools'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>مستكشف ومختبر الأدوات (Tool Runner)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('tests');
              if (!diagnosticsResult) runDiagnostics();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'tests'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>حزمة الاختبارات الآلية (42 فحصاً)</span>
            {diagnosticsResult && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {diagnosticsResult.passedTests}/{diagnosticsResult.totalTests}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'curriculum'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>خريطة المنهاج المغربي التجريبي</span>
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'deploy'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>دليل النشر على Vercel المجاني</span>
          </button>
        </div>

        {/* TAB 1: TOOL RUNNER */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Tools Selection & Form */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  اختر أداة من الأدوات الأربع المعتمدة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'list_curriculum', label: '1. list_curriculum', icon: BookOpen },
                    { id: 'search_lessons', label: '2. search_lessons', icon: Search },
                    { id: 'verify_calculation', label: '3. verify_calculation', icon: Calculator },
                    { id: 'generate_exercises', label: '4. generate_exercises', icon: FileQuestion }
                  ].map(tool => {
                    const Icon = tool.icon;
                    const isSelected = selectedTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setSelectedTool(tool.id);
                          setToolResult(null);
                          setToolError(null);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-right transition-all border ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                            : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span>{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Arguments Form based on selected tool */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-semibold text-slate-200">معاملات استدعاء الأداة ({selectedTool})</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">JSON-RPC args</span>
                </div>

                {/* 1. list_curriculum Inputs */}
                {selectedTool === 'list_curriculum' && (
                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">تصفية حسب المستوى الدراسي (level_filter):</label>
                      <select
                        value={listLevelFilter}
                        onChange={e => setListLevelFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="ALL">جميع المستويات المغطاة (All Levels)</option>
                        <option value="1AC">السنة الأولى إعدادي - الحزمة الذهبية الرسمية (1AC Gold Pack)</option>
                        <option value="3APIC">السنة الثالثة ثانوي إعدادي (3APIC)</option>
                        <option value="TCS">الجذع المشترك العلمي والتكنولوجي (TCS)</option>
                        <option value="1BAC_SM">الأولى باك علوم رياضية (1BAC_SM)</option>
                        <option value="2BAC_PC_SVT">الثانية باك علوم تجريبية (2BAC_PC_SVT)</option>
                        <option value="2BAC_SM">الثانية باك علوم رياضية (2BAC_SM)</option>
                      </select>
                    </div>
                    <p className="text-slate-400 text-xs">
                      أداة <code className="text-emerald-400">list_curriculum</code> تُرجع المستويات والدروس المحملة وتوثيق مراجعها وحالتها (الحزمة الذهبية الرسمية 1AC + العينات التجريبية).
                    </p>
                  </div>
                )}

                {/* 2. search_lessons Inputs */}
                {selectedTool === 'search_lessons' && (
                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">استعلام البحث بالعربية أو الفرنسية (query):</label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="مثال: أسبقية العمليات، فيثاغورس، واسط قطعة، النشر، المتفاوتة المثلثية..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-slate-400">اقتراحات سريعة:</span>
                      {['أسبقية العمليات', 'المتفاوتة المثلثية', 'النشر والتعميل', 'فيثاغورس', 'systèmes', 'الحسابيات'].map(kw => (
                        <button
                          key={kw}
                          onClick={() => setSearchQuery(kw)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. verify_calculation Inputs */}
                {selectedTool === 'verify_calculation' && (
                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">نوع العملية (operation_type):</label>
                      <select
                        value={calcOpType}
                        onChange={e => {
                          const op = e.target.value;
                          setCalcOpType(op);
                          if (op === 'arithmetic') setCalcParamsRaw(JSON.stringify({ expression: '3 * (4 + 5) - 2^3' }, null, 2));
                          if (op === 'fraction') setCalcParamsRaw(JSON.stringify({ num1: 18, den1: 24, num2: 1, den2: 2, op: '+' }, null, 2));
                          if (op === 'gcd_lcm') setCalcParamsRaw(JSON.stringify({ a: 48, b: 36 }, null, 2));
                          if (op === 'quadratic_equation') setCalcParamsRaw(JSON.stringify({ a: 1, b: -5, c: 6 }, null, 2));
                          if (op === 'linear_system_2x2') setCalcParamsRaw(JSON.stringify({ a1: 1, b1: 1, c1: 5, a2: 2, b2: 1, c2: 8 }, null, 2));
                          if (op === 'modular_arithmetic') setCalcParamsRaw(JSON.stringify({ a: 17, m: 5 }, null, 2));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        <option value="gcd_lcm">gcd_lcm (القاسم والمضاعف المشترك الأكبر/الأصغر)</option>
                        <option value="quadratic_equation">quadratic_equation (معادلة الدرجة الثانية ومميز دلتا)</option>
                        <option value="linear_system_2x2">linear_system_2x2 (نظمة معادلتين 2x2)</option>
                        <option value="arithmetic">arithmetic (تعبير حسابي عددي)</option>
                        <option value="fraction">fraction (حساب وتبسيط الكسور)</option>
                        <option value="modular_arithmetic">modular_arithmetic (حسابيات معيارية)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">معاملات العملية بصيغة JSON (parameters):</label>
                      <textarea
                        rows={4}
                        value={calcParamsRaw}
                        onChange={e => setCalcParamsRaw(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                        dir="ltr"
                      />
                    </div>
                    <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                      <strong>حدود التحقق:</strong> التحقق محصور في العمليات الرياضية العددية والجبرية المدعومة فقط، ولا يدعي الخادم إثبات براهين عامة.
                    </div>
                  </div>
                )}

                {/* 4. generate_exercises Inputs */}
                {selectedTool === 'generate_exercises' && (
                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">معرف الدرس (lesson_id):</label>
                      <select
                        value={genLessonId}
                        onChange={e => setGenLessonId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="les-math-1ac-precedence">les-math-1ac-precedence (أسبقية العمليات والأقواس - 1AC Gold)</option>
                        <option value="les-math-1ac-dev-fact">les-math-1ac-dev-fact (النشر والتعميل - 1AC Gold)</option>
                        <option value="les-math-1ac-mediatrice-detail">les-math-1ac-mediatrice-detail (واسط قطعة والمتفاوتة المثلثية - 1AC Gold)</option>
                        <option value="3apic-pythagore">3apic-pythagore (مبرهنة فيثاغورس - 3APIC)</option>
                        <option value="3apic-systemes">3apic-systemes (نظمات معادلتين - 3APIC)</option>
                        <option value="tcs-arithmetique">tcs-arithmetique (الحسابيات في N - TCS)</option>
                        <option value="tcs-second-degre">tcs-second-degre (الدرجة الثانية ودلتا - TCS)</option>
                        <option value="2bac-limites-continuite">2bac-limites-continuite (الاتصال و TVI - 2BAC)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1">مستوى الصعوبة (difficulty):</label>
                        <select
                          value={genDifficulty}
                          onChange={e => setGenDifficulty(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="easy">سهل (easy)</option>
                          <option value="medium">متوسط (medium)</option>
                          <option value="hard">متقدم (hard)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">العدد (count):</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={genCount}
                          onChange={e => setGenCount(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Authentication Token Input */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-slate-400 text-xs mb-1">
                    رمز Bearer للمصادقة (Authorization Header):
                  </label>
                  <input
                    type="password"
                    value={authToken}
                    onChange={e => setAuthToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="MCP_API_KEY secret token"
                    dir="ltr"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={executeSelectedTool}
                  disabled={toolLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {toolLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري معالجة استدعاء MCP...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>تنفيذ الأداة ({selectedTool})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Response Display & Verification Inspector */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex-1 flex flex-col min-h-[420px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-slate-200">مخرجات الاستجابة المنظمة (MCP Tool Output)</h3>
                  </div>
                  {toolResult && (
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(toolResult, null, 2), 'tool-res')}
                      className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                    >
                      {copiedKey === 'tool-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>نسخ JSON</span>
                    </button>
                  )}
                </div>

                {toolError && (
                  <div className="p-3.5 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold mb-0.5">خطأ في التنفيذ:</div>
                      <div>{toolError}</div>
                    </div>
                  </div>
                )}

                {toolResult ? (
                  <div className="flex-1 flex flex-col gap-3">
                    {/* Visual cards if exercise or verifier */}
                    {toolResult.verified && (
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
                        <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>تم التحقق الحسابي بنجاح: {toolResult.normalizedInput}</span>
                        </div>
                        <div className="text-slate-300 space-y-1 mt-2">
                          {toolResult.stepByStepStepsAr?.map((step: string, i: number) => (
                            <div key={i} className="text-slate-300">
                              {step}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-2 border-t border-emerald-500/20 text-amber-300 text-[11px]">
                          {toolResult.verificationBoundariesNoticeAr}
                        </div>
                      </div>
                    )}

                    {toolResult.exercises && (
                      <div className="space-y-3">
                        {toolResult.exercises.map((ex: any) => (
                          <div key={ex.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-emerald-400">{ex.id}</span>
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                                {ex.contentTag}
                              </span>
                            </div>
                            <div className="text-slate-100 font-medium mb-2 whitespace-pre-line">{ex.statementAr}</div>
                            <div className="text-slate-400 text-[11px] mb-2 font-sans italic" dir="ltr">
                              {ex.statementFr}
                            </div>
                            <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                              <div className="text-emerald-300 font-semibold mb-1">الحل المرجعي القابل للاختبار:</div>
                              <div className="text-slate-300 space-y-0.5 text-[11px]">
                                {ex.referenceSolution?.stepsAr?.map((s: string, idx: number) => (
                                  <div key={idx}>• {s}</div>
                                ))}
                              </div>
                              <div className="mt-2 text-xs font-mono text-emerald-400">
                                النتيجة النهائية: {ex.referenceSolution?.finalAnswer}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Raw JSON viewer */}
                    <div className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-auto max-h-[320px]">
                      <pre className="text-emerald-400 font-mono text-xs" dir="ltr">
                        {JSON.stringify(toolResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-8 border border-dashed border-slate-800 rounded-lg">
                    <Calculator className="w-8 h-8 text-slate-600 mb-2" />
                    <p>اضغط على زر "تنفيذ الأداة" لإرسال طلب فحص مباشر للخادم ورؤية الاستجابة هنا.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUTOMATED TEST SUITE */}
        {activeTab === 'tests' && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>حزمة الاختبارات الآلية الشاملة (42 فحصاً)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  تختبر الأدوات الأربع، والتحقق الصارم من المدخلات، وحدود التحقق، والمصادقة، ودورة حياة جلسة العميل عبر بروتوكول MCP Streamable HTTP.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={runDiagnostics}
                  disabled={diagnosticsLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${diagnosticsLoading ? 'animate-spin' : ''}`} />
                  <span>إعادة تشغيل جميع الاختبارات</span>
                </button>
              </div>
            </div>

            {diagnosticsLoading && (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                <span>جاري تشغيل وفحص الاختبارات الـ 42 داخلياً...</span>
              </div>
            )}

            {diagnosticsResult && (
              <div className="flex flex-col gap-4">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {diagnosticsResult.passedTests}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">الاختبارات الناجحة</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-2xl font-bold font-mono text-slate-200">
                      {diagnosticsResult.totalTests}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">إجمالي الفحوصات</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-2xl font-bold font-mono text-red-400">
                      {diagnosticsResult.failedTests}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">الاختبارات الفاشلة</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-2xl font-bold font-mono text-teal-400">
                      {diagnosticsResult.totalDurationMs} ms
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">زمن التنفيذ الكلي</div>
                  </div>
                </div>

                {/* Detailed Test Items List */}
                <div className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>تفاصيل الاختبار والحالة</span>
                    <span>المدة الزمنية</span>
                  </div>
                  <div className="divide-y divide-slate-800/80">
                    {diagnosticsResult.tests.map((test, index) => (
                      <div key={index} className="p-3.5 flex items-start justify-between gap-3 text-xs hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-100">{test.name}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400">
                                {test.category}
                              </span>
                            </div>
                            {test.details && (
                              <p className="text-slate-400 mt-1 text-[11px] font-sans">{test.details}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px] flex-shrink-0">
                          {test.durationMs}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CURRICULUM MAP */}
        {activeTab === 'curriculum' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">هيكلة المنهاج المغربي للرياضيات (النسخة التجريبية الأولى)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  طبقة بيانات قابلة للاستبدال كلياً بقاعدة المعرفة الرسمية دون المساس بأسماء الأدوات أو واجهاتها.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                قاعدة بيانات تجريبية (Pilot Baseline)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  code: '1AC',
                  nameAr: 'السنة الأولى ثانوي إعدادي (الحزمة الذهبية المعتمدة)',
                  nameFr: '1ère Année Collégiale (Pack Gold Standard)',
                  cycle: 'الثانوي الإعدادي',
                  isGold: true,
                  lessons: [
                    { id: 'les-math-1ac-precedence', titleAr: 'أسبقية العمليات والأقواس', titleFr: 'Ordre des opérations' },
                    { id: 'les-math-1ac-dev-fact', titleAr: 'النشر والتعميل والحساب الحرفي', titleFr: 'Développement et factorisation' },
                    { id: 'les-math-1ac-mediatrice-detail', titleAr: 'واسط قطعة والمتفاوتة المثلثية', titleFr: 'Médiatrice et inégalité triangulaire' },
                    { id: 'les-math-1ac-triangle-props', titleAr: 'المثلث: مجموع الزوايا والأنواع الخاصة', titleFr: 'Le triangle et somme des angles' },
                    { id: 'les-math-1ac-angles-types', titleAr: 'الزوايا والتوازي والقواطع', titleFr: 'Angles et droites parallèles' }
                  ]
                },
                {
                  code: '3APIC',
                  nameAr: 'السنة الثالثة ثانوي إعدادي',
                  nameFr: '3ème Année Collégiale',
                  cycle: 'الثانوي الإعدادي',
                  lessons: [
                    { id: '3apic-pythagore', titleAr: 'مبرهنة فيثاغورس', titleFr: 'Théorème de Pythagore' },
                    { id: '3apic-systemes', titleAr: 'نظمات معادلتين من الدرجة الأولى', titleFr: 'Systèmes 2x2' },
                    { id: '3apic-thales', titleAr: 'مبرهنة طاليس', titleFr: 'Théorème de Thalès' }
                  ]
                },
                {
                  code: 'TCS',
                  nameAr: 'الجذع المشترك العلمي والتكنولوجي',
                  nameFr: 'Tronc Commun Scientifique',
                  cycle: 'الثانوي التأهيلي',
                  lessons: [
                    { id: 'tcs-arithmetique', titleAr: 'الحسابيات في مجموعة N (PGCD/PPCM)', titleFr: 'Arithmétique dans N' },
                    { id: 'tcs-second-degre', titleAr: 'المعادلات والمتراجحات من الدرجة الثانية (دلتا)', titleFr: 'Second degré' },
                    { id: 'tcs-fonctions', titleAr: 'عموميات حول الدوال ومجموعة التعريف', titleFr: 'Généralités sur les fonctions' }
                  ]
                },
                {
                  code: '1BAC_SM',
                  nameAr: 'الأولى بكالوريا علوم رياضية',
                  nameFr: '1ère Bac Sciences Mathématiques',
                  cycle: 'الثانوي التأهيلي',
                  lessons: [
                    { id: '1bacsm-logique', titleAr: 'مبادئ في المنطق الرياضي والاستدلال', titleFr: 'Logique mathématique' }
                  ]
                },
                {
                  code: '2BAC_PC_SVT',
                  nameAr: 'الثانية بكالوريا علوم تجريبية',
                  nameFr: '2ème Bac Sciences Expérimentales',
                  cycle: 'الثانوي التأهيلي',
                  lessons: [
                    { id: '2bac-limites-continuite', titleAr: 'الاتصال والنهايات ومبرهنة القيم الوسيطية (TVI)', titleFr: 'Continuité et limites' }
                  ]
                },
                {
                  code: '2BAC_SM',
                  nameAr: 'الثانية بكالوريا علوم رياضية',
                  nameFr: '2ème Bac Sciences Mathématiques',
                  cycle: 'الثانوي التأهيلي',
                  lessons: [
                    { id: '2bac-nombres-complexes', titleAr: 'الأعداد العقدية والأشكال الجبرية والمثلثية', titleFr: 'Nombres complexes' }
                  ]
                }
              ].map(lvl => (
                <div key={lvl.code} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-emerald-400 font-mono text-sm">{lvl.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">{lvl.cycle}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-100">{lvl.nameAr}</h4>
                    <p className="text-[11px] text-slate-400 italic font-sans" dir="ltr">{lvl.nameFr}</p>
                    <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-2">
                      {lvl.lessons.map(l => (
                        <div key={l.id} className="p-2 rounded bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between">
                          <div>
                            <div className="text-slate-200 font-medium">{l.titleAr}</div>
                            <div className="text-slate-500 text-[10px] italic font-sans" dir="ltr">{l.titleFr}</div>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">{l.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 text-[10px] text-slate-500 border-t border-slate-800 flex items-center justify-between">
                    <span>حالة البيانات: تجريبية</span>
                    <span>وزارة التربية الوطنية</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VERCEL DEPLOYMENT GUIDE */}
        {activeTab === 'deploy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-4 text-xs">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  <span>خطوات النشر على Vercel (الخطة المجانية Hobby Plan)</span>
                </h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                  تم إعداد المشروع بملف <code className="text-emerald-400">vercel.json</code> ودالة الخادم في <code className="text-emerald-400">api/index.ts</code> ليكون متوافقاً تماماً مع بيئة Vercel Serverless ومع نقل Streamable HTTP عبر HTTPS.
                </p>

                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-slate-200 mb-1">الخطوة 1: دفع المشروع إلى GitHub</div>
                    <code className="block bg-slate-900 p-2 rounded text-emerald-400 font-mono text-[11px]" dir="ltr">
                      git add .<br />
                      git commit -m "feat: Moroccan Math MCP Server initial release"<br />
                      git push origin main
                    </code>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-slate-200 mb-1">الخطوة 2: استيراد المشروع في Vercel Dashboard</div>
                    <p className="text-slate-400">
                      اختر المستودع في لوحة تحكم Vercel. سيتعرف Vercel تلقائياً على Vite وإعدادات <code className="text-emerald-400">vercel.json</code>.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-slate-200 mb-1">الخطوة 3: إضافة متغير البيئة السري (Environment Variable)</div>
                    <p className="text-slate-400 mb-2">
                      في إعدادات المشروع (Settings -&gt; Environment Variables)، أضف المتغير:
                    </p>
                    <div className="bg-slate-900 p-2 rounded font-mono text-emerald-400 text-[11px]" dir="ltr">
                      MCP_API_KEY = "your-secure-random-mcp-secret-key-here"
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-slate-200 mb-1">الخطوة 4: النشر والتحقق من النطاق المباشر</div>
                    <p className="text-slate-400">
                      بعد النشر، سيكون رابط Streamable HTTP هو:
                      <code className="text-emerald-400 block mt-1 font-mono" dir="ltr">
                        https://your-project.vercel.app/mcp
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-amber-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>ملاحظات توافق نقل Streamable HTTP في بيئة Vercel Serverless:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>الدوال في Vercel Serverless تعمل بشكل عديم الحالة (Stateless). نقل Streamable HTTP المدمج يولد معرفات جلسات تلقائية لكل جلسة.</li>
                  <li>تم ضبط ترويسات <code className="text-slate-200">Cache-Control: no-cache</code> و <code className="text-slate-200">X-Accel-Buffering: no</code> في <code className="text-slate-200">vercel.json</code> لتفادي احتجاز التدفق المؤقت.</li>
                  <li>مدة التنفيذ القصوى على الخطة المجانية هي 15 ثانية، وهي كافية تماماً لجميع أدوات التحقق وتوليد التمارين الرياضية.</li>
                </ul>
              </div>
            </div>

            {/* Right: MCP Client Config Snippet */}
            <div className="lg:col-span-5 flex flex-col gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-200">إعداد عميل MCP (Claude Desktop / Cursor)</h4>
                  <button
                    onClick={() => copyToClipboard(clientConfigJson, 'mcp-config')}
                    className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                  >
                    {copiedKey === 'mcp-config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الإعداد</span>
                  </button>
                </div>
                <p className="text-slate-400 mb-2">
                  الصق هذا الإعداد في ملف <code className="text-emerald-400">claude_desktop_config.json</code> أو إعدادات MCP في Cursor / Windsurf:
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 overflow-auto">
                  <pre className="text-emerald-400 font-mono text-[11px]" dir="ltr">
                    {clientConfigJson}
                  </pre>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-slate-200 mb-2">استدعاء عبر cURL للاختبار السريع</h4>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 overflow-auto">
                  <pre className="text-slate-300 font-mono text-[10px]" dir="ltr">
{`curl -X POST http://localhost:3000/api/tools/execute \\
  -H "Authorization: Bearer ${authToken}" \\
  -H "Content-Type: application/json" \\
  -d '{"toolName":"verify_calculation","args":{"operation_type":"gcd_lcm","parameters":{"a":48,"b":36}}}'`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Moroccan Math MCP Server • المنهاج المغربي للرياضيات • إصدار مستقل للاختبار والنشر</span>
          <span className="font-mono text-slate-400">Model Context Protocol 2024-2025</span>
        </div>
      </footer>
    </div>
  );
}
