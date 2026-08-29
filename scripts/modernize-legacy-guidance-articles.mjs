import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const MANIFEST_FILE = path.join(GUIDE_DIR, 'articles.json');
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const LEGACY_UPDATED_AT = '2026-08-29T08:39:00.000Z';

const OVERRIDES = {
  'yemeni-jobs-jazan-jobs-04c467ec': {
    title: 'البحث عن عمل في جازان لليمنيين: دليل عملي وآمن',
    description: 'دليل عملي للباحث اليمني في جازان حول تنظيم البحث عن عمل، تجهيز الملف المهني، تقييم الإعلانات، والتحقق من الإجراءات الرسمية عند الحاجة.'
  },
  'yemeni-jobs-saudi-restaurants-46226527': {
    title: 'العمل في قطاع المطاعم لليمنيين في السعودية: دليل مهني',
    description: 'دليل مهني لليمنيين في السعودية حول مهارات قطاع المطاعم، تجهيز السيرة الذاتية، البحث الآمن عن عمل، والتحقق من المعلومات عبر المصادر الرسمية.'
  },
  'yemeni-jobs-saudi-jobs-25065961': {
    title: 'البحث عن عمل لليمنيين في السعودية: خطوات عملية وآمنة',
    description: 'دليل عملي للمقيم اليمني في السعودية لتنظيم البحث عن عمل، تحسين السيرة الذاتية، التواصل المهني، والتحقق من إجراءات نقل الخدمات رسميًا.'
  },
  'yemeni-jobs-dammam-buffet-worker-4bf28d56': {
    title: 'العمل كمعلم بوفيه في الدمام لليمنيين: دليل مهني',
    description: 'دليل مهني للباحث اليمني عن عمل كمعلم بوفيه في الدمام، مع نصائح للمهارات والسيرة الذاتية والبحث الآمن والتحقق من الإجراءات الرسمية.'
  },
  'yemeni-jobs-saudi-grill-chef-d687295b': {
    title: 'العمل كشيف مشويات لليمنيين في السعودية: دليل مهني',
    description: 'دليل مهني لليمنيين في السعودية حول العمل كشيف مشويات، إبراز الخبرة والمهارات، تجهيز ملف التقديم، والبحث الآمن عن فرص مناسبة.'
  },
  'yemeni-jobs-saudi-jobs-639efa4e': {
    title: 'كيف يبحث اليمني عن عمل في السعودية؟ دليل عملي',
    description: 'خطوات عملية للباحث اليمني في السعودية لبناء خطة بحث عن عمل، تجهيز الملف المهني، التواصل مع المنشآت، وتجنب الإعلانات والوعود المضللة.'
  },
  'yemeni-jobs-jeddah-jobs-b98ee3dc': {
    title: 'البحث عن عمل في جدة لليمنيين: دليل عملي للبدء',
    description: 'دليل عملي للباحث اليمني في جدة حول قنوات البحث عن عمل، تجهيز السيرة الذاتية، التواصل المهني، والتحقق من الإعلانات والإجراءات الرسمية.'
  },
  'yemeni-jobs-riyadh-jobs-ff091adf': {
    title: 'البحث عن عمل في الرياض لليمنيين: خطوات عملية وآمنة',
    description: 'دليل عملي للباحث اليمني في الرياض لتنظيم البحث عن عمل، تحسين السيرة الذاتية، اختيار قنوات التقديم، وتجنب الإعلانات والوعود المضللة.'
  },
  'yemeni-jobs-saudi-jobs-98305259': {
    title: 'البحث عن عمل ونقل الخدمات لليمنيين في السعودية: دليل تحقق',
    description: 'دليل للباحث اليمني في السعودية يوضح تنظيم البحث عن عمل وما يجب التحقق منه بشأن نقل الخدمات، مع الرجوع إلى قوى والجهات الرسمية المختصة.'
  },
  'yemeni-jobs-saudi-jobs-9c0f8017': {
    title: 'دليل البحث عن عمل لليمنيين في السعودية وخطوات التقديم',
    description: 'دليل عملي لليمنيين في السعودية حول البحث عن عمل، تجهيز السيرة الذاتية، خطوات التقديم الآمن، والتحقق من العقود ونقل الخدمات رسميًا.'
  }
};

const CONTENT = {
  'yemeni-jobs-jazan-jobs-04c467ec': {
    intro: 'البحث عن عمل في جازان يصبح أكثر فاعلية عندما يبدأ بخطة واضحة بدل الاعتماد على إعلان واحد أو قناة واحدة. حدّد نوع العمل الذي يناسب خبرتك، جهّز سيرة ذاتية مختصرة، ورتّب الجهات التي ستتواصل معها بحسب المجال والموقع.\n\nهذا المقال مخصص للباحث اليمني داخل السعودية، ويجمع خطوات عملية لتنظيم البحث في جازان، تقييم الإعلان قبل التقديم، وتجهيز الأسئلة المهمة قبل أي اتفاق. وعند وجود جانب نظامي مثل العقد أو نقل الخدمات، يكون المرجع النهائي هو قوى ووزارة الموارد البشرية والتنمية الاجتماعية والجهات الرسمية ذات الصلة.',
    conclusion: 'ابدأ في جازان بخطة بحث محددة: مجال واضح، ملف مهني محدث، وقنوات تقديم يمكن التحقق منها. لا تتعامل مع أي وعد على أنه وظيفة مؤكدة، وراجع تفاصيل العقد والإجراءات النظامية من مصادرها الرسمية قبل الانتقال أو الموافقة النهائية.'
  },
  'yemeni-jobs-saudi-restaurants-46226527': {
    intro: 'العمل في المطاعم يعتمد بدرجة كبيرة على وضوح الخبرة العملية: ما الذي تجيده فعلًا، وما نوع المهام التي تستطيع تنفيذها تحت ضغط التشغيل اليومي. لذلك من الأفضل أن يوضح ملفك المهني نوع خبرتك بدقة، سواء كانت في المطبخ أو التحضير أو الخدمة أو الكاشير أو الإشراف.\n\nفي هذا الدليل ستجد طريقة عملية لتنظيم البحث عن عمل في قطاع المطاعم داخل السعودية، وتحسين السيرة الذاتية، والاستعداد للتواصل مع المنشآت، والتحقق من الإعلان قبل مشاركة البيانات أو اتخاذ أي خطوة تعاقدية. المحتوى إرشادي ولا يمثل إعلان توظيف أو ضمانًا بوجود شاغر.',
    conclusion: 'في قطاع المطاعم، ركّز على المهارات التي تستطيع إثباتها، واكتبها بوضوح في السيرة الذاتية، ثم قدّم عبر قنوات يمكن التحقق منها. قارن بين طبيعة العمل والساعات والموقع والمتطلبات قبل القبول، وارجع إلى المصادر الرسمية في أي مسألة تخص العقد أو نقل الخدمات.'
  },
  'yemeni-jobs-saudi-jobs-25065961': {
    intro: 'البحث عن عمل لا يبدأ بكثرة إرسال السيرة الذاتية، بل بتحديد ما تستطيع تقديمه وما نوع الوظائف الأقرب إلى خبرتك. عندما يكون الهدف واضحًا يصبح من الأسهل اختيار الكلمات المناسبة في السيرة الذاتية، وتحديد الشركات والمنصات والقنوات التي تستحق المتابعة.\n\nهذا الدليل يساعد الباحث اليمني داخل السعودية على بناء خطة بحث عملية وآمنة: تجهيز الملف المهني، تنظيم التواصل، تقييم الإعلانات، والاستعداد للمقابلة. كما يوضح متى ينبغي الرجوع إلى قوى أو وزارة الموارد البشرية والتنمية الاجتماعية للتحقق من العقود أو نقل الخدمات.',
    conclusion: 'حوّل البحث عن عمل إلى خطوات قابلة للمتابعة: حدد هدفك المهني، حسّن سيرتك، سجّل الجهات التي تقدمت إليها، وراجع كل عرض قبل قبوله. لا تعتمد على الوعود الشفهية في المسائل النظامية، واستخدم القنوات الرسمية للتحقق من العقد ونقل الخدمات.'
  },
  'yemeni-jobs-dammam-buffet-worker-4bf28d56': {
    intro: 'عند البحث عن عمل كمعلم بوفيه في الدمام، من المهم أن يوضح ملفك نوع خبرتك بدقة بدل الاكتفاء بالمسمى الوظيفي. اذكر ما تتقنه في التحضير، تنظيم الطلبات، النظافة وسلامة الغذاء، التعامل مع ضغط أوقات الذروة، وأي خبرة سابقة في تشغيل البوفيهات أو المطاعم.\n\nيركز هذا المقال على خطوات عملية للباحث اليمني داخل السعودية: تجهيز سيرة ذاتية مناسبة للمهنة، اختيار قنوات البحث، الاستعداد للمقابلة، والتحقق من تفاصيل العرض قبل الاتفاق. وعند وجود إجراءات نظامية، راجع المصدر الرسمي المختص مباشرة.',
    conclusion: 'قوة ملف معلم البوفيه تأتي من التفاصيل العملية القابلة للإثبات. اذكر مهاراتك بوضوح، اسأل عن طبيعة الوردية والمهام والموقع قبل القبول، ولا تشارك بيانات حساسة أو تدفع مبلغًا مقابل وعد بالتوظيف. أي إجراء رسمي يجب التحقق منه عبر الجهة المختصة.'
  },
  'yemeni-jobs-saudi-grill-chef-d687295b': {
    intro: 'الباحث عن عمل كشيف مشويات يحتاج إلى عرض خبرته بصورة عملية: أنواع المشويات التي يجيدها، مستوى التحكم في التحضير والتتبيل والتسوية، تنظيم محطة العمل، وسلامة الغذاء. كلما كان الوصف محددًا، كان من الأسهل على صاحب العمل فهم مستوى الخبرة قبل المقابلة.\n\nهذا الدليل يركز على كيفية تجهيز ملف مهني مناسب لشيف المشويات، الاستعداد للمقابلة العملية، تقييم العرض الوظيفي، والبحث عبر قنوات واضحة يمكن التحقق منها. وهو محتوى إرشادي عام لا يمثل وعدًا بالتوظيف أو إعلانًا عن شاغر محدد.',
    conclusion: 'قدّم خبرتك كشيف مشويات بأمثلة واضحة بدل العبارات العامة، وناقش طبيعة المطبخ والمهام والساعات قبل القبول. تحقق من الجهة والعقد، ولا تعتمد على أي وعد غير موثق أو أي طرف يطلب مبلغًا مقابل ضمان الوظيفة.'
  },
  'yemeni-jobs-saudi-jobs-639efa4e': {
    intro: 'أفضل طريقة لتقليل عشوائية البحث عن عمل هي تحويله إلى روتين منظم: هدف مهني واضح، سيرة ذاتية مناسبة، قائمة جهات للتواصل، ومتابعة لما تم إرساله والردود التي وصلت. بهذه الطريقة تستطيع تحسين أسلوبك بدل تكرار التقديم بالطريقة نفسها.\n\nهذا المقال يقدم للباحث اليمني داخل السعودية خطوات عملية لتنظيم البحث والتواصل المهني والاستعداد للمقابلات، مع التركيز على التحقق من الإعلانات والجهات قبل مشاركة البيانات أو اتخاذ قرارات مرتبطة بالعقد أو نقل الخدمات.',
    conclusion: 'اجعل البحث منظمًا وقابلًا للقياس: تابع أين قدمت، وما الرد الذي حصلت عليه، وما الذي يحتاج إلى تحسين في ملفك. تحقق من هوية الجهة وتفاصيل العرض، وارجع إلى المصادر الرسمية عندما يتعلق الأمر بالعقد أو الإجراءات النظامية.'
  },
  'yemeni-jobs-jeddah-jobs-b98ee3dc': {
    intro: 'البحث عن عمل في جدة يحتاج إلى تضييق نطاق البحث أولًا: اختر المجال الذي يناسب خبرتك، وحدد الأحياء أو مناطق العمل التي يمكنك الوصول إليها، ثم جهز نسخة من سيرتك الذاتية تناسب الوظائف التي تستهدفها. هذه الخطوات تقلل التقديم العشوائي وتجعل التواصل أكثر وضوحًا.\n\nفي هذا الدليل ستجد خطوات عملية للباحث اليمني داخل السعودية لتنظيم البحث في جدة، اختيار قنوات التقديم، الاستعداد للتواصل مع أصحاب العمل، وفحص الإعلان قبل اتخاذ أي خطوة. أما العقود ونقل الخدمات فتُراجع عبر الجهات والمنصات الرسمية المختصة.',
    conclusion: 'في جدة، ابدأ بمجال وموقع يناسبان ظروفك، ثم استخدم سيرة ذاتية موجهة وتابع طلباتك بصورة منظمة. تحقق من الجهة والعرض قبل مشاركة معلومات إضافية، ولا تعتبر أي إعلان أو رسالة ضمانًا بالتوظيف حتى تكتمل الخطوات الرسمية.'
  },
  'yemeni-jobs-riyadh-jobs-ff091adf': {
    intro: 'اتساع مدينة الرياض وتنوع مجالات العمل فيها قد يجعل البحث مشتتًا إذا لم تحدد هدفك من البداية. اختر مجالًا أو اثنين يناسبان خبرتك، حدّث سيرتك الذاتية لكل مسار، وحدد نطاقًا جغرافيًا واقعيًا يناسب تنقلك اليومي قبل إرسال الطلبات.\n\nهذا المقال يساعد الباحث اليمني داخل السعودية على تنظيم البحث في الرياض، اختيار قنوات التقديم، تحسين التواصل المهني، وتقييم الإعلانات بعناية. كما يذكّر بأن تفاصيل العقود ونقل الخدمات يجب التحقق منها من قوى ووزارة الموارد البشرية والتنمية الاجتماعية والجهات الرسمية ذات الصلة.',
    conclusion: 'لا تجعل كثرة الإعلانات في الرياض تدفعك إلى التقديم العشوائي. اختر هدفًا مهنيًا واضحًا، خصص سيرتك، تابع الطلبات، وقارن تفاصيل كل عرض بظروفك الفعلية. وفي المسائل النظامية اعتمد على المصدر الرسمي لا على الرسائل المتداولة.'
  },
  'yemeni-jobs-saudi-jobs-98305259': {
    intro: 'عند الجمع بين البحث عن عمل والسؤال عن نقل الخدمات، من المهم فصل أمرين: العثور على جهة أو فرصة مناسبة، والتحقق من إمكانية وإجراءات الانتقال نظاميًا. وجود عرض وظيفي لا يعني تلقائيًا أن نقل الخدمات متاح أو مكتمل؛ فالإجراء له متطلبات وخطوات رسمية تختلف باختلاف الحالة.\n\nهذا الدليل يساعد الباحث اليمني داخل السعودية على تنظيم البحث، مراجعة العرض قبل الموافقة، ومعرفة الأسئلة التي ينبغي طرحها بشأن العقد ونقل الخدمات. وبحسب وزارة الموارد البشرية والتنمية الاجتماعية، تُقدَّم خدمة نقل خدمات الموظفين عبر منصة قوى، لذلك يجب الرجوع إلى قوى والوزارة للتحقق من الشروط والإجراءات المحدثة.',
    conclusion: 'تعامل مع العرض الوظيفي وإجراء نقل الخدمات كخطوتين تحتاج كل منهما إلى تحقق مستقل. راجع تفاصيل العقد والجهة، ثم تحقق من حالة طلب نقل الخدمات ومتطلباته عبر قوى والجهات الرسمية قبل بناء قرارك على أي وعد شفهي.'
  },
  'yemeni-jobs-saudi-jobs-9c0f8017': {
    intro: 'التقديم الآمن يبدأ قبل الضغط على زر الإرسال: اقرأ متطلبات الوظيفة، تأكد أن خبرتك مناسبة، جهز سيرة ذاتية واضحة، وافحص هوية الجهة وقناة التواصل. هذه الخطوات البسيطة تقلل التقديم العشوائي وتساعدك على التركيز على الفرص الأقرب إلى ملفك.\n\nهذا الدليل مخصص للباحث اليمني داخل السعودية، ويجمع خطوات عملية للبحث والتقديم والاستعداد للمقابلة، مع تنبيهات حول الاحتيال ومشاركة البيانات. وعندما يتعلق الأمر بالعقد أو نقل الخدمات، يجب الرجوع إلى قوى ووزارة الموارد البشرية والتنمية الاجتماعية والمصادر الرسمية ذات الصلة.',
    conclusion: 'التقديم الجيد يجمع بين ملف مهني واضح وتحقق واعٍ من الجهة والعرض. لا ترسل بيانات حساسة قبل معرفة الطرف الذي تتعامل معه، ولا تدفع مقابل وعد بالحصول على وظيفة. راجع العقود والإجراءات النظامية من المصادر الرسمية قبل الموافقة النهائية.'
  }
};

const SAFE_ROLE = 'NEXT JOB مدونة إرشادية مستقلة للعمل والمسار المهني. تقدم محتوى وأدلة عامة تساعد الباحث على تنظيم خطواته والتحقق من المعلومات، ولا تستقبل طلبات التوظيف نيابة عن أصحاب العمل ولا تضمن الحصول على وظيفة أو نقل الخدمات.';
const SAFE_SEARCH = 'يمكنك استخدام مدونة NEXT JOB لتنظيم خطوات البحث عن عمل، ثم التحقق من أي إعلان أو جهة عبر المصدر الأصلي والجهات الرسمية المختصة عند الحاجة.';

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function operationalNextJobClaim(text) {
  return /NEXT JOB/.test(text) && /(منصة|وظائف|الفرص|الشواغر|إعلان|إعلانات|التوظيف|وسيط|الربط بين|تنبيهات|تحديث بيانات|تصفح الإعلانات|التقديم عبر|التقديم على)/.test(text);
}

function softenText(value) {
  let text = String(value);
  text = text
    .replace(/منصة NEXT JOB/g, 'NEXT JOB')
    .replace(/دليل الوظائف/g, 'المدونة')
    .replace(/مركز الأدلة المهنية/g, 'المدونة')
    .replace(/دليل NEXT JOB/g, 'مدونة NEXT JOB')
    .replace(/المهارات الأكثر طلباً/g, 'مهارات مفيدة عند التقديم')
    .replace(/المهارات الأكثر طلبًا/g, 'مهارات مفيدة عند التقديم')
    .replace(/أبرز المهارات المطلوبة/g, 'مهارات مفيدة لتعزيز الملف المهني')
    .replace(/يفتح آفاقاً واسعة للباحثين عن العمل/g, 'يجعل وضوح المهارات والخبرة أمرًا مهمًا عند البحث عن عمل')
    .replace(/يفتح آفاقًا واسعة للباحثين عن العمل/g, 'يجعل وضوح المهارات والخبرة أمرًا مهمًا عند البحث عن عمل')
    .replace(/تزيد من فرص قبوله/g, 'تجعل ملفه أكثر وضوحًا عند المراجعة')
    .replace(/يعزز فرص استكمال خطوات التوظيف/g, 'يساعد على تقديم صورة مهنية أوضح')
    .replace(/يضمن وصولك إلى إعلانات مباشرة ومحدثة/g, 'يساعدك على تنظيم متابعة المصادر التي تختارها')
    .replace(/تضمن الحصول على المعلومات الدقيقة والمحدثة/g, 'تساعد على التحقق من المعلومات والشروط المحدثة')
    .replace(/يضمن بداية مهنية قائمة على الشفافية والاستقرار/g, 'يساعد على وضوح الالتزامات قبل بدء العلاقة التعاقدية');

  if (/يجب التأكيد على أن التوظيف الحقيقي والنظامي لا يتطلب دفع أي رسوم مالية أو رسوم معاملات إدارية من المتقدم للعمل/.test(text)) {
    return 'تعامل بحذر مع أي جهة تطلب مبلغًا مقابل وعد بالحصول على وظيفة، وتحقق من سبب أي رسوم أو مبالغ عبر الجهة الرسمية المختصة قبل الدفع.';
  }
  if (/المطاعم والشركات النظامية لا تتقاضى أي مبالغ مالية من المتقدمين مقابل الحصول على فرصة عمل/.test(text)) {
    return 'تعامل بحذر مع أي جهة تطلب منك مبلغًا مقابل وعد بالتوظيف، وتحقق من هوية الجهة وسبب أي مبلغ عبر القنوات الرسمية قبل الدفع.';
  }
  if (/المنشآت النظامية لا تطلب مقابلاً مالياً من المتقدمين للحصول على وظيفة/.test(text)) {
    return 'تعامل بحذر مع أي طلب مالي مرتبط بوعد بالتوظيف، وتحقق من الجهة والغرض من المبلغ عبر مصدر رسمي قبل الدفع.';
  }
  if (/يجد العامل اليمني في جازان فرصاً متزايدة/.test(text)) {
    return 'يمكن للباحث عن عمل في جازان أن يوسّع بحثه ليشمل البيع بالتجزئة والتجارة العامة والخدمات الفنية والمجالات الميدانية، مع التحقق من كل إعلان أو جهة قبل التقديم.';
  }
  return text;
}

function sanitizeString(value, key = '') {
  let text = softenText(value);

  if (key === 'question' || key === 'name') {
    if (/NEXT JOB/.test(text) && /تضمن|توظيف|نقل/.test(text)) return 'هل يضمن NEXT JOB الحصول على وظيفة أو نقل الخدمات؟';
    if (/NEXT JOB/.test(text) && /كيف.*(?:أجد|أتقدم|التقديم)/.test(text)) return 'كيف أستفيد من مدونة NEXT JOB أثناء البحث عن عمل؟';
    if (/NEXT JOB/.test(text) && /ما دور/.test(text)) return 'ما دور NEXT JOB في رحلة البحث عن عمل؟';
  }

  if (operationalNextJobClaim(text)) {
    return key === 'answer' || key === 'text' ? SAFE_ROLE : SAFE_SEARCH;
  }
  return text;
}

function sanitizeJson(value, key = '') {
  if (Array.isArray(value)) return value.map(item => sanitizeJson(item, key));
  if (value && typeof value === 'object') {
    const next = {};
    for (const [childKey, childValue] of Object.entries(value)) next[childKey] = sanitizeJson(childValue, childKey);
    return next;
  }
  if (typeof value === 'string') return sanitizeString(value, key);
  return value;
}

function applyContentOverride(source, slug) {
  const override = CONTENT[slug];
  if (!override || !source?.article || typeof source.article !== 'object') return source;
  source.article.intro = override.intro;
  source.article.conclusion = override.conclusion;
  return source;
}

function replaceTitleAndDescription(html, oldTitle, oldDescription, nextTitle, nextDescription) {
  let next = html.split(oldTitle).join(nextTitle).split(oldDescription).join(nextDescription);
  next = next.replace(/"dateModified":"[^"]+"/g, `"dateModified":"${LEGACY_UPDATED_AT}"`);
  return next;
}

function sanitizeHtml(html, slug) {
  let next = html;
  const content = CONTENT[slug];
  next = next
    .replace(/دليل الوظائف/g, 'المدونة')
    .replace(/مركز الأدلة المهنية/g, 'المدونة')
    .replace(/منصة NEXT JOB/g, 'NEXT JOB')
    .replace(/هل تضمن(?: منصة)? NEXT JOB[^<]*\?/g, 'هل يضمن NEXT JOB الحصول على وظيفة أو نقل الخدمات؟')
    .replace(/ما دور(?: منصة)? NEXT JOB في عملية التوظيف\?/g, 'ما دور NEXT JOB في رحلة البحث عن عمل؟')
    .replace(/<a[^>]+href=["']\/jobs\/?["'][^>]*>[^<]*<\/a>/gi, '')
    .replace(/<a[^>]+href=["']\/candidates\/?["'][^>]*>[^<]*<\/a>/gi, '')
    .replace(/هل تبحث عن فرصة مناسبة الآن؟/g, 'تابع القراءة في المدونة')
    .replace(/راجع الوظائف المنشورة فعليًا على NEXT JOB[^<]*/g, 'استكشف مقالات المدونة المرتبطة بموضوعك، وارجع إلى المصدر الأصلي لأي إعلان أو جهة عند الحاجة.')
    .replace(/وظائف فعلية وليست وعودًا/g, 'محتوى للتوجيه والتحقق')
    .replace(/المقال للتوجيه فقط\. فرص العمل الفعلية تجدها في قسم الوظائف ويمكنك تصفيتها حسب المدينة والمهنة\./g, 'المقال للتوجيه العام. تحقق من أي إعلان أو جهة عبر المصدر الأصلي، وراجع المصادر الرسمية في المسائل النظامية.')
    .replace(/منصة تقنية للتواصل المباشر حول فرص العمل دون عمولات توظيف\./g, 'مدونة إرشادية مستقلة للعمل والمسار المهني.')
    .replace(/>المقالات</g, '>المدونة<')
    .replace(/>العودة إلى دليل المقالات</g, '>العودة إلى المدونة<');

  if (content?.conclusion) {
    next = next.replace(/(<section class="summary-box" id="summary">[\s\S]*?<p>)[\s\S]*?(<\/p>\s*<\/section>)/, `$1${content.conclusion}$2`);
  }

  next = next.replace(/<p>([^<]*NEXT JOB[^<]*)<\/p>/g, (full, text) => {
    const cleaned = sanitizeString(text, 'paragraph');
    return `<p>${cleaned}</p>`;
  });

  next = next.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (full, raw) => {
    try {
      const parsed = JSON.parse(raw);
      return `<script type="application/ld+json">${JSON.stringify(sanitizeJson(parsed)).replace(/</g, '\\u003c')}</script>`;
    } catch {
      return full.replace(/دليل الوظائف/g, 'المدونة').replace(/منصة NEXT JOB/g, 'NEXT JOB');
    }
  });

  return next;
}

function updateManifest() {
  const manifest = readJson(MANIFEST_FILE, []);
  if (!Array.isArray(manifest)) return;
  let changed = false;
  const next = manifest.map(item => {
    const override = OVERRIDES[item?.slug];
    if (!override) return item;
    const updated = { ...item, title: override.title, description: override.description, modifiedAt: LEGACY_UPDATED_AT };
    if (JSON.stringify(updated) !== JSON.stringify(item)) changed = true;
    return updated;
  });
  if (changed) writeJson(MANIFEST_FILE, next);
}

function updatePublishedSources() {
  if (!fs.existsSync(PUBLISHED_DIR)) return;
  for (const [slug, override] of Object.entries(OVERRIDES)) {
    const file = path.join(PUBLISHED_DIR, `${slug}.json`);
    if (!fs.existsSync(file)) continue;
    const source = readJson(file, null);
    if (!source || typeof source !== 'object') continue;
    const next = applyContentOverride(sanitizeJson(source), slug);
    next.title = override.title;
    next.description = override.description;
    next.modifiedAt = LEGACY_UPDATED_AT;
    if (next.article && typeof next.article === 'object') {
      next.article.title = override.title;
      next.article.metaDescription = override.description;
      if (Array.isArray(next.article.sections)) {
        next.article.sections = next.article.sections.map(section => ({
          ...section,
          heading: sanitizeString(section.heading || '', 'heading'),
          paragraphs: Array.isArray(section.paragraphs) ? section.paragraphs.map(p => sanitizeString(p, 'paragraph')) : []
        }));
      }
      if (Array.isArray(next.article.faq)) {
        next.article.faq = next.article.faq.map(item => ({
          ...item,
          question: sanitizeString(item.question || '', 'question'),
          answer: sanitizeString(item.answer || '', 'answer')
        }));
      }
    }
    writeJson(file, next);
  }
}

function updateHtmlArticles() {
  const manifest = readJson(MANIFEST_FILE, []);
  for (const [slug, override] of Object.entries(OVERRIDES)) {
    const file = path.join(GUIDE_DIR, slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    const source = fs.readFileSync(file, 'utf8');
    const published = readJson(path.join(PUBLISHED_DIR, `${slug}.json`), {});
    const oldTitle = published?.article?.title || published?.title || manifest.find(item => item.slug === slug)?.title || override.title;
    const oldDescription = published?.article?.metaDescription || published?.description || manifest.find(item => item.slug === slug)?.description || override.description;
    let next = replaceTitleAndDescription(source, oldTitle, oldDescription, override.title, override.description);
    next = sanitizeHtml(next, slug);
    if (next !== source) fs.writeFileSync(file, next, 'utf8');
  }
}

// HTML may still contain pre-modernization copy, so clean rendered files both before and after source JSON updates.
updateHtmlArticles();
updateManifest();
updatePublishedSources();
updateHtmlArticles();
console.log(`Legacy guidance articles deeply modernized: ${Object.keys(OVERRIDES).length}.`);
