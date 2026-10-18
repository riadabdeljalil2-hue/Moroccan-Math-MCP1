import type { MoroccanLesson, MathDomain } from '../types.ts';
import goldPackData from '../data/morocco-math-1ac-gold.json' with { type: 'json' };

export function load1ACGoldLessons(): MoroccanLesson[] {
  const manifest = goldPackData.manifest;
  const units = (goldPackData.curriculum?.units || []) as any[];
  const lessons: MoroccanLesson[] = [];

  const domainMap: Record<string, MathDomain> = {
    'unit-math-1ac-ops': 'arithmetic',
    'unit-math-1ac-developpement': 'algebra',
    'unit-math-1ac-mediatrice': 'geometry',
    'unit-math-1ac-triangle': 'geometry',
    'unit-math-1ac-angles': 'geometry'
  };

  for (const unit of units) {
    const domain = domainMap[unit.id] || 'algebra';
    const semester = unit.orderIndex <= 3 ? 1 : 2;

    for (const les of unit.lessons || []) {
      const lessonObj = les as any;
      // Extract Arabic and French titles
      let titleAr = lessonObj.title || '';
      let titleFr = '';
      if (titleAr.includes('(') && titleAr.includes(')')) {
        const parts = titleAr.split('(');
        titleAr = parts[0].trim();
        titleFr = parts[1].replace(')', '').trim();
      }

      const skillsFormatted = (lessonObj.skills || []).map((s: any) =>
        s.description ? `${s.name}: ${s.description}` : s.name
      );

      lessons.push({
        id: lessonObj.id,
        code: `1AC-${domain.toUpperCase().slice(0, 3)}-0${unit.orderIndex}`,
        level: '1AC',
        cycle: 'college',
        domain,
        titleAr,
        titleFr: titleFr || titleAr,
        semester,
        objectives: lessonObj.learningObjectives || [],
        prerequisites: lessonObj.prerequisites || [
          'العمليات الأساسية الأربع على الأعداد الصحيحة والعشرية',
          'الهندسة المستوية الأساسية'
        ],
        targetedSkills: skillsFormatted.length > 0 ? skillsFormatted : [
          'تطبيق القواعد والخاصيات الرياضية في الحساب والبرهان الهندسي'
        ],
        isPilotData: false, // Official Gold Standard
        reference: {
          sourceName: manifest.title,
          officialDocument: manifest.packId,
          status: 'official_curriculum',
          noteAr: manifest.description,
          noteFr: 'Pack Gold Standard officiel pour la 1ère Année Collégiale (1AC).'
        },
        concepts: lessonObj.concepts || [],
        commonMistakes: lessonObj.commonMistakes || [],
        examples: lessonObj.examples || [],
        curriculumPackId: manifest.packId
      });
    }
  }

  return lessons;
}
