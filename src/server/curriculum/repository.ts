import type { MoroccanLesson, MoroccanEducationLevel } from '../types.ts';
import { PILOT_MOROCCAN_LESSONS } from './pilotData.ts';
import { load1ACGoldLessons } from './goldPackLoader.ts';

export interface CurriculumFilterOptions {
  level?: MoroccanEducationLevel | string;
  semester?: 1 | 2;
  domain?: string;
  pilotOnly?: boolean;
}

export interface CurriculumSummary {
  systemName: string;
  country: string;
  version: string;
  isPilotBaseline: boolean;
  totalLessonsLoaded: number;
  levelsCovered: {
    levelId: string;
    levelNameAr: string;
    levelNameFr: string;
    cycle: string;
    lessonCount: number;
    lessons: { id: string; titleAr: string; titleFr: string; code: string; isOfficial?: boolean }[];
  }[];
  officialNoticeAr: string;
  officialNoticeFr: string;
  goldPacksActive: string[];
}

export interface SearchLessonsResult {
  query: string;
  totalMatches: number;
  lessons: (MoroccanLesson & { matchScore: number; matchReasons: string[] })[];
  curriculumContext: {
    datasetStatus: 'hybrid_official_and_pilot';
    dataSource: string;
    disclaimerAr: string;
    disclaimerFr: string;
  };
}

export interface ICurriculumProvider {
  getCurriculumSummary(filter?: CurriculumFilterOptions): Promise<CurriculumSummary>;
  searchLessons(query: string, options?: { level?: string; language?: 'ar' | 'fr' | 'all' }): Promise<SearchLessonsResult>;
  getLessonById(lessonId: string): Promise<MoroccanLesson | null>;
  getAllLessons(): Promise<MoroccanLesson[]>;
}

export class PilotCurriculumRepository implements ICurriculumProvider {
  private lessons: MoroccanLesson[];

  constructor(initialLessons?: MoroccanLesson[]) {
    if (initialLessons) {
      this.lessons = initialLessons;
    } else {
      // Merge official 1AC Gold Standard Pack with pilot lessons for other levels
      const gold1AC = load1ACGoldLessons();
      this.lessons = [...gold1AC, ...PILOT_MOROCCAN_LESSONS];
    }
  }

  async getCurriculumSummary(filter?: CurriculumFilterOptions): Promise<CurriculumSummary> {
    let filtered = [...this.lessons];

    if (filter?.level) {
      const normalizedLevel = filter.level.trim().toUpperCase();
      filtered = filtered.filter(l => l.level.toUpperCase() === normalizedLevel);
    }
    if (filter?.semester) {
      filtered = filtered.filter(l => l.semester === filter.semester);
    }
    if (filter?.domain) {
      filtered = filtered.filter(l => l.domain.toLowerCase() === filter.domain?.toLowerCase());
    }

    const levelDescriptions: Record<string, { ar: string; fr: string; cycle: string }> = {
      '1AC': {
        ar: 'السنة الأولى ثانوي إعدادي (الحزمة الذهبية الرسمية المعتمدة - مسار عام ودولي)',
        fr: '1ère Année Collégiale (1AC - Pack Gold Standard)',
        cycle: 'college'
      },
      '3APIC': {
        ar: 'السنة الثالثة ثانوي إعدادي (دورة عادية ودولية)',
        fr: '3ème Année Collégiale',
        cycle: 'college'
      },
      'TCS': {
        ar: 'الجذع المشترك العلمي والتكنولوجي',
        fr: 'Tronc Commun Scientifique et Technologique',
        cycle: 'lycee_qualifiant'
      },
      '1BAC_SM': {
        ar: 'السنة الأولى من سلك البكالوريا - مسلك العلوم الرياضية',
        fr: '1ère Année Baccalauréat - Sciences Mathématiques',
        cycle: 'lycee_qualifiant'
      },
      '1BAC_EXP': {
        ar: 'السنة الأولى من سلك البكالوريا - مسلك العلوم التجريبية',
        fr: '1ère Année Baccalauréat - Sciences Expérimentales',
        cycle: 'lycee_qualifiant'
      },
      '2BAC_SM': {
        ar: 'السنة الثانية من سلك البكالوريا - مسلك العلوم الرياضية (أ و ب)',
        fr: '2ème Année Baccalauréat - Sciences Mathématiques (A et B)',
        cycle: 'lycee_qualifiant'
      },
      '2BAC_PC_SVT': {
        ar: 'السنة الثانية من سلك البكالوريا - مسلك العلوم التجريبية (PC / SVT)',
        fr: '2ème Année Baccalauréat - Sciences Physiques / SVT',
        cycle: 'lycee_qualifiant'
      }
    };

    const groupedMap = new Map<string, MoroccanLesson[]>();
    for (const lesson of filtered) {
      if (!groupedMap.has(lesson.level)) {
        groupedMap.set(lesson.level, []);
      }
      groupedMap.get(lesson.level)!.push(lesson);
    }

    const levelsCovered = Array.from(groupedMap.entries()).map(([levelKey, items]) => {
      const desc = levelDescriptions[levelKey] || {
        ar: levelKey,
        fr: levelKey,
        cycle: items[0]?.cycle || 'lycee_qualifiant'
      };
      return {
        levelId: levelKey,
        levelNameAr: desc.ar,
        levelNameFr: desc.fr,
        cycle: desc.cycle,
        lessonCount: items.length,
        lessons: items.map(i => ({
          id: i.id,
          code: i.code,
          titleAr: i.titleAr,
          titleFr: i.titleFr,
          isOfficial: !i.isPilotData
        }))
      };
    });

    return {
      systemName: 'المنهاج المغربي للرياضيات (Moroccan Mathematics Curriculum)',
      country: 'المملكة المغربية (Kingdom of Morocco)',
      version: '1.2.0-gold-hybrid',
      isPilotBaseline: false, // Now powered by official 1AC Gold Pack + pilot baseline
      totalLessonsLoaded: filtered.length,
      levelsCovered,
      officialNoticeAr:
        'المستوى 1AC مزود بالحزمة الذهبية الرسمية المكتملة (MOROCCO-MATH-1AC-GOLD-v1) مع المفاهيم والتمثلات والأخطاء الشائعة، بينما بقية المستويات مزودة بعينات تجريبية موثقة.',
      officialNoticeFr:
        'Le niveau 1AC intègre le Pack Gold Standard officiel (MOROCCO-MATH-1AC-GOLD-v1) avec concepts didactiques et remédiation des erreurs, complété par des données pilotes pour les autres niveaux.',
      goldPacksActive: ['MOROCCO-MATH-1AC-GOLD-v1']
    };
  }

  async searchLessons(
    query: string,
    options?: { level?: string; language?: 'ar' | 'fr' | 'all' }
  ): Promise<SearchLessonsResult> {
    const rawQuery = query.trim().toLowerCase();
    const cleanTokens = rawQuery
      .replace(/[،,.\-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);

    const matches: (MoroccanLesson & { matchScore: number; matchReasons: string[] })[] = [];

    for (const lesson of this.lessons) {
      if (options?.level && options.level.trim().toUpperCase() !== 'ALL') {
        if (lesson.level.toUpperCase() !== options.level.trim().toUpperCase()) {
          continue;
        }
      }

      let score = 0;
      const reasons: string[] = [];

      const titleArNorm = lesson.titleAr.toLowerCase();
      const titleFrNorm = lesson.titleFr.toLowerCase();
      const codeNorm = lesson.code.toLowerCase();

      // Exact substring match in titles
      if (titleArNorm.includes(rawQuery)) {
        score += 50;
        reasons.push('تطابق مباشر في العنوان العربي');
      }
      if (titleFrNorm.includes(rawQuery)) {
        score += 50;
        reasons.push('Correspondance directe dans le titre français');
      }
      if (codeNorm.includes(rawQuery) || lesson.id.toLowerCase().includes(rawQuery)) {
        score += 40;
        reasons.push('تطابق كود أو معرف الدرس');
      }

      // Check concepts (definitions, keywords)
      if (lesson.concepts) {
        for (const cpt of lesson.concepts) {
          if (cpt.name.toLowerCase().includes(rawQuery)) {
            score += 35;
            reasons.push(`تطابق مباشر في المفهوم الرياضي ("${cpt.name}")`);
          }
          if (cpt.formalDefinition.toLowerCase().includes(rawQuery)) {
            score += 25;
            reasons.push(`تطابق في التعريف الرسمي للمفهوم ("${cpt.name}")`);
          }
          if (cpt.keywords?.some(k => k.toLowerCase().includes(rawQuery))) {
            score += 20;
            reasons.push(`تطابق في الكلمات المفتاحية للمفهوم ("${cpt.name}")`);
          }
        }
      }

      // Check common mistakes (didactics)
      if (lesson.commonMistakes) {
        for (const mst of lesson.commonMistakes) {
          if (mst.mistakeDescription.toLowerCase().includes(rawQuery)) {
            score += 30;
            reasons.push('تطابق في تشخيص التمثلات والأخطاء الشائعة للتلاميذ');
          }
          if (mst.howToCorrect && mst.howToCorrect.toLowerCase().includes(rawQuery)) {
            score += 25;
            reasons.push('تطابق في استراتيجية التصحيح الديداكتيكي للخطأ');
          }
        }
      }

      // Token matches in objectives, skills, prerequisites
      for (const token of cleanTokens) {
        if (titleArNorm.includes(token)) score += 15;
        if (titleFrNorm.includes(token)) score += 15;

        const objMatchAr = lesson.objectives.some(o => o.toLowerCase().includes(token));
        if (objMatchAr) {
          score += 10;
          reasons.push(`تطابق في أهداف الدرس ("${token}")`);
        }

        const skillMatch = lesson.targetedSkills.some(s => s.toLowerCase().includes(token));
        if (skillMatch) {
          score += 12;
          reasons.push(`تطابق في الكفايات والمهارات المستهدفة ("${token}")`);
        }

        const prereqMatch = lesson.prerequisites.some(p => p.toLowerCase().includes(token));
        if (prereqMatch) {
          score += 8;
          reasons.push(`تطابق في المكتسبات القبلية ("${token}")`);
        }
      }

      if (score > 0) {
        matches.push({
          ...lesson,
          matchScore: score,
          matchReasons: Array.from(new Set(reasons))
        });
      }
    }

    // Sort by descending match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      query,
      totalMatches: matches.length,
      lessons: matches,
      curriculumContext: {
        datasetStatus: 'hybrid_official_and_pilot',
        dataSource: 'المنهاج المغربي للرياضيات - الحزمة الذهبية الرسمية 1AC + عينات تجريبية',
        disclaimerAr: 'دروس السنة الأولى إعدادي معتمدة رسمياً ومرفقة بالتمثلات الخاطئة، وبقية المستويات عينات تجريبية موثقة.',
        disclaimerFr: 'Les leçons 1AC sont officielles (Gold Pack), les autres niveaux sont des données pilotes conformes.'
      }
    };
  }

  async getLessonById(lessonId: string): Promise<MoroccanLesson | null> {
    const norm = lessonId.trim().toLowerCase();
    const found = this.lessons.find(l => l.id.toLowerCase() === norm || l.code.toLowerCase() === norm);
    return found || null;
  }

  async getAllLessons(): Promise<MoroccanLesson[]> {
    return [...this.lessons];
  }
}

// Default singleton repository instance
export const defaultCurriculumRepository = new PilotCurriculumRepository();
