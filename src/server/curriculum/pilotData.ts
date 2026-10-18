import type { MoroccanLesson } from '../types.ts';

/**
 * Pilot Data for Moroccan Mathematics Curriculum
 * All entries are explicitly tagged with `isPilotData: true` and documented.
 * This baseline is structured to be seamlessly replaced with an external database/knowledge base
 * without altering public tool schemas or contracts.
 */
export const PILOT_MOROCCAN_LESSONS: MoroccanLesson[] = [
  // 3ème Année Collège (3APIC)
  {
    id: '3apic-pythagore',
    code: '3APIC-GEO-01',
    level: '3APIC',
    cycle: 'college',
    domain: 'geometry',
    titleAr: 'مبرهنة فيثاغورس',
    titleFr: 'Théorème de Pythagore',
    semester: 1,
    objectives: [
      'حساب أطوال أضلاع مثلث قائم الزاوية باستعمال المبرهنة المباشرة',
      'إثبات تعامد مستقيمين باستعمال المبرهنة العكسية لفيثاغورس',
      'Calculer la longueur d\'un côté dans un triangle rectangle (théorème direct)',
      'Démontrer qu\'un triangle est rectangle en utilisant la réciproque du théorème de Pythagore'
    ],
    prerequisites: [
      'المثلث القائم الزاوية والدائرة المحيطة به',
      'مربع عدد حقيقي وجذره المربع',
      'Triangle rectangle, carré d\'un nombre et racine carrée'
    ],
    targetedSkills: [
      'تطبيق مبرهنة فيثاغورس المباشرة لحساب الوتر أو ضلع الزاوية القائمة',
      'تطبيق المبرهنة العكسية لفيثاغورس للتحقق من التعامد',
      'Calcul de longueurs géométriques',
      'Vérification de l\'orthogonalité'
    ],
    isPilotData: true,
    reference: {
      sourceName: 'التوجيهات التربوية الخاصة بمادة الرياضيات بسلك التعليم الثانوي الإعدادي - وزارة التربية الوطنية',
      officialDocument: 'Orientation Pédagogique Collège - Mathématiques (Maroc)',
      status: 'pilot_data',
      noteAr: 'بيانات تجريبية موثقة وفق التوجيهات الرسمية للثالثة إعدادي (المغرب) لأغراض الاختبار والتطوير.',
      noteFr: 'Données pilotes conformes aux orientations pédagogiques officielles du collège (Maroc).'
    }
  },
  {
    id: '3apic-systemes',
    code: '3APIC-ALG-02',
    level: '3APIC',
    cycle: 'college',
    domain: 'algebra',
    titleAr: 'نظمات معادلتين من الدرجة الأولى بمجهولين',
    titleFr: 'Systèmes de deux équations du premier degré à deux inconnues',
    semester: 2,
    objectives: [
      'حل نظمة معادلتين من الدرجة الأولى بمجهولين جبرياً بطريقة التعويض وطريقة التأليفة الخطية',
      'حل نظمة هندسياً بتحديد نقطة تقاطع مستقيمين',
      'ترييض وضعيات ومسائل من الحياة اليومية وحلها بواسطة نظمة',
      'Résoudre algébriquement un système par substitution et par combinaison linéaire',
      'Résoudre graphiquement un système d\'équations'
    ],
    prerequisites: [
      'معادلة من الدرجة الأولى بمجهول واحد',
      'المعادلة المختصرة لمستقيم والتمثيل المبياني في المعلم',
      'Équations du premier degré à une inconnue, équation réduite d\'une droite'
    ],
    targetedSkills: [
      'حل النظمات جبرياً (التعويض والتأليفة الخطية)',
      'تفسير الحلول هندسياً ومبيانياً',
      'ترييض مسألة وصياغتها في شكل نظمة',
      'Résolution algébrique et graphique de systèmes 2x2'
    ],
    isPilotData: true,
    reference: {
      sourceName: 'المنهاج المغربي للثانوي الإعدادي - السنة الثالثة إعدادي مسار دولي وعام',
      officialDocument: 'Programme officiel 3APIC - Ministère de l\'Éducation Nationale',
      status: 'pilot_data',
      noteAr: 'بيانات تجريبية لدرس النظمات لتقييم توليد التمارين والحلول المرجعية.',
      noteFr: 'Données pilotes pour la résolution de systèmes 2x2.'
    }
  },
  {
    id: '3apic-thales',
    code: '3APIC-GEO-03',
    level: '3APIC',
    cycle: 'college',
    domain: 'geometry',
    titleAr: 'مبرهنة طاليس',
    titleFr: 'Théorème de Thalès',
    semester: 1,
    objectives: [
      'استعمال مبرهنة طاليس المباشرة لحساب المسافات في تكوينين أساسيين (مثلث متداخل، تكوين الفراشة)',
      'استعمال مبرهنة طاليس العكسية للبرهان على توازي مستقيمين',
      'Calculer des distances en utilisant le théorème de Thalès direct',
      'Démontrer le parallélisme de deux droites par la réciproque de Thalès'
    ],
    prerequisites: [
      'التناسبية والكسور المتكافئة',
      'المستقيمات المتوازية والمتقاطعة',
      'Proportionnalité, droites parallèles'
    ],
    targetedSkills: [
      'حساب أطوال مجهولة بتطبيق تناسبية الأضلاع',
      'إثبات التوازي باستعمال الترتيب وتساوي النسب',
      'Application de Thalès direct et réciproque'
    ],
    isPilotData: true,
    reference: {
      sourceName: 'المقرر الرسمي للثالثة إعدادي - وزارة التربية الوطنية والتعليم الأولي والرياضة',
      status: 'pilot_data',
      noteAr: 'بيانات تجريبية لدرس مبرهنة طاليس.',
      noteFr: 'Données pilotes du théorème de Thalès.'
    }
  },

  // Tronc Commun Scientifique (TCS)
  {
    id: 'tcs-arithmetique',
    code: 'TCS-ARITH-01',
    level: 'TCS',
    cycle: 'lycee_qualifiant',
    domain: 'arithmetic',
    titleAr: 'مبادئ في الحسابيات في مجموعة الأعداد الصحيحة الطبيعية',
    titleFr: 'Notions d\'arithmétique dans l\'ensemble des entiers naturels (N)',
    semester: 1,
    objectives: [
      'التعرف على الأعداد الزوجية والفردية ومضاعفات وقواسم عدد',
      'القسمة الإقليدية في مجموعة الأعداد الطبيعية N',
      'تفكيك الأعداد إلى جداء عوامل أولية وحساب PGCD وPPCM',
      'Divisibilité, nombres pairs et impairs, décomposition en facteurs premiers',
      'Calcul du PGCD et du PPCM'
    ],
    prerequisites: [
      'قواعد الحساب في مجموعة الأعداد الصحيحة الطبيعية',
      'معايير القابلية للقسمة على 2، 3، 5، 9',
      'Opérations dans N, critères de divisibilité'
    ],
    targetedSkills: [
      'حساب القاسم المشترك الأكبر PGCD باستعمال خوارزمية إقليدس والتفكيك',
      'حساب المضاعف المشترك الأصغر PPCM',
      'دراسة زوجية تعبير رياضي في N',
      'Calcul de PGCD, PPCM et division euclidienne'
    ],
    isPilotData: true,
    reference: {
      sourceName: 'التوجيهات التربوية الخاصة بمادة الرياضيات بسلك التعليم الثانوي التأهيلي - الجذع المشترك العلمي',
      officialDocument: 'Programme officiel TCS - Mathématiques',
      status: 'pilot_data',
      noteAr: 'بيانات تجريبية لدرس الحسابيات في N للجذع المشترك العلمي.',
      noteFr: 'Données pilotes d\'arithmétique dans N pour Tronc Commun Scientifique.'
    }
  },
  {
    id: 'tcs-second-degre',
    code: 'TCS-ALG-02',
    level: 'TCS',
    cycle: 'lycee_qualifiant',
    domain: 'algebra',
    titleAr: 'المعادلات والمتراجحات والنظمات من الدرجة الثانية',
    titleFr: 'Équations, inéquations et systèmes du second degré à une inconnue',
    semester: 1,
    objectives: [
      'حل معادلة من الدرجة الثانية بمجهول واحد باستعمال مميز ثلاثية الحدود (دلتا)',
      'تحديد إشارة ثلاثية الحدود من الدرجة الثانية وحل المتراجحات',
      'تعميل ثلاثية حدود بمعرفة جذورها',
      'Résoudre ax² + bx + c = 0 à l\'aide du discriminant Delta',
      'Étudier le signe du trinôme et résoudre les inéquations du second degré'
    ],
    prerequisites: [
      'المتطابقات الهامة والحساب الحرفي',
      'المعادلات من الدرجة الأولى وجدول الإشارات',
      'Identités remarquables, tableau de signes'
    ],
    targetedSkills: [
      'حساب المميز دلتا واستنتاج وجود وعدد وطبيعة الجذور',
      'تعميل ثلاثية حدود وحل المتراجحات',
      'حساب مجموع وجداء جذري ثلاثية حدود',
      'Résolution d\'équations et inéquations du 2nd degré'
    ],
    isPilotData: true,
    reference: {
      sourceName: 'المنهاج المغربي للجذع المشترك العلمي والتكنولوجي',
      officialDocument: 'Curriculum Mathématiques TCS Maroc',
      status: 'pilot_data',
      noteAr: 'بيانات تجريبية لمعادلات الدرجة الثانية وحساب المميز دلتا.',
      noteFr: 'Données pilotes pour le second degré et discriminant.'
    }
  },
  {
    id: 'tcs-fonctions',
    code: 'TCS-ANA-03',
    level: 'TCS',
    cycle: 'lycee_qualifiant',
    domain: 'analysis',
    titleAr: 'عموميات حول الدوال العددية',
    titleFr: 'Généralités sur les fonctions numériques',
    semester: 2,
    objectives: [
      'تحديد مجموعة تعريف دالة عددية لمختلف الحالات (حدودية، جذرية، لاجذرية)',
      'دراسة زوجية دالة (زوجية، فردية) وتأويلها الهندسي كتماثل محوري أو مركزي',
      'دراسة رتابة دالة ومعدل التغير',
      'Déterminer l\'ensemble de définition d\'une fonction numérique',
      'Étudier la parité et les variations d\'une fonction'
    ],
    prerequisites: [
      'المجالات والترتيب في R',
      'المعالم في المستوى والتمثيل المبياني',
      'Intervalles et ordre dans R'
    ],
    targetedSkills: [
      'تحديد مجموعة تعريف دالة كسرية أو لاجذرية بدقة',
      'إثبات أن دالة زوجية أو فردية',
      'قراءة وتحديد جدول التغيرات والمطاريف',
      'Détermination du domaine de définition et parité'
    ],
    isPilotData: true,
    reference: {
      sourceName: 'التوجيهات التربوية للجذع المشترك العلمي - وزارة التربية الوطنية',
      status: 'pilot_data',
      noteAr: 'بيانات تجريبية لدرس الدوال العددية ومجموعة التعريف.',
      noteFr: 'Données pilotes pour l\'étude des fonctions au Tronc Commun.'
    }
  },

  // 1ère Année Baccalauréat Sciences Mathématiques (1BAC_SM)
  {
    id: '1bacsm-logique',
    code: '1BAC-LOG-01',
    level: '1BAC_SM',
    cycle: 'lycee_qualifiant',
    domain: 'algebra',
    titleAr: 'مبادئ في المنطق الرياضي',
    titleFr: 'Notions de logique mathématique',
    semester: 1,
    objectives: [
      'التعرف على العبارات والدوال العبارية واستعمال المكممات (الوجودي والكوني)',
      'العمليات المنطقية: النفي، العطف، الفصل، الاستلزام، التكافؤ وقوانين مورغان',
      'التمكن من أنماط الاستدلال: الاستدلال بالخلف، بفصل الحالات، بالاستلزام المضاد للعكس، وبالترجع',
      'Maîtrise des connecteurs logiques et des quantificateurs',
      'Types de raisonnement: par l\'absurde, par disjonction de cas, par contraposée, par récurrence'
    ],
    prerequisites: [
      'المجموعات والعمليات الجبرية الأساسية',
      'البرهان الرياضي في الجذع المشترك',
      'Ensembles et opérations algébriques'
    ],
    targetedSkills: [
      'صياغة نفي عبارة معرفة بمكممات',
      'البرهان بالاستلزام المضاد للعكس (la contraposée)',
      'البرهان بالترجع على خاصيات معرفة في N',
      'Raisonnement par récurrence et par contraposition'
    ],
    isPilotData: true,
    reference: {
      sourceName: 'البرنامج الرسمي للأولى بكالوريا علوم رياضية - المغرب',
      officialDocument: 'Programme 1ère Bac Sciences Mathématiques',
      status: 'pilot_data',
      noteAr: 'بيانات تجريبية لدرس المنطق الرياضي وأنماط الاستدلال للأولى باك علوم رياضية.',
      noteFr: 'Données pilotes de logique mathématique pour 1ère Bac Sciences Maths.'
    }
  },

  // 2ème Année Baccalauréat Sciences Mathématiques / Expérimentales (2BAC_SM / 2BAC_PC_SVT)
  {
    id: '2bac-limites-continuite',
    code: '2BAC-ANA-01',
    level: '2BAC_PC_SVT',
    cycle: 'lycee_qualifiant',
    domain: 'analysis',
    titleAr: 'الاتصال والنهايات',
    titleFr: 'Continuité et limites',
    semester: 1,
    objectives: [
      'دراسة اتصال دالة في نقطة وعلى مجال وتحديد صورة مجال بدالة متصلة',
      'تطبيق مبرهنة القيم الوسيطية (TVI) وإثبات وجود ووحدانية حلول المعادلات',
      'مبرهنة الدالة العكسية لدالة متصلة ورتيبة قطعاً والدوال الجذرية من الرتبة n',
      'Continuité en un point et sur un intervalle, image d\'un intervalle',
      'Théorème des valeurs intermédiaires (TVI), fonction réciproque'
    ],
    prerequisites: [
      'نهايات الدوال العددية والعمليات عليها والأشكال غير المحددة',
      'الترتيب ومجالات الأعداد الحقيقية',
      'Limites et formes indéterminées en 1ère Bac'
    ],
    targetedSkills: [
      'إزالة الأشكال غير المحددة في النهايات (الضرب في المرافق، التعميل، التأطير)',
      'البرهان على وجود حل لمعادلة f(x)=0 باستعمال مبرهنة القيم الوسيطية',
      'تحديد تعبير الدالة العكسية f⁻¹ ومجموعة تعريفها',
      'Application du TVI et détermination de la bijection réciproque'
    ],
    isPilotData: true,
    reference: {
      sourceName: 'الأطر المرجعية للامتحان الوطني الموحد للبكالوريا - وزارة التربية الوطنية',
      officialDocument: 'Cadre de référence examen national Baccalauréat Maroc',
      status: 'pilot_data',
      noteAr: 'بيانات تجريبية لدرس الاتصال والنهايات وفق الإطار المرجعي للامتحان الوطني للبكالوريا.',
      noteFr: 'Données pilotes de continuité conformes au cadre de référence du Baccalauréat marocain.'
    }
  },
  {
    id: '2bac-nombres-complexes',
    code: '2BAC-CPLX-02',
    level: '2BAC_SM',
    cycle: 'lycee_qualifiant',
    domain: 'complex_numbers',
    titleAr: 'الأعداد العقدية',
    titleFr: 'Nombres complexes',
    semester: 1,
    objectives: [
      'الحساب الجبري في المجموعة C والكتابة الجبرية والمرافق ومعيار عدد عقدي',
      'الشكل المثلثي والشكل الأسي وصيغة موافر وصيغتا أولير',
      'حل المعادلات من الدرجة الثانية بمعاملات حقيقية في C',
      'التطبيقات الهندسية للأعداد العقدية (المسافة، الزوايا، الاستقامية، التحويلات الاعتيادية)',
      'Forme algébrique, trigonométrique et exponentielle, formule de Moivre et d\'Euler',
      'Résolution d\'équations du second degré dans C et applications géométriques'
    ],
    prerequisites: [
      'الحسابيات وعلم المثلثات في المستوى',
      'المتجهات والجداء السلمي والتحويلات الهندسية (الإزاحة، التحاكي، الدوران)',
      'Trigonométrie et géométrie plane'
    ],
    targetedSkills: [
      'الانتقال بين الشكل الجبري والشكل المثلثي والشكل الأسي',
      'حل معادلات الدرجة الثانية في C بحساب المميز دلتا',
      'حساب عمدة عدد عقدي وتأويله كقياس لزاوية موجهة',
      'Calcul du module, argument et résolution dans C'
    ],
    isPilotData: true,
    reference: {
      sourceName: 'المنهاج الرسمي للثانية بكالوريا علوم رياضية وعلوم تجريبية - المغرب',
      officialDocument: 'Programme officiel 2BAC - Mathématiques Maroc',
      status: 'pilot_data',
      noteAr: 'بيانات تجريبية لدرس الأعداد العقدية للاختبار والتحقق.',
      noteFr: 'Données pilotes de nombres complexes pour le Baccalauréat.'
    }
  }
];
