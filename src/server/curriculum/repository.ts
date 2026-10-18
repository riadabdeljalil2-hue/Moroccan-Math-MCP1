import { MoroccanLesson, MoroccanEducationLevel } from '../types.ts';
import { PILOT_MOROCCAN_LESSONS } from './pilotData.ts';

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
    lessons: { id: string; titleAr: string; titleFr: string; code: string }[];
  }[];
  officialNoticeAr: string;
  officialNoticeFr: string;
}

export interface SearchLessonsResult {
  query: string;
  totalMatches: number;
  lessons: (MoroccanLesson & { matchScore: number; matchReasons: string[] })[];
  curriculumContext: {
    datasetStatus: 'pilot_data';
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

  constructor(initialLessons: MoroccanLesson[] = PILOT_MOROCCAN_LESSONS) {
    this.lessons = initialLessons;
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
          titleFr: i.titleFr
        }))
      };
    });

    return {
      systemName: 'المنهاج المغربي للرياضيات (Moroccan Mathematics Curriculum)',
      country: 'المملكة المغربية (Kingdom of Morocco)',
      version: '1.0.0-pilot',
      isPilotBaseline: true,
      totalLessonsLoaded: filtered.length,
      levelsCovered,
      officialNoticeAr: 'تنبيه منهاجي: هذه البيانات تمثل عينة تجريبية (Pilot Data) موثقة ومطابقة لتوجيهات وزارة التربية الوطنية والتعليم الأولي والرياضة المغربية لأغراض الاختبار وتطوير الأدوات.',
      officialNoticeFr: 'Avis officiel: ces données représentent un échantillon pilote (Pilot Data) conforme aux orientations pédagogiques officielles du Ministère de l\'Éducation Nationale du Maroc.'
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
        datasetStatus: 'pilot_data',
        dataSource: 'المنهاج المغربي للرياضيات - عينة تجريبية موثقة (Moroccan Curriculum Pilot Dataset)',
        disclaimerAr: 'جميع الدروس والبيانات المسترجعة موسومة بأنها تجريبية ومأخوذة من الأطر المرجعية والتوجيهات الرسمية.',
        disclaimerFr: 'Toutes les leçons renvoyées sont étiquetées comme données pilotes issues des cadres de référence officiels.'
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
