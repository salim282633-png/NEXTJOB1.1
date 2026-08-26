import { GuideArticle, Job } from '../types';

export const SAUDI_CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر',
  'الأحساء', 'القصيم (بريدة / عنيزة)', 'خميس مشيط / أبها', 'تبوك',
  'جازان', 'نجران', 'ينبع', 'الطائف', 'حائل', 'الجبيل',
  'السعودية (الموقع حسب المصدر)'
];

export const YEMENI_GOVERNORATES = [
  'صنعاء', 'تعز', 'إب', 'حضرموت (المكلا / سيئون)', 'عدن', 'الحديدة',
  'ذمار', 'حجة', 'صعدة', 'شبوة', 'لحج', 'أبين', 'المهرة', 'عمران',
  'مأرب', 'البيضاء', 'الجوف', 'الضالع', 'سقطرى', 'ريمة', 'المحويت'
];

export const JOB_CATEGORIES = [
  { id: 'all', name: 'جميع التخصصات', icon: 'LayoutGrid' },
  { id: 'sales', name: 'مبيعات وكاشير وخدمة عملاء', icon: 'ShoppingBag' },
  { id: 'restaurants', name: 'مطاعم وكافيهات وطهاة', icon: 'Utensils' },
  { id: 'accounting', name: 'محاسبة ومالية', icon: 'Calculator' },
  { id: 'management', name: 'إدارة وعمليات', icon: 'BriefcaseBusiness' },
  { id: 'technology', name: 'تقنية وبرمجة وبيانات', icon: 'Laptop' },
  { id: 'drivers', name: 'سائقين وتوصيل ونقليات', icon: 'Truck' },
  { id: 'technical', name: 'مهن فنية (كهرباء، سباكة، تكييف)', icon: 'Wrench' },
  { id: 'maintenance', name: 'صيانة سيارات وميكانيكا', icon: 'Cog' },
  { id: 'construction', name: 'مقاولات وبناء وتشطيبات', icon: 'Hammer' },
  { id: 'warehousing', name: 'مستودعات وترتيب بضائع', icon: 'Package' },
  { id: 'marketing', name: 'تسويق وتصميم ومحتوى', icon: 'Share2' },
  { id: 'medical', name: 'صيدلة ومجالات طبية مساندة', icon: 'HeartPulse' }
];

// These are deterministic local message helpers for direct WhatsApp contact.
// The separate AI generator uses Gemini only when its API key is configured.
export const WHATSAPP_PITCH_TEMPLATES = [
  {
    id: 'experienced',
    title: 'متقدم ذو خبرة سابقة في المجال',
    badge: 'خبرة',
    generateText: (job: Job, applicantName: string, applicantExp: string) =>
      `السلام عليكم ورحمة الله وبركاته،\nبخصوص إعلانكم عن وظيفة (${job.title}) لدى (${job.company}) عبر NEXT JOB.\n\nمعك ${applicantName || 'متقدم مهتم'}، لدي خبرة ${applicantExp || 'ذات صلة بالمجال'} وأرغب في التقديم على الشاغر.\n\nيسرني إرسال السيرة الذاتية ومناقشة تفاصيل العمل معكم. شكرًا لوقتكم.`
  },
  {
    id: 'starter_eager',
    title: 'مبتدئ ومستعد للتعلم',
    badge: 'مبتدئ',
    generateText: (job: Job, applicantName: string) =>
      `السلام عليكم ورحمة الله،\nبخصوص شاغر (${job.title}) في (${job.city}) المعلن عبر NEXT JOB.\n\nأنا ${applicantName || 'متقدم مهتم'}، أرغب في التقديم ومستعد للتعلم والالتزام بمتطلبات العمل.\n\nأرجو إتاحة فرصة للمقابلة والتعرف على تفاصيل الشاغر. شكرًا لكم.`
  },
  {
    id: 'ready_qiwa',
    title: 'استفسار عن نقل الخدمات',
    badge: 'نقل خدمات',
    generateText: (job: Job, applicantName: string) =>
      `السلام عليكم ورحمة الله،\nبخصوص إعلانكم لوظيفة (${job.title}) في (${job.company}).\n\nأنا ${applicantName || 'متقدم مهتم'} وأرغب في التقديم والاستفسار عن إمكانية نقل الخدمات وآلية التعاقد إذا كان الشاغر ما زال متاحًا.\n\nشكرًا لكم.`
  },
  {
    id: 'quick_inquiry',
    title: 'استفسار موجز ومباشر',
    badge: 'مختصر',
    generateText: (job: Job, applicantName: string) =>
      `السلام عليكم، استفسار بخصوص وظيفة (${job.title}) المعلنة في NEXT JOB: هل ما زال الشاغر متاحًا للتقديم؟ الاسم: ${applicantName || 'متقدم مهتم'}.`
  }
];

// Editorial content only. These are not live analytics, job counts, Search
// Console metrics, or SEO simulation data.
export const SAUDI_GUIDE_ARTICLES: GuideArticle[] = [
  {
    id: 'guide-qiwa-transfer',
    title: 'إرشادات عامة لفهم نقل الخدمات والعقد الإلكتروني',
    category: 'نقل الخدمات وقوى',
    cluster: 'نقل الخدمات وقوى',
    summary: 'نقاط عامة تساعد العامل على فهم خطوات العقد الإلكتروني ونقل الخدمات، مع ضرورة الرجوع للمصادر الرسمية للحالة الفردية.',
    readTime: '3 دقائق قراءة',
    date: '2026-08-20',
    iconName: 'Building2',
    content: [
      'تُدار إجراءات تعاقد ونقل خدمات كثير من العاملين إلكترونيًا عبر المنصات الرسمية التابعة للجهات المختصة في المملكة.',
      'راجع تفاصيل العقد والراتب والمسمى والمدة قبل الموافقة، واحتفظ بنسخة من المستندات والإشعارات الرسمية.',
      'قد تختلف شروط وإجراءات نقل الخدمات بحسب حالة العامل وصاحب العمل والأنظمة السارية؛ تحقق دائمًا من المصدر الحكومي الرسمي قبل اتخاذ قرار.'
    ],
    importantNotes: [
      'لا تشارك رموز التحقق أو بيانات الدخول الحكومية مع أي شخص.',
      'هذا المحتوى إرشادي عام وليس استشارة قانونية أو ضمانًا لإتمام نقل الخدمات.'
    ]
  },
  {
    id: 'guide-scam-prevention',
    title: 'كيف تحمي نفسك من الاحتيال ورسوم التوظيف الوهمية؟',
    category: 'نصائح التوظيف والمقابلات',
    cluster: 'الأمان ومكافحة الاحتيال',
    summary: 'إرشادات عملية للتحقق من الإعلانات وتقليل مخاطر الاحتيال وسوء استخدام البيانات.',
    readTime: '4 دقائق قراءة',
    date: '2026-08-22',
    iconName: 'ShieldCheck',
    content: [
      'تعامل بحذر مع أي جهة تطلب تحويل مبلغ مالي مقابل وعد بالحصول على وظيفة أو مقابلة.',
      'تحقق من اسم المنشأة ووسائل التواصل وموقعها قبل إرسال مستندات حساسة.',
      'لا ترسل رموز OTP أو كلمات المرور أو بيانات الدخول البنكية أو الحكومية لأي معلن.',
      'إذا لاحظت سلوكًا مريبًا استخدم نظام البلاغات داخل NEXT JOB لإرساله للمراجعة.'
    ],
    importantNotes: [
      'NEXT JOB لا تتقاضى عمولة توظيف من الباحث عن عمل.'
    ]
  },
  {
    id: 'guide-labor-contract',
    title: 'أسئلة يجب مراجعتها قبل قبول عقد عمل',
    category: 'عقود العمل والحقوق',
    cluster: 'الأنظمة والعقود',
    summary: 'قائمة مراجعة عملية لبنود العقد والراتب وساعات العمل والمزايا قبل الموافقة.',
    readTime: '4 دقائق قراءة',
    date: '2026-08-18',
    iconName: 'FileText',
    content: [
      'تأكد من تطابق المسمى الوظيفي والراتب والمزايا ومكان العمل مع ما تم الاتفاق عليه.',
      'اسأل بوضوح عن ساعات العمل والراحة والإجازات وفترة التجربة وأي بدلات أو حوافز.',
      'احتفظ بنسخة من العقد وأي عروض أو مراسلات رسمية مرتبطة بالتوظيف.',
      'للحقوق والالتزامات الدقيقة ارجع إلى النصوص والجهات الرسمية السارية في وقت التعاقد.'
    ],
    importantNotes: [
      'المحتوى إرشادي عام ولا يحل محل الاستشارة القانونية أو المصادر الحكومية الرسمية.'
    ]
  }
];
