import { Job, Candidate, GuideArticle, SEOKeywordMetric, SEODryRunItem, CommunityJobSubmission, FraudReport } from '../types';

export const SAUDI_CITIES = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'الأحساء',
  'القصيم (بريدة / عنيزة)',
  'خميس مشيط / أبها',
  'تبوك',
  'جازان',
  'نجران',
  'ينبع',
  'الطائف',
  'حائل',
  'الجبيل'
];

export const YEMENI_GOVERNORATES = [
  'صنعاء',
  'تعز',
  'إب',
  'حضرموت (المكلا / سيئون)',
  'عدن',
  'الحديدة',
  'ذمار',
  'حجة',
  'صعدة',
  'شبوة',
  'لحج',
  'أبين',
  'المهرة',
  'عمران',
  'مأرب',
  'البيضاء',
  'الجوف',
  'الضالع',
  'سقطرى',
  'ريمة',
  'المحويت'
];

export const JOB_CATEGORIES = [
  { id: 'all', name: 'جميع التخصصات', icon: 'LayoutGrid' },
  { id: 'sales', name: 'مبيعات وكاشير وخدمة عملاء', icon: 'ShoppingBag' },
  { id: 'restaurants', name: 'مطاعم وكافيهات وطهاة', icon: 'Utensils' },
  { id: 'accounting', name: 'محاسبة ومالية وإدارة', icon: 'Calculator' },
  { id: 'drivers', name: 'سائقين وتوصيل ونقليات', icon: 'Truck' },
  { id: 'technical', name: 'مهن فنية (كهرباء، سباكة، تكييف)', icon: 'Wrench' },
  { id: 'maintenance', name: 'صيانة سيارات وميكانيكا', icon: 'Cog' },
  { id: 'construction', name: 'مقاولات وبناء وتشطيبات', icon: 'Hammer' },
  { id: 'warehousing', name: 'مستودعات وترتيب بضائع', icon: 'Package' },
  { id: 'marketing', name: 'تسويق وإدارة وتصميم رقمي', icon: 'Share2' },
  { id: 'medical', name: 'صيدلة ومجالات طبية مساندة', icon: 'HeartPulse' },
];

export const WHATSAPP_PITCH_TEMPLATES = [
  {
    id: 'experienced',
    title: 'متقدم ذو خبرة سابقة في المجال',
    badge: 'الأكثر استخداماً',
    generateText: (job: Job, applicantName: string, applicantExp: string) => 
      `السلام عليكم ورحمة الله وبركاته،\n` +
      `أستاذي الكريم بخصوص إعلانكم عن وظيفة (${job.title}) لدى (${job.company}) عبر منصة NEXT JOB.\n\n` +
      `معك ${applicantName || 'مقيم يمني بالمملكة'}، لدي خبرة سابقة (${applicantExp || 'عدة سنوات'}) في هذا المجال بالسوق السعودي مع إقامة سارية واستعداد فوري لنقل الخدمات والمباشرة.\n\n` +
      `يسرني إرسال السيرة الذاتية ونماذج الخبرة ومناقشة تفاصيل العمل معكم. شاكر ومقدّر لوقتكم.`
  },
  {
    id: 'starter_eager',
    title: 'مبتدئ طموح ومستعد للتدريب السريع',
    badge: 'حماس والتزام',
    generateText: (job: Job, applicantName: string) => 
      `السلام عليكم ورحمة الله،\n` +
      `بخصوص شاغر (${job.title}) في (${job.city}) المعلن بمنصة NEXT JOB.\n\n` +
      `أنا ${applicantName || 'متقدم يمني'}، أبحث عن فرصة عمل للالتزام طويل الأمد ومستعد للتعلم السريع والعمل بروح الفريق وتحمل ضغط العمل مع توفر إقامة سارية.\n\n` +
      `أرجو إتاحة فرصة للمقابلة الشخصية وإثبات الجدارة. جزاكم الله خيراً.`
  },
  {
    id: 'ready_qiwa',
    title: 'جاهز للنقل المباشر عبر منصة قوى',
    badge: 'نقل فوري',
    generateText: (job: Job, applicantName: string) => 
      `السلام عليكم ورحمة الله،\n` +
      `بخصوص إعلانكم لوظيفة (${job.title}) في (${job.company}).\n\n` +
      `أود إبلاغكم بأن ملفي في منصة "قوى" جاهز تماماً لنقل الخدمات فوراً دون أي عوائق، ولدي خبرة جيدة وأقيم حالياً في (${job.city}).\n\n` +
      `هل الشاغر ما زال متاحاً للمباشرة وإرسال الطلب الوظيفي عبر قوى؟ شكراً لكم.`
  },
  {
    id: 'quick_inquiry',
    title: 'استفسار موجز ومباشر',
    badge: 'سريع ومختصر',
    generateText: (job: Job, applicantName: string) => 
      `السلام عليكم، استفسار بخصوص وظيفة (${job.title}) المعلنة في NEXT JOB - هل ما زال الشاغر متاحاً للتقديم؟ الاسم: ${applicantName || 'مقيم يمني مهتم'}.`
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'محاسب عام ومسؤول تكاليف وضريبة',
    company: 'مجموعة أفق الرياض للتجارة والمقاولات',
    city: 'الرياض',
    category: 'accounting',
    salary: '4,500 - 6,000 ريال',
    jobType: 'دوام كامل',
    sponsorshipTransfer: true,
    accommodationProvided: true,
    transportationProvided: false,
    mealsProvided: false,
    overtimeAvailable: true,
    experienceYears: '3-5 سنوات',
    educationLevel: 'بكالوريوس محاسبة',
    description: 'مطلوب محاسب مقيم بالمملكة (الأولوية لليمنيين) للعمل على برنامج قيود وسماك، خبرة في إعداد القوائم المالية، رفع الإقرارات الضريبية لهيئة الزكاة والضريبة والجمارك، ومتابعة حسابات الموردين والعملاء. نوفر سكن ونقل كفالة فوري بعد فترة التجربة.',
    requirements: [
      'بكالوريوس محاسبة معتمد',
      'إتقان برامج المحاسبة (سماك / قيود / زوهو)',
      'إقامة سارية وقابلة لنقل الخدمات عبر قوى',
      'معرفة بأنظمة هيئة الزكاة والضريبة والجمارك السعودية'
    ],
    phone: '0551234567',
    whatsapp: '966551234567',
    contactPerson: 'أبو فهد - مدير الموارد البشرية',
    createdAt: 'منذ ساعتين',
    lastConfirmedAt: 'اليوم',
    status: 'recently_confirmed',
    views: 184,
    urgent: true,
    featured: true,
    sourceType: 'employer'
  },
  {
    id: 'job-2',
    title: 'معلم شاورما ومساعد طاهي مشاوي',
    company: 'مطاعم بيت البركة الشامية',
    city: 'جدة',
    category: 'restaurants',
    salary: '3,500 - 4,500 ريال',
    jobType: 'دوام كامل',
    sponsorshipTransfer: true,
    accommodationProvided: true,
    transportationProvided: true,
    mealsProvided: true,
    overtimeAvailable: true,
    experienceYears: 'سنتان على الأقل',
    description: 'مطلوب فورا معلم شاورما دجاج ولحم ومهارات تتبيل وتقطيع احترافية مع كرت صحي ساري المفعول للعمل في فرعنا الجديد بحي الصفا بجدة. يشترط النظافة والسرعة وحسن التعامل مع الزبائن. السكن متوفر والوجبات مؤمنة يومياً.',
    requirements: [
      'كرت صحي بلدي ساري المفعول',
      'خبرة في تحضير وتشكيل أسياخ الشاورما والصوصات',
      'حسن المظهر والالتزام بساعات العمل'
    ],
    phone: '0509876543',
    whatsapp: '966509876543',
    contactPerson: 'م. وليد',
    createdAt: 'منذ 4 ساعات',
    lastConfirmedAt: 'اليوم',
    status: 'active',
    views: 245,
    urgent: true,
    sourceType: 'employer'
  },
  {
    id: 'job-3',
    title: 'سائق دينا ونقل خفيف وتوزيع مواد غذائية',
    company: 'مؤسسة السليمان لتوزيع المواد الغذائية',
    city: 'الدمام',
    category: 'drivers',
    salary: '3,200 - 4,000 ريال + عمولات',
    jobType: 'دوام كامل',
    sponsorshipTransfer: true,
    accommodationProvided: true,
    transportationProvided: true,
    mealsProvided: false,
    overtimeAvailable: true,
    experienceYears: 'سنة فأكثر',
    description: 'نبحث عن سائق ملتزم يحمل رخصة قيادة سعودية سارية لتوزيع البضائع الغذائية على المتاجر والبقالات في مدن الشرقية (الدمام، الخبر، الظهران، الجبيل). تتوفر سيارة جديدة من المؤسسة وبدل سكن ومكافأة مبيعات شهرية.',
    requirements: [
      'رخصة قيادة سعودية خصوصي أو عمومي خفيف سارية',
      'معرفة بشوارع وأحياء المنطقة الشرقية وتطبيقات الخرائط',
      'إقامة قابلة للتحويل'
    ],
    phone: '0543322110',
    whatsapp: '966543322110',
    contactPerson: 'الأستاذ عبد الله',
    createdAt: 'منذ 6 ساعات',
    lastConfirmedAt: 'منذ يوم',
    status: 'active',
    views: 132,
    sourceType: 'employer'
  },
  {
    id: 'job-4',
    title: 'مسؤول مبيعات وكاشير متجر اتصالات',
    company: 'عالم التقنية للاتصالات والإلكترونيات',
    city: 'مكة المكرمة',
    category: 'sales',
    salary: '3,500 - 4,500 ريال + نسبة',
    jobType: 'دوام كامل',
    sponsorshipTransfer: false,
    accommodationProvided: false,
    transportationProvided: false,
    mealsProvided: false,
    overtimeAvailable: false,
    experienceYears: 'سنة أو شغوف بالمبيعات',
    description: 'فرصة عمل ممتعة في مبيعات الجوالات والإكسسوارات وخدمات العملاء في متجر نشط قرب الحرم المكي. يشترط اللباقة والقدرة على التعامل مع الزبائن والمعتمرين من مختلف الجنسيات.',
    requirements: [
      'مهارات تواصل وإقناع ممتازة',
      'إلمام بمنتجات الجوالات وملحقاتها',
      'إقامة سارية بالمملكة'
    ],
    phone: '0567788990',
    whatsapp: '966567788990',
    contactPerson: 'أبو عمر',
    createdAt: 'منذ يوم',
    lastConfirmedAt: 'أمس',
    status: 'active',
    views: 198,
    featured: true,
    sourceType: 'employer'
  },
  {
    id: 'job-5',
    title: 'فني تبريد وتكييف وصيانة وحدات سبليت ومركزي',
    company: 'مؤسسة نسيم البرود للتكييف',
    city: 'المدينة المنورة',
    category: 'technical',
    salary: '4,000 - 5,200 ريال',
    jobType: 'دوام كامل',
    sponsorshipTransfer: true,
    accommodationProvided: true,
    transportationProvided: true,
    mealsProvided: false,
    overtimeAvailable: true,
    experienceYears: '3 سنوات فما فوق',
    description: 'مطلوب فني تكييف متمكن في تركيب وصيانة وشحن فريون لمكيفات الاسبليت والدولابي والتكييف المركزي، مع القدرة على فحص الأعطال الكهربائية للوحدات الخارجية.',
    requirements: [
      'خبرة عملية مثبتة في مجال التكييف والتبريد',
      'القدرة على قيادة سيارة الصيانة الخاصة بالعمل',
      'نقل كفالة متاح فوراً'
    ],
    phone: '0531122445',
    whatsapp: '966531122445',
    contactPerson: 'أبو ناصر',
    createdAt: 'منذ يومين',
    lastConfirmedAt: 'منذ يومين',
    status: 'recently_confirmed',
    views: 145,
    sourceType: 'employer'
  },
  {
    id: 'job-6',
    title: 'أخصائي تسويق رقمي وإدارة حملات سناب شات وتيك توك',
    company: 'وكالة مسار الإبداع للدعاية والإعلان',
    city: 'الرياض',
    category: 'marketing',
    salary: '4,200 - 6,500 ريال',
    jobType: 'دوام كامل',
    sponsorshipTransfer: true,
    accommodationProvided: false,
    transportationProvided: false,
    mealsProvided: false,
    overtimeAvailable: false,
    experienceYears: 'سنتان في السوق السعودي',
    description: 'نبحث عن مسوق محترف يمني لإدارة حسابات السوشيال ميديا وإطلاق الحملات الإعلانية الممولة على منصة إكس وسناب شات وتيك توك ومتابعة مؤشرات الأداء وصناعة محتوى تسويقي مبتكر للمتاجر الإلكترونية.',
    requirements: [
      'نماذج أعمال وحملات سابقة ناجحة بالسوق السعودي',
      'إتقان منصات الإعلانات Ads Manager (Snap / TikTok / Meta)',
      'مهارات كتابة المحتوى التسويقي الجذاب'
    ],
    phone: '0505566778',
    whatsapp: '966505566778',
    contactPerson: 'المدير التنفيذي',
    createdAt: 'منذ يومين',
    lastConfirmedAt: 'منذ 3 أيام',
    status: 'active',
    views: 180,
    sourceType: 'employer'
  },
  {
    id: 'job-7',
    title: 'أمين مستودع ومسؤول جرد وإدخال بيانات',
    company: 'شركة الأفق اللوجستية',
    city: 'خميس مشيط / أبها',
    category: 'warehousing',
    salary: '3,300 - 4,000 ريال',
    jobType: 'دوام كامل',
    sponsorshipTransfer: true,
    accommodationProvided: true,
    transportationProvided: true,
    mealsProvided: true,
    overtimeAvailable: true,
    experienceYears: 'سنة إلى 3 سنوات',
    description: 'إدارة عمليات الاستلام والتسليم والتخزين للبضائع، فحص الفواتير، مطابقة الأرصدة عبر برنامج إكسل والمخزون، والإشراف على ترتيب المستودع مع العمال.',
    requirements: [
      'إجادة استخدام الحاسب الآلي وبرنامج Excel',
      'دقة عالية في الجرد والحسابات',
      'تحمل ضغط العمل والترتيب'
    ],
    phone: '0549988776',
    whatsapp: '966549988776',
    contactPerson: 'أبو أحمد',
    createdAt: 'منذ 3 أيام',
    lastConfirmedAt: 'منذ 5 أيام',
    status: 'awaiting_confirmation',
    views: 95,
    sourceType: 'employer'
  },
  {
    id: 'job-8',
    title: 'كهربائي سيارات ومبرمج فحص كمبيوتر',
    company: 'مركز الدقة لصيانة السيارات الحديثة',
    city: 'القصيم (بريدة / عنيزة)',
    category: 'maintenance',
    salary: '4,200 - 5,800 ريال + نسبة',
    jobType: 'دوام كامل',
    sponsorshipTransfer: true,
    accommodationProvided: true,
    transportationProvided: false,
    mealsProvided: false,
    overtimeAvailable: true,
    experienceYears: '4 سنوات فأكثر',
    description: 'مطلوب فني كهرباء سيارات وفحص وبرمجة كمبيوتر (Launch / Autel)، فحص الحساسات، تشخيص الأعطال، وصيانة الأنظمة الكهربائية لسيارات تويوتا ونيسان وهيونداي والأمريكي.',
    requirements: [
      'إتقان استخدام أجهزة فحص الأعطال وبرمجة المفاتيح والحساسات',
      'خبرة عملية وسرعة في اكتشاف الخلل',
      'إقامة قابلة للتحويل'
    ],
    phone: '0557766554',
    whatsapp: '966557766554',
    contactPerson: 'أبو خالد الحربي',
    createdAt: 'منذ 3 أيام',
    lastConfirmedAt: 'اليوم',
    status: 'recently_confirmed',
    views: 124,
    sourceType: 'employer'
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    fullName: 'صادق محمد عبد الله القاضي',
    profession: 'محاسب مالي ومدير حسابات',
    city: 'الرياض',
    yemeniGovernorate: 'إب',
    iqamaStatus: 'إقامة سارية وقابلة للنقل',
    experienceYears: '6 سنوات (4 سنوات منها بالسعودية)',
    phone: '0554433221',
    phoneVerified: true,
    whatsapp: '966554433221',
    skills: ['برامج قيود وسماك وساب', 'الضريبة المضافة والميزانيات', 'إقفال الحسابات الشهرية', 'التحليل المالي'],
    bio: 'محاسب يمني مقيم بالرياض، حاصل على بكالوريوس محاسبة. خبرة متعمقة في مسك الدفاتر المحاسبية، إصدار الفواتير الإلكترونية المعتمدة من هيئة الزكاة (فاتورة)، وإعداد التقارير المالية الدورية. جاهز لنقل الكفالة والعمل الفوري.',
    hasDriverLicense: true,
    availableImmediately: true,
    educationLevel: 'بكالوريوس محاسبة',
    isHidden: false,
    allowContact: true,
    nationality: 'يمني',
    createdAt: 'منذ يوم',
    views: 112
  },
  {
    id: 'cand-2',
    fullName: 'أمين رشاد الصبري',
    profession: 'معلم باريستا وصانع حلويات وكريب',
    city: 'جدة',
    yemeniGovernorate: 'تعز',
    iqamaStatus: 'إقامة سارية وقابلة للنقل',
    experienceYears: '4 سنوات في كبرى المقاهي',
    phone: '0501122334',
    phoneVerified: true,
    whatsapp: '966501122334',
    skills: ['رسم اللاتيه آرت احترافي', 'المشروبات الباردة والساخنة', 'معايرة المكائن وطواحين القهوة', 'خدمة الزبائن السريعة'],
    bio: 'شاب يمني مقيم بجدة، شغوف بصناعة القهوة المختصة والحلويات الغربية. أحمل كرت صحي ساري وجاهز للعمل بدوام كامل أو شفتات مع نقل الخدمات.',
    hasDriverLicense: false,
    availableImmediately: true,
    educationLevel: 'ثانوية عامة',
    isHidden: false,
    allowContact: true,
    nationality: 'يمني',
    createdAt: 'منذ يومين',
    views: 89
  },
  {
    id: 'cand-3',
    fullName: 'هشام صالح قائد',
    profession: 'سائق خصوصي ونقل خفيف + مناديب مبيعات',
    city: 'الدمام',
    yemeniGovernorate: 'صنعاء',
    iqamaStatus: 'إقامة سارية وقابلة للنقل',
    experienceYears: '5 سنوات بالسعودية',
    phone: '0562233445',
    phoneVerified: true,
    whatsapp: '966562233445',
    skills: ['رخصة قيادة سعودية عمومي خفيف', 'معرفة تامة بطرق الشرقية والرياض', 'تحصيل وفواتير المبيعات', 'الالتزام والأمانة'],
    bio: 'سائق متمرس يتميز بحسن الخلق والأمانة والانضباط العالي بالمواعيد. عملت سابقاً في شركات توزيع الأغذية والمواد الاستهلاكية وتوصيل الموظفين. لدي رخصة قيادة سارية وسيارة نظيفة ومعرفة دقيقة بالخرائط.',
    hasDriverLicense: true,
    availableImmediately: true,
    educationLevel: 'دبلوم تجاري',
    isHidden: false,
    allowContact: true,
    nationality: 'يمني',
    createdAt: 'منذ 3 أيام',
    views: 145
  },
  {
    id: 'cand-4',
    fullName: 'يحيى أحمد الشرجبي',
    profession: 'فني كهربائي منازل وتأسيس وتشطيب',
    city: 'مكة المكرمة',
    yemeniGovernorate: 'تعز',
    iqamaStatus: 'تأشيرة زيارة / هوية زائر',
    experienceYears: '7 سنوات',
    phone: '0537788990',
    phoneVerified: false,
    whatsapp: '966537788990',
    skills: ['تأسيس كهرباء فلل وعمائر', 'تركيب اللوحات والقواطع والأفياش', 'تمديد الإضاءات الذكية والليد', 'كشف الالتماسات الكهربائية'],
    bio: 'كهربائي محترف في تنفيذ أعمال الكهرباء الإنشائية والتشطيبات الفاخرة للفلل والمحلات التجارية، سرعة في التنفيذ ودقة متناهية والتزام بمعايير كود البناء السعودي.',
    hasDriverLicense: true,
    availableImmediately: true,
    educationLevel: 'دبلوم مهني صناعي',
    isHidden: false,
    allowContact: true,
    nationality: 'يمني',
    createdAt: 'منذ 4 أيام',
    views: 104
  },
  {
    id: 'cand-5',
    fullName: 'طارق عبد السلام باوزير',
    profession: 'كاشير ومسؤول مبيعات تجزئة وسوبرماركت',
    city: 'الرياض',
    yemeniGovernorate: 'حضرموت (المكلا / سيئون)',
    iqamaStatus: 'إقامة سارية وقابلة للنقل',
    experienceYears: '3 سنوات في الرياض',
    phone: '0558877665',
    phoneVerified: true,
    whatsapp: '966558877665',
    skills: ['أنظمة نقاط البيع POS', 'خدمة العملاء والجرد اليومي', 'تسوية العهدة النقدية والشبكة', 'اللباقة والسرعة'],
    bio: 'شاب حضرمي مقيم بالرياض، أتمتع بأمانة عالية وحسن تعامل مع العملاء. عملت كاشير في هايبرماركت وسوبرماركت مركزي في حي الملقا وحي النسيم. جاهز للمباشرة الفورية ونقل الخدمات.',
    hasDriverLicense: true,
    availableImmediately: true,
    educationLevel: 'دبلوم إدارة أعمال',
    isHidden: false,
    allowContact: true,
    nationality: 'يمني',
    createdAt: 'منذ 5 أيام',
    views: 78
  }
];

export const SAUDI_GUIDE_ARTICLES: GuideArticle[] = [
  {
    id: 'guide-qiwa-transfer',
    title: 'دليل نقل الخدمات (الكفالة) عبر منصة قوى والأنظمة الحديثة 2026',
    category: 'نقل الخدمات وقوى',
    cluster: 'نقل الخدمات وقوى',
    summary: 'خطوات قبول ونقل العقد الوظيفي وإشعار صاحب العمل دون الحاجة لموافقة الكفيل في الحالات النظامية.',
    readTime: '3 دقائق قراءة',
    date: '2026-08-20',
    iconName: 'Building2',
    content: [
      'منصة "قوى" التابعة لوزارة الموارد البشرية والتنمية الاجتماعية تتيح للعامل نقل خدماته إلى صاحب عمل جديد إلكترونياً.',
      'يقوم صاحب العمل الجديد بإنشاء طلب نقل خدمة وإرسال العقد الرقمي عبر منصة قوى.',
      'يصل للعامل إشعار على رقم الجوال المسجل في أبشر للموافقة على العقد خلال مدة 10 أيام.',
      'يحق للعامل نقل خدماته دون موافقة صاحب العمل الحالي في الحالات التالية: انتهاء رخصة العمل أو الإقامة، عدم دفع الأجور لمدة 3 أشهر متتالية، أو عدم توثيق العقد إلكترونياً بعد 3 أشهر من دخوله المملكة.'
    ],
    importantNotes: [
      'تأكد من تحديث رقم جوالك في منصة أبشر ومنصة قوى لاستقبال رموز التحقق.',
      'لا تدفع أي رسوم نقل خدمات لأي شخص؛ الرسوم الحكومية يتحملها صاحب العمل الجديد نظاماً.'
    ],
    views: 1420
  },
  {
    id: 'guide-scam-prevention',
    title: 'احذر الاحتيال: كيف تحمي نفسك من سماسرة الوظائف ورسوم التوظيف الوهمية؟',
    category: 'نصائح التوظيف والمقابلات',
    cluster: 'الأمان ومكافحة الاحتيال',
    summary: 'دليل شامل لكشف الإعلانات الوهمية وحماية بياناتك وأموالك من أي استغلال باسم الوظائف.',
    readTime: '4 دقائق قراءة',
    date: '2026-08-22',
    iconName: 'ShieldCheck',
    content: [
      'القاعدة الذهبية الأولى: لا تدفع أبداً أي ريال مقابل الحصول على وظيفة أو مقابلة عمل أو استخراج بطاقة عمل.',
      'الشركات الحقيقية وأصحاب العمل الموثوقين يتحملون تكاليف التوظيف كاملة ولا يطلبون تحويلات بنكية مقدماً.',
      'احذر من الرسائل التي تطلب أرقام الحسابات البنكية أو رموز التحقق OTP الخاصة بالبنك أو النفاذ الوطني.',
      'تواصل دائماً عبر أرقام واتساب مباشرة مع مسؤولي المنشأة وتأكد من وجود موقع فعلي أو متجر للمنشأة قبل إرسال مستنداتك الحساسة.'
    ],
    importantNotes: [
      'منصة NEXT JOB مجانية 100%، وإذا طلب منك أي معلن مبالغ مالية، يرجى الإبلاغ عنه فوراً من خلال زر "إبلاغ عن محتوى مخادع".'
    ],
    views: 2180
  },
  {
    id: 'guide-labor-contract',
    title: 'حقوق العامل والالتزامات في نظام العمل السعودي والعقد الإلكتروني',
    category: 'عقود العمل والحقوق',
    cluster: 'الأنظمة والعقود',
    summary: 'أهم بنود عقد العمل الموثق، ساعات العمل الرسمية، الإجازات السنوية، ومكافأة نهاية الخدمة.',
    readTime: '4 دقائق قراءة',
    date: '2026-08-18',
    iconName: 'FileText',
    content: [
      'ساعات العمل الفعلية: 8 ساعات يومياً أو 48 ساعة أسبوعياً كحد أقصى، وتخفض في شهر رمضان للمسلمين إلى 6 ساعات.',
      'ساعات العمل الإضافية: تحتسب بنسبة 150% من الأجر الأساسي للساعة وفق المادة 107 من نظام العمل.',
      'فترة التجربة: تكون محددة في العقد بحد أقصى 90 يوماً، ويجوز باتفاق خطي تمديدها إلى 180 يوماً.',
      'الإجازة السنوية: يستحق العامل إجازة سنوية مدفوعة الأجر لا تقل عن 21 يوماً وتزاد إلى 30 يوماً إذا أمضى 5 سنوات متصلة لدى صاحب العمل.'
    ],
    importantNotes: [
      'العقد الموثق إلكترونياً في منصة قوى هو المرجع الرسمي الوحيد لأي مطالبة قانونية أو عمالية.'
    ],
    views: 980
  },
  {
    id: 'guide-cv-a4-tips',
    title: 'كيف تجهز سيرة ذاتية A4 احترافية تقنع أصحاب العمل السعوديين في دقيقة واحدة؟',
    category: 'نصائح التوظيف والمقابلات',
    cluster: 'السيرة الذاتية والمقابلات',
    summary: 'معايير إعداد الـ CV المختصر والمثالي للتقديم في السوق السعودي دون حشو أو تعقيد.',
    readTime: '3 دقائق قراءة',
    date: '2026-08-23',
    iconName: 'Sparkles',
    content: [
      'اجعل السيرة الذاتية في صفحة واحدة A4 فقط: أصحاب العمل يقضون في المتوسط 10 ثوانٍ في معاينة الملف.',
      'ضع المعلومات الجوهرية في البداية: المهنة، المدينة الحالية بالسعودية، حالة الإقامة ونقل الكفالة، ورقم الجوال والواتساب المباشر.',
      'اذكر المهارات العملية وأسماء البرامج والأنظمة التي تتقنها (مثال: برامج المحاسبة، أجهزة الفحص، اللاتيه آرت).',
      'استخدم منشئ السيرة الذاتية المجاني في منصة NEXT JOB لإنشاء وطباعة CV A4 أنيق متوافق مع معايير الشركات بنقرة واحدة.'
    ],
    importantNotes: [
      'تأكد من كتابة سنوات الخبرة داخل المملكة العربية السعودية بشكل بارز لأنها تعطيك أفضلية فورية.'
    ],
    views: 1650
  },
  {
    id: 'guide-relocation-riyadh-jeddah',
    title: 'الانتقال للعمل بين المدن السعودية: مقارنة فرص وتكاليف المعيشة في الرياض وجدة والشرقية',
    category: 'تجارب وحرف اليمنيين',
    cluster: 'المدن والفرص',
    summary: 'دليل عملي للمقيم اليمني حول طبيعة سوق العمل والرواتب وتكاليف السكن في العاصمة والمدن الرئيسية.',
    readTime: '5 دقائق قراءة',
    date: '2026-08-21',
    iconName: 'MapPin',
    content: [
      'مدينة الرياض: السوق الأكبر والأعلى طلباً على المحاسبين، التسويق، المبيعات، والمهن الفنية. الرواتب أعلى بنسبة 15-25% ولكن تكاليف السكن مرتفعة.',
      'مدينة جدة: مركز رئيسي لقطاعات المطاعم، الكافيهات، تجارة الجملة والتجزئة، والخدمات اللوجستية. تكاليف السكن معتدلة نسبياً مع حركة تجارية نشطة.',
      'المنطقة الشرقية (الدمام / الخبر / الجبيل): طلب كبير ومستمر على السائقين، أمناء المستودعات، وفنيي الصيانة والمقاولات.',
      'المدن الإقليمية (القصيم، أبها، جازان): تتميز بتوفر سكن مجاني أو بدلات مناسبة وقلة الازدحام ومجتمعات تجارية يمنية متماسكة.'
    ],
    importantNotes: [
      'إذا كانت الوظيفة تشمل "السكن والمواصلات"، فإن العمل في المدن الكبرى يوفر عليك جزءاً كبيراً من الراتب الشهري.'
    ],
    views: 1320
  }
];

export const INITIAL_COMMUNITY_SUBMISSIONS: CommunityJobSubmission[] = [
  {
    id: 'comm-1',
    title: 'مطلوب كاشير وموظف مبيعات في سوبرماركت بحي السليمانية',
    companyOrShop: 'تموينات الخير المركزية',
    city: 'الرياض',
    category: 'sales',
    contactNumber: '0559988771',
    details: 'أخبرني صاحب التموينات اليوم أنه يحتاج شاب يمني كاشير وجرد بدوام كامل 10 ساعات وراتب 3800 ريال مع سكن قريب.',
    salary: '3,800 ريال + سكن',
    submitterName: 'أبو يزن اليمني',
    submitterPhone: '0501239999',
    status: 'approved',
    submittedAt: 'منذ 3 ساعات'
  },
  {
    id: 'comm-2',
    title: 'فرصة فني تكييف سيارات في مجمع ورش الصناعية القديمة',
    companyOrShop: 'ورشة القمة للميكانيكا',
    city: 'الرياض',
    category: 'maintenance',
    contactNumber: '0534455667',
    details: 'طلب مني المعلم نشر الشاغر لفني كهرباء وتكييف سيارات خبرة جيدة ونقل كفالة متوفر فوراً.',
    salary: '4,500 ريال',
    submitterName: 'هشام الصبري',
    status: 'approved',
    submittedAt: 'منذ 5 ساعات'
  }
];

export const INITIAL_FRAUD_REPORTS: FraudReport[] = [
  {
    id: 'rep-1',
    targetType: 'job',
    targetId: 'mock-old-1',
    targetTitle: 'مندوب مبيعات مع رسوم ملف',
    reason: 'طلب مبالغ أو عمولات توظيف',
    details: 'تواصلت مع الرقم وطلب تحويل 200 ريال كرسوم إدارية لفتح الملف وهذا مخالف لسياسة المنصة.',
    reporterPhone: '0550001122',
    createdAt: 'منذ يوم',
    status: 'reviewed'
  }
];

export const SEO_CLUSTERS = [
  { id: 'cluster-riyadh', name: 'وظائف الرياض لليمنيين', keywordsCount: 18, trafficEst: '45K/mo' },
  { id: 'cluster-jeddah', name: 'وظائف جدة ومكة', keywordsCount: 15, trafficEst: '32K/mo' },
  { id: 'cluster-eastern', name: 'وظائف الشرقية (الدمام/الخبر)', keywordsCount: 12, trafficEst: '20K/mo' },
  { id: 'cluster-qiwa', name: 'نقل كفالة وخدمات قوى', keywordsCount: 22, trafficEst: '60K/mo' },
  { id: 'cluster-no-exp', name: 'وظائف بدون خبرة وتدريب', keywordsCount: 14, trafficEst: '28K/mo' },
  { id: 'cluster-safety', name: 'أمان العمل ومكافحة الاحتيال', keywordsCount: 9, trafficEst: '15K/mo' },
  { id: 'cluster-whatsapp', name: 'أرقام وتواصل مباشر واتساب', keywordsCount: 20, trafficEst: '50K/mo' }
];

export const SEED_SEO_KEYWORDS: SEOKeywordMetric[] = [
  {
    keyword: 'وظائف محاسبين يمنيين في الرياض نقل كفالة',
    cluster: 'وظائف الرياض لليمنيين',
    intent: 'transactional',
    searchVolumeEst: 8400,
    competition: 'متوسطة',
    realJobCount: 12,
    indexStatus: 'index',
    cannibalizationRisk: 'منخفض',
    recommendedAction: 'Create'
  },
  {
    keyword: 'وظائف مطاعم وكافيهات باريستا جدة للمقيمين',
    cluster: 'وظائف جدة ومكة',
    intent: 'transactional',
    searchVolumeEst: 6200,
    competition: 'متوسطة',
    realJobCount: 9,
    indexStatus: 'index',
    cannibalizationRisk: 'منخفض',
    recommendedAction: 'Job Page'
  },
  {
    keyword: 'طريقة نقل الكفالة في قوى بدون موافقة الكفيل',
    cluster: 'نقل كفالة وخدمات قوى',
    intent: 'informational',
    searchVolumeEst: 24000,
    competition: 'مرتفعة',
    realJobCount: 28,
    indexStatus: 'index',
    cannibalizationRisk: 'منخفض',
    recommendedAction: 'Pillar'
  },
  {
    keyword: 'سائقين دينا وتوصيل الدمام براتب وسكن',
    cluster: 'وظائف الشرقية (الدمام/الخبر)',
    intent: 'transactional',
    searchVolumeEst: 4500,
    competition: 'منخفضة',
    realJobCount: 6,
    indexStatus: 'index',
    cannibalizationRisk: 'منخفض',
    recommendedAction: 'Create'
  },
  {
    keyword: 'وظائف كاشير ومبيعات بدون خبرة في الرياض',
    cluster: 'وظائف بدون خبرة وتدريب',
    intent: 'transactional',
    searchVolumeEst: 5800,
    competition: 'متوسطة',
    realJobCount: 8,
    indexStatus: 'index',
    cannibalizationRisk: 'منخفض',
    recommendedAction: 'Improve'
  },
  {
    keyword: 'أرقام واتساب أصحاب عمل يبحثون عن عمال يمنيين',
    cluster: 'أرقام وتواصل مباشر واتساب',
    intent: 'commercial',
    searchVolumeEst: 11200,
    competition: 'مرتفعة',
    realJobCount: 15,
    indexStatus: 'index',
    cannibalizationRisk: 'متوسط',
    recommendedAction: 'Refresh'
  }
];

export const SEO_30_DAYS_DRY_RUN: SEODryRunItem[] = [
  { day: 1, slot: 'صباحي', title: 'فرص عمل المحاسبة بالرياض لليمنيين مع نقل الكفالة', cluster: 'وظائف الرياض', targetKeyword: 'وظائف محاسبين الرياض', realJobSignal: 12, cannibalizationScore: 12, qualityGatePassed: true, status: 'جاهز للنشر' },
  { day: 1, slot: 'مسائي', title: 'دليل خطوات قبول العقد الإلكتروني عبر منصة قوى', cluster: 'نقل الخدمات وقوى', targetKeyword: 'قبول عقد قوى', realJobSignal: 25, cannibalizationScore: 8, qualityGatePassed: true, status: 'جاهز للنشر' },
  { day: 2, slot: 'صباحي', title: 'وظائف باريستا ومطاعم في جدة للمقيمين برواتب مجزية', cluster: 'وظائف جدة', targetKeyword: 'وظائف باريستا جدة', realJobSignal: 9, cannibalizationScore: 15, qualityGatePassed: true, status: 'جاهز للنشر' },
  { day: 2, slot: 'مسائي', title: 'كيف تكتشف إعلانات التوظيف الوهمية وتتجنب دفع الرسوم', cluster: 'الأمان ومكافحة الاحتيال', targetKeyword: 'احتيال رسوم التوظيف', realJobSignal: 18, cannibalizationScore: 5, qualityGatePassed: true, status: 'جاهز للنشر' },
  { day: 3, slot: 'صباحي', title: 'وظائف سائقين ونقل خفيف بالدمام والخبر مع سيارة وسكن', cluster: 'وظائف الشرقية', targetKeyword: 'سائقين الدمام', realJobSignal: 7, cannibalizationScore: 10, qualityGatePassed: true, status: 'جاهز للنشر' },
  { day: 3, slot: 'مسائي', title: 'نموذج سيرة ذاتية A4 مجاني جاهز للطباعة والتقديم المباشر', cluster: 'السيرة الذاتية', targetKeyword: 'سيرة ذاتية A4 مجانية', realJobSignal: 30, cannibalizationScore: 14, qualityGatePassed: true, status: 'جاهز للنشر' },
  { day: 4, slot: 'صباحي', title: 'وظائف كاشير ومبيعات تجزئة بالرياض بدون اشتراط خبرة سابقة', cluster: 'بدون خبرة', targetKeyword: 'كاشير بدون خبرة الرياض', realJobSignal: 8, cannibalizationScore: 18, qualityGatePassed: true, status: 'جاهز للنشر' },
  { day: 4, slot: 'مسائي', title: 'حساب ساعات العمل الإضافية ومكافأة نهاية الخدمة بنظام العمل', cluster: 'الأنظمة والعقود', targetKeyword: 'حساب الأوفر تايم السعودي', realJobSignal: 20, cannibalizationScore: 9, qualityGatePassed: true, status: 'جاهز للنشر' },
  { day: 5, slot: 'صباحي', title: 'فرص فنيي التكييف والكهرباء بمكة والمدينة المنورة', cluster: 'المهن الفنية', targetKeyword: 'فني تكييف مكة والمدينة', realJobSignal: 6, cannibalizationScore: 11, qualityGatePassed: true, status: 'جاهز للنشر' },
  { day: 5, slot: 'مسائي', title: 'قوالب رسائل واتساب مقنعة للتقديم الفوري على الوظائف', cluster: 'واتساب وتواصل', targetKeyword: 'رسائل تقديم واتساب', realJobSignal: 35, cannibalizationScore: 6, qualityGatePassed: true, status: 'جاهز للنشر' },
];
