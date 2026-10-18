# Moroccan Math MCP Server 🇲🇦📐
### خادم Model Context Protocol موثوق ومستقل لأدوات الرياضيات وفق المنهاج المغربي

مشروع مستقل متوافق مع مواصفة **Model Context Protocol (MCP)** الرسمية، يهدف إلى تزويد نماذج الذكاء الاصطناعي والعملاء بأدوات حسابية ومنهاجية موثوقة مطابقة للمنهاج المغربي لمادة الرياضيات، مع دعم النقل عبر **Streamable HTTP** وإمكانية النشر المجاني المباشر على **Vercel**.

---

## ✨ الأدوات الأربع المعتمدة (MCP Tools)

### 1. `list_curriculum`
- **الوظيفة**: يعرض المستويات والدروس الرياضية المتوفرة حالياً في المنهاج المغربي مع بيان حالتها التجريبية وكفاياتها ومصادرها.
- **المعاملات**:
  - `level_filter` (اختياري): تصفية حسب المستوى (`3APIC`, `TCS`, `1BAC_SM`, `2BAC_SM`, `2BAC_PC_SVT`).
  - `domain_filter` (اختياري): تصفية حسب المجال (`arithmetic`, `algebra`, `geometry`, `analysis`, `trigonometry`, `complex_numbers`).
  - `semester` (اختياري): `1` أو `2`.

### 2. `search_lessons`
- **الوظيفة**: يبحث عن درس بالعربية أو الفرنسية ويعيد بياناته، مكتسباته القبلية، كفاياته المستهدفة، ومصدره الرسمي.
- **المعاملات**:
  - `query` (إلزامي): كلمة البحث (مثال: `"فيثاغورس"`, `"systèmes"`, `"الحسابيات"`, `"limites"`).
  - `level` (اختياري): حصر البحث في مستوى محدد.
  - `language` (اختياري): `'ar'` أو `'fr'` أو `'all'`.

### 3. `verify_calculation`
- **الوظيفة**: يتحقق من العمليات العددية والجبرية المدعومة خطوة بخطوة مع توضيح حدود التحقق الصريحة وعدم ادعاء إثبات براهين عامة.
- **العمليات المدعومة**:
  - `arithmetic`: العمليات الحسابية مع الأسبقية والقوى والأقواس.
  - `fraction`: تبسيط الكسور وجمعها وطرحها وضربها وقسمتها مع حساب PGCD.
  - `gcd_lcm`: خوارزمية إقليدس لـ PGCD و PPCM مع جدول البواقي.
  - `quadratic_equation`: معادلات $ax^2 + bx + c = 0$ ومميز دلتا $\Delta$ والجذور في $\mathbb{R}$ و $\mathbb{C}$.
  - `linear_system_2x2`: نظمات خطية 2x2 ومحددات كرامر وحالات التطابق أو التوازي.
  - `modular_arithmetic`: التطابقات في $\mathbb{Z}$ والقسمة الإقليدية بالترديد $a \pmod m$.
- **تنبيه حدود التحقق**:
  > التحقق محصور في الحسابات الرياضية العددية والجبرية المدعومة فقط. لا تدعي الأداة إثبات براهين هندسية أو نظريات مجردة عامة دون مدخلات عددية مضبوطة.

### 4. `generate_exercises`
- **الوظيفة**: يولّد تمارين رياضية وفق درس محدد في المنهاج وصعوبة معينة (`easy`, `medium`, `hard`)، مع حلول مرجعية قابلة للاختبار الآلي، مع تمييز صريح للمحتوى التجريبي (`PILOT_EXPERIMENTAL_DATA`).
- **المعاملات**:
  - `lesson_id` (إلزامي): مثل `3apic-pythagore`, `3apic-systemes`, `tcs-arithmetique`, `tcs-second-degre`, `2bac-limites-continuite`.
  - `skill` (اختياري): كفاية رياضية محددة.
  - `difficulty` (اختياري): `easy` | `medium` | `hard`.
  - `count` (اختياري): من 1 إلى 5.

---

## 🔒 المصادقة والأمان (Security & Authentication)

لحماية الخادم المنشور على الإنترنت ومنع الاستخدام العام غير المصرح به:
- يُشترط تزويد ترويسة المصادقة:
  ```http
  Authorization: Bearer <MCP_API_KEY>
  ```
  أو عبر الترويسة:
  ```http
  x-api-key: <MCP_API_KEY>
  ```
- يتم ضبط المتغير السري في بيئة الاستضافة عبر: `MCP_API_KEY`.
- يتضمن الخادم مقارنة آمنة للرموز ضد هجمات التوقيت (Timing Attacks).

---

## 🚀 النشر على Vercel (مجاناً - Hobby Tier)

المشروع مُهيأ بالكامل للنشر على Vercel عبر ملفي `vercel.json` و `api/index.ts`.

### 1. خطوات النشر عبر Vercel CLI
```bash
# تثبيت vercel عالمياً إن لم يكن مثبتاً
npm i -g vercel

# النشر
vercel --prod
```

### 2. خطوات النشر عبر GitHub & Vercel Dashboard
1. ادفع المشروع إلى مستودع GitHub جديد.
2. في لوحة تحكم Vercel، اضغط **Add New Project** ثم استورد المستودع.
3. في خانة **Environment Variables**، أضف:
   - الاسم: `MCP_API_KEY`
   - القيمة: مفتاح سري عشوائي من اختيارك (مثال: `moroccan-math-secret-token-xyz`).
4. اضغط **Deploy**.

### 3. نقاط الاتصال بعد النشر
- **Streamable HTTP Endpoint**: `https://<your-app>.vercel.app/mcp`
- **Classic SSE Endpoint**: `https://<your-app>.vercel.app/sse`
- **Health Check**: `https://<your-app>.vercel.app/api/health`

---

## 💻 ربط عملاء MCP (Claude Desktop / Cursor / Windsurf)

أضف الإعداد التالي في ملف إعدادات العميل (مثل `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "moroccan-math": {
      "url": "https://<your-app>.vercel.app/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_MCP_API_KEY>"
      }
    }
  }
}
```

---

## 🧪 تشغيل الاختبارات الآلية محلياً

يحتوي المشروع على حزمة اختبارات آلية تفحص الأدوات الأربع، التحقق الصارم من المدخلات، وحدود التحقق، وتجري اتصالاً حقيقياً لعميل MCP عبر بروتوكول Streamable HTTP:

```bash
# تشغيل جميع الاختبارات (42 فحصاً)
npm test
```

نتائج الفحص: **42/42 فحص ناجح (0 إخفاق)**.

---

## 🏗️ بنية المشروع (Architecture)

```
├── api/
│   └── index.ts               # نقطة دخول Vercel Serverless Function
├── src/
│   ├── server/
│   │   ├── types.ts           # العقود ونماذج البيانات للمنهاج والتحقق
│   │   ├── auth.ts            # مصادقة Bearer Token وحماية الخادم
│   │   ├── curriculum/
│   │   │   ├── pilotData.ts   # بيانات تجريبية للمنهاج المغربي موسومة بصراحة
│   │   │   └── repository.ts  # نمط المستودع ICurriculumProvider القابل للاستبدال
│   │   ├── math/
│   │   │   ├── verifier.ts    # محرك التحقق الحسابي والجبري وحدود التحقق
│   │   │   └── exerciseGenerator.ts # مولد التمارين والحلول المرجعية
│   │   ├── mcp/
│   │   │   ├── server.ts      # تسجيل الأدوات الأربع الرسمية مع Zod Schemas
│   │   │   └── transport.ts   # إدارة نقل Streamable HTTP و SSE
│   │   └── app.ts             # إعداد تطبيق Express والمسارات والتشخيص
│   └── App.tsx                # لوحة تحكم ومفتش المطورين لاختبار الخادم
├── tests/
│   └── runner.ts              # حزمة الاختبارات الآلية الشاملة
├── server.ts                  # خادم Node/Express للتطوير والإنتاج
├── vercel.json                # إعدادات Vercel ودعم التدفق والترويسات
└── package.json
```
