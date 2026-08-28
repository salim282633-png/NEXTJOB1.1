import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const MANIFEST_FILE = path.join(GUIDE_DIR, 'articles.json');
const SITEMAP_FILE = path.join(ROOT, 'public/sitemap.xml');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');

const CATEGORIES = [
  {
    slug: 'job-search',
    title: 'البحث عن عمل',
    description: 'أدلة عملية تساعد الباحث اليمني في السعودية على تنظيم البحث عن عمل، اختيار قنوات التقديم، تقييم الإعلانات، وتحسين خطوات الوصول إلى فرصة مناسبة.',
    intro: [
      'البحث عن عمل لا يعتمد على كثرة إرسال الطلبات فقط، بل على وضوح الهدف، اختيار القنوات المناسبة، تخصيص التقديم، ثم متابعة النتائج بطريقة منظمة. هذا القسم يجمع إرشادات تساعد الباحث اليمني في السعودية على بناء عملية بحث أكثر وضوحًا وأقل عشوائية.',
      'ستجد هنا محتوى عن تخطيط البحث، قراءة الإعلان، التحقق من الجهة، الاستفادة من مواقع الشركات، كتابة رسائل التقديم، وتجنب الأخطاء التي تقلل فرص الوصول إلى مقابلة. لا يقدم NEXT JOB وعودًا بالتوظيف أو وساطة بين الباحث وصاحب العمل؛ الهدف هو تحسين قراراتك وخطواتك المهنية.'
    ],
    takeaways: ['بناء خطة بحث أسبوعية قابلة للقياس', 'اختيار قنوات التقديم المناسبة بدل التقديم العشوائي', 'قراءة متطلبات الإعلان قبل إرسال الطلب', 'التحقق من الجهة والمصدر قبل مشاركة البيانات', 'متابعة الطلبات وتطوير الأسلوب بناءً على النتائج'],
    faq: [
      { q: 'ما أفضل طريقة للبدء في البحث عن عمل داخل السعودية؟', a: 'ابدأ بتحديد المهن التي تناسب خبرتك، جهز سيرة ذاتية واضحة، ثم استخدم قنوات موثوقة مثل مواقع الشركات والمنصات المهنية المعروفة. سجّل الطلبات التي أرسلتها وتابع النتائج بدل إرسال طلبات كثيرة دون خطة.' },
      { q: 'هل يجب إرسال نفس السيرة الذاتية لكل وظيفة؟', a: 'الأفضل تعديل الجزء الأكثر صلة من السيرة الذاتية بما يناسب متطلبات كل دور، دون اختلاق خبرات أو مهارات غير حقيقية. التخصيص البسيط والواضح يجعل الطلب أسهل للفهم.' },
      { q: 'كيف أعرف أن إعلان العمل يستحق التقديم؟', a: 'راجع اسم الجهة، وصف الدور، المتطلبات، وسيلة التقديم، ومدى توافقها مع خبرتك. إذا كان الإعلان غامضًا أو يطلب دفع مبلغ أو بيانات حساسة مبكرًا، فتحقق أكثر قبل أي خطوة.' }
    ],
    related: ['cv', 'interviews', 'safety']
  },
  {
    slug: 'cv',
    title: 'السيرة الذاتية',
    description: 'إرشادات عملية لكتابة وتحسين السيرة الذاتية والملف المهني لليمنيين في السعودية، مع التركيز على الوضوح وإبراز الخبرة والمهارات ذات الصلة.',
    intro: [
      'السيرة الذاتية هي ملخص مهني سريع يساعد مسؤول التوظيف على فهم خبرتك وما تستطيع إضافته للدور. قوة السيرة لا تأتي من كثرة الصفحات أو الزخرفة، بل من ترتيب المعلومات ووضوح الإنجازات وربط الخبرة بالوظيفة المستهدفة.',
      'في هذا القسم ستجد إرشادات حول بناء الأقسام الأساسية، كتابة الملخص المهني، عرض الخبرات والمهارات، تقليل المعلومات غير الضرورية، ومراجعة السيرة قبل إرسالها. الهدف أن تكون الوثيقة سهلة القراءة وصادقة ومناسبة للسوق المهني الذي تستهدفه.'
    ],
    takeaways: ['كتابة ملخص مهني مختصر وواضح', 'عرض الخبرات بترتيب يسهل قراءته', 'إبراز الإنجازات والمهارات المرتبطة بالدور', 'تجنب المعلومات المكررة أو غير الضرورية', 'مراجعة اللغة والتنسيق قبل الإرسال'],
    faq: [
      { q: 'كم صفحة يفضل أن تكون السيرة الذاتية؟', a: 'لا يوجد رقم واحد مناسب للجميع. غالبًا تكفي صفحة أو صفحتان عندما يمكن عرض الخبرة بوضوح، والأهم حذف الحشو والإبقاء على المعلومات التي تساعد على تقييم ملاءمتك للدور.' },
      { q: 'هل أضع صورة شخصية في السيرة الذاتية؟', a: 'يعتمد ذلك على طبيعة المجال ومتطلبات الجهة. إذا لم تكن الصورة مطلوبة، فالأولوية للمحتوى المهني. وعند استخدامها يجب أن تكون مهنية ولا تشغل مساحة كبيرة من السيرة.' },
      { q: 'ما أهم جزء في السيرة الذاتية؟', a: 'لا يوجد قسم واحد منفصل عن البقية، لكن الخبرة والمهارات المرتبطة بالدور والملخص المهني الواضح هي أكثر الأجزاء التي تساعد القارئ على فهم ملاءمتك بسرعة.' }
    ],
    related: ['job-search', 'interviews', 'professions']
  },
  {
    slug: 'interviews',
    title: 'المقابلات',
    description: 'أدلة للاستعداد لمقابلات العمل، تنظيم الإجابات، عرض الخبرات بثقة ووضوح، وطرح الأسئلة المناسبة قبل اتخاذ القرار المهني.',
    intro: [
      'المقابلة ليست اختبارًا لحفظ إجابات نموذجية، بل فرصة لشرح خبرتك وطريقة تفكيرك ومدى توافقك مع الدور. الاستعداد الجيد يبدأ بفهم وصف الوظيفة والجهة، ثم اختيار أمثلة حقيقية من خبرتك تدعم ما تقوله.',
      'يجمع هذا القسم إرشادات حول الأسئلة الشائعة، طريقة تنظيم الإجابات، الاستعداد للمقابلات الحضورية أو عن بعد، وما ينبغي أن تسأل عنه أنت أيضًا. كلما كانت إجاباتك محددة ومدعومة بمواقف واقعية كان تقييم خبرتك أسهل.'
    ],
    takeaways: ['فهم الدور والجهة قبل المقابلة', 'تحضير أمثلة حقيقية من الخبرة السابقة', 'تنظيم الإجابات بدل الإطالة', 'الاستعداد للأسئلة المهنية والسلوكية', 'تجهيز أسئلة تساعدك على تقييم العرض والبيئة'],
    faq: [
      { q: 'كيف أجيب عن سؤال حدثني عن نفسك؟', a: 'ابدأ بخلفيتك المهنية الحالية، ثم اذكر أبرز خبراتك أو مهاراتك المرتبطة بالدور، واختم بسبب اهتمامك بهذه الخطوة. اجعل الإجابة مختصرة ومهنية بدل سرد تفاصيل شخصية طويلة.' },
      { q: 'ماذا أفعل إذا لم أعرف إجابة سؤال في المقابلة؟', a: 'كن واضحًا ولا تختلق معلومة. يمكنك شرح ما تعرفه، كيف ستبحث عن الإجابة، أو تقديم مثال قريب من خبرتك. الصدق وطريقة التفكير أفضل من إجابة غير دقيقة.' },
      { q: 'هل من المناسب أن أسأل عن الراتب في المقابلة؟', a: 'يمكن مناقشة التعويض عندما يفتح الطرف الآخر الموضوع أو عند الوصول إلى مرحلة مناسبة من العملية. قبل القرار النهائي افهم الراتب والمزايا وساعات العمل وبقية عناصر العرض بوضوح.' }
    ],
    related: ['cv', 'contracts', 'job-search']
  },
  {
    slug: 'contracts',
    title: 'العقود',
    description: 'محتوى إرشادي يساعد اليمنيين في السعودية على معرفة النقاط التي تستحق المراجعة قبل قبول أو توقيع عقد عمل، مع الرجوع للجهات الرسمية للمعلومات النظامية السارية.',
    intro: [
      'قراءة عقد العمل بهدوء قبل التوقيع خطوة أساسية لفهم ما تم الاتفاق عليه فعليًا. من المهم ألا تكتفي بالوعود الشفهية، وأن تراجع البنود المتعلقة بالمسمى، الأجر، مكان العمل، المدة، ساعات العمل، المزايا، وأي التزامات أخرى واردة في العقد.',
      'هذا القسم يقدم إطارًا عامًا يساعدك على طرح الأسئلة الصحيحة ومقارنة ما ورد في العرض بما ورد في العقد. أما الأحكام النظامية والإجراءات والمتطلبات المتغيرة فمرجعها النهائي هو الجهة الرسمية المختصة والمعلومات السارية على حالتك.'
    ],
    takeaways: ['مطابقة المسمى والمهام مع ما تم الاتفاق عليه', 'فهم الأجر والمزايا وآلية الدفع', 'مراجعة مدة العقد ومكان وساعات العمل', 'قراءة الالتزامات والشروط قبل الموافقة', 'الرجوع للمصدر الرسمي عند أي نقطة نظامية متغيرة'],
    faq: [
      { q: 'ما الذي أراجعه أولًا قبل توقيع عقد العمل؟', a: 'ابدأ بالبيانات الأساسية: اسم الجهة، المسمى، الأجر، مكان العمل، مدة العقد، ساعات العمل، المزايا، وتاريخ البداية. قارنها بما تم الاتفاق عليه واسأل عن أي بند غير واضح قبل الموافقة.' },
      { q: 'هل يكفي الاتفاق الشفهي على الراتب أو المزايا؟', a: 'الأفضل أن تكون العناصر الأساسية واضحة في العرض أو العقد أو المستند الرسمي المعتمد، لأن الاعتماد على الوعود الشفهية وحدها قد يسبب خلافًا لاحقًا.' },
      { q: 'أين أتحقق من الأحكام النظامية الحالية؟', a: 'للأحكام والإجراءات التي قد تتغير، ارجع إلى وزارة الموارد البشرية والتنمية الاجتماعية ومنصة قوى أو الجهة الرسمية المختصة، وتحقق من المعلومات السارية على حالتك قبل اتخاذ القرار.' }
    ],
    related: ['sponsorship', 'safety', 'interviews']
  },
  {
    slug: 'sponsorship',
    title: 'نقل الخدمات',
    description: 'أدلة توعوية حول الأسئلة والخطوات التي ينبغي التحقق منها عند موضوع نقل الخدمات في السعودية، مع التأكيد أن المصدر الرسمي هو المرجع النهائي للإجراءات والشروط الحالية.',
    intro: [
      'نقل الخدمات موضوع يرتبط بإجراءات وشروط قد تختلف بحسب الحالة وتتغير مع تحديث الأنظمة والخدمات الإلكترونية. لذلك من المهم فصل المعلومات العامة عن القرار الفعلي، وعدم الاعتماد على رسائل متداولة أو وعود غير موثقة.',
      'يركز هذا القسم على ما ينبغي التحقق منه، الوثائق والأسئلة التي تساعدك على فهم وضعك، وكيفية الرجوع إلى قوى والجهات الرسمية المختصة. NEXT JOB لا ينفذ نقل الخدمات ولا يتوسط فيه، وإنما يقدم محتوى إرشاديًا عامًا فقط.'
    ],
    takeaways: ['تحديد الإجراء المطلوب وحالتك قبل البدء', 'التحقق من الطلب عبر القنوات الرسمية', 'مراجعة بيانات العقد والجهة المرتبطة بالإجراء', 'عدم دفع مبالغ بناءً على وعود غير موثقة', 'الرجوع إلى قوى أو الجهة الرسمية عند اختلاف المعلومات'],
    faq: [
      { q: 'هل يمكن الاعتماد على شرح قديم لإجراءات نقل الخدمات؟', a: 'لا يفضل ذلك لأن الإجراءات والشروط والخدمات الإلكترونية قد تتغير. استخدم المحتوى القديم لفهم الفكرة فقط، ثم تحقق من الخطوات الحالية عبر المنصة أو الجهة الرسمية المختصة.' },
      { q: 'هل ينفذ NEXT JOB إجراءات نقل الخدمات؟', a: 'لا. NEXT JOB مركز إرشادي ولا ينفذ نقل الخدمات ولا يمثل المستخدم أمام أي جهة، ولا يضمن قبول أي طلب.' },
      { q: 'ماذا أفعل إذا وجدت معلومات متعارضة عن الإجراء؟', a: 'قدّم المعلومات المنشورة في المصدر الرسمي الحالي على الشروحات غير الرسمية، وإذا بقيت الحالة غير واضحة فاستفسر من الجهة المختصة قبل اتخاذ إجراء أو دفع أي مبلغ.' }
    ],
    related: ['contracts', 'safety', 'job-search']
  },
  {
    slug: 'safety',
    title: 'الأمان وتجنب الاحتيال',
    description: 'إرشادات تساعد الباحث اليمني في السعودية على اكتشاف مؤشرات الاحتيال في عروض العمل، حماية بياناته، والتحقق من الجهات والرسائل قبل التقديم أو الدفع.',
    intro: [
      'الحاجة إلى العمل قد تجعل بعض الباحثين يتفاعلون بسرعة مع الرسائل والعروض، وهذا ما تستغله الجهات أو الحسابات غير الموثوقة. الحذر لا يعني رفض كل فرصة، بل التحقق من هوية الجهة وطبيعة الطلب قبل مشاركة بيانات أو تحويل مبالغ.',
      'في هذا القسم ستتعرف على مؤشرات التحذير مثل الوعود المبالغ فيها، طلب الأموال مقابل ضمان التوظيف، الروابط المشبوهة، والأسئلة التي لا تتناسب مع مرحلة التقديم. الهدف هو أن تتخذ الخطوة التالية بعد تحقق مناسب، لا تحت ضغط الاستعجال.'
    ],
    takeaways: ['التحقق من اسم الجهة وقنواتها الرسمية', 'عدم دفع مقابل وعد مضمون بالتوظيف', 'الحذر من الروابط والملفات غير الموثوقة', 'عدم مشاركة بيانات مالية أو رموز تحقق', 'توثيق الرسائل والتوقف عند أي طلب غير منطقي'],
    faq: [
      { q: 'هل طلب رسوم مقابل ضمان الوظيفة علامة خطر؟', a: 'نعم، الوعود المضمونة بالتوظيف مقابل دفع مبلغ تستحق حذرًا شديدًا. لا تدفع قبل فهم الجهة والخدمة والتحقق من مشروعيتها، ولا تعتمد على ضمانات غير موثقة.' },
      { q: 'ما البيانات التي يجب الحذر من مشاركتها؟', a: 'لا تشارك كلمات المرور أو رموز التحقق أو بيانات البطاقات البنكية. وأي مستند شخصي يجب مشاركته فقط عند وجود حاجة واضحة ومع جهة يمكن التحقق منها.' },
      { q: 'كيف أتحقق من رابط التقديم؟', a: 'افحص اسم النطاق وتأكد أنه يخص الجهة أو منصة معروفة، وابحث عن الإعلان من خلال الموقع الرسمي بدل فتح رابط مجهول مباشرة عندما يكون لديك شك.' }
    ],
    related: ['job-search', 'contracts', 'sponsorship']
  },
  {
    slug: 'cities',
    title: 'أدلة المدن',
    description: 'محتوى يساعد الباحث اليمني على تنظيم البحث المهني حسب مدن السعودية وفهم أثر الموقع والتنقل والقطاعات المحلية على قراراته المهنية.',
    intro: [
      'اختيار المدينة جزء من القرار المهني، لأن طبيعة القطاعات، تكاليف التنقل، مكان السكن، وساعات العمل قد تجعل فرصة مناسبة على الورق أقل ملاءمة في الواقع. لذلك من المفيد تقييم الوظيفة والمدينة معًا بدل النظر إلى المسمى والراتب فقط.',
      'تجمع هذه الصفحة الأدلة المرتبطة بمدن السعودية، مع التركيز على طريقة البحث واتخاذ القرار وليس على ادعاء وجود عدد معين من الشواغر. استخدم أدلة المدن كنقطة بداية لفهم الأسئلة التي ينبغي أن تطرحها قبل الانتقال أو قبول عرض.'
    ],
    takeaways: ['تقييم موقع العمل والمسافة قبل القبول', 'مقارنة السكن والتنقل مع الدخل المتوقع', 'فهم القطاعات المنتشرة في المدينة المستهدفة', 'توسيع البحث جغرافيًا عندما يكون ذلك مناسبًا', 'عدم الانتقال قبل وضوح العرض وترتيبات العمل'],
    faq: [
      { q: 'هل الأفضل حصر البحث في مدينة واحدة؟', a: 'يعتمد ذلك على ظروفك وإمكانية التنقل أو الانتقال. إذا كان المجال محدودًا في مدينتك فقد يفيد توسيع النطاق، لكن قيّم السكن والنقل والتكلفة قبل اتخاذ أي قرار.' },
      { q: 'ما الذي يجب حسابه قبل الانتقال بسبب العمل؟', a: 'راجع صافي الدخل المتوقع مقابل السكن والنقل والمعيشة، إضافة إلى استقرار العرض ومكان العمل وساعات الدوام ومدى ملاءمة الانتقال لظروفك.' },
      { q: 'هل أدلة المدن تعني وجود شواغر حالية؟', a: 'لا. أدلة المدن محتوى إرشادي يساعد على فهم البحث والقرار المهني حسب الموقع، ولا تعني وجود وظائف حية أو عدد محدد من الشواغر.' }
    ],
    related: ['professions', 'job-search', 'safety']
  },
  {
    slug: 'professions',
    title: 'أدلة المهن والقطاعات',
    description: 'أدلة تساعد اليمنيين في السعودية على فهم المهارات والخبرات وطريقة تقديم أنفسهم في مهن وقطاعات مختلفة وبناء مسار مهني أكثر وضوحًا.',
    intro: [
      'لكل مهنة طريقة مختلفة في عرض الخبرة وإثبات المهارات. ما يحتاجه مصمم أو فني أو موظف مبيعات في ملفه المهني ومقابلته ليس مطابقًا لما يحتاجه العامل في مجال آخر، لذلك يفيد فهم متطلبات القطاع قبل إعداد الطلب.',
      'هذا القسم يجمع الأدلة المرتبطة بالمهن والقطاعات، ويركز على المهارات القابلة للإثبات، الخبرة العملية، أسلوب عرض الإنجازات، وكيفية تحديد نقاط النقص التي يمكن تطويرها. الهدف هو تحسين الاستعداد المهني وليس تقديم ضمان لوجود شواغر أو قبول.'
    ],
    takeaways: ['فهم المهارات الأساسية للمجال المستهدف', 'ترجمة الخبرة السابقة إلى نقاط واضحة', 'تحديد المهارات التي تحتاج إلى تطوير', 'تخصيص السيرة والمقابلة حسب المهنة', 'بناء أمثلة أو أعمال تثبت القدرة عندما يناسب المجال'],
    faq: [
      { q: 'كيف أختار المهنة المناسبة لخبرتي؟', a: 'ابدأ بما قمت به فعليًا، المهارات التي تستطيع إثباتها، ونوع العمل الذي تستطيع الاستمرار فيه. قارن ذلك بمتطلبات الأدوار المستهدفة وحدد الفجوات التي يمكن تطويرها.' },
      { q: 'هل يمكن الانتقال إلى مجال جديد بدون خبرة مباشرة؟', a: 'قد يكون ممكنًا إذا كانت لديك مهارات قابلة للنقل ويمكنك إثبات استعدادك للمجال الجديد. ابدأ بأدوار قريبة من خبرتك، تعلم الأساسيات، وابنِ أمثلة عملية عندما يكون ذلك مناسبًا.' },
      { q: 'هل الشهادة أهم من الخبرة في كل المهن؟', a: 'لا توجد قاعدة واحدة لجميع المجالات. بعض الأدوار تتطلب مؤهلات أو تراخيص محددة، بينما تعتمد أخرى أكثر على الخبرة والمهارة. راجع متطلبات كل دور ولا تفترض أن معيارًا واحدًا ينطبق على الجميع.' }
    ],
    related: ['cv', 'interviews', 'cities']
  }
];

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function categorySlugsFor(article) {
  const intent = String(article.intent || '').toLowerCase();
  const text = `${article.title || ''} ${article.description || ''} ${article.keyword || ''}`;
  const slugs = new Set();

  if (/سيرة ذاتية|السيره الذاتيه|cv|سي في/i.test(text) || intent.includes('cv')) slugs.add('cv');
  if (/مقابلة|مقابلات|اسئلة مقابلة|أسئلة مقابلة/i.test(text) || intent.includes('interview')) slugs.add('interviews');
  if (/عقد العمل|العقد|العقود|قبل التوقيع/i.test(text) || intent.includes('contract')) slugs.add('contracts');
  if (/نقل الخدمات|نقل الكفالة/i.test(text) || intent.includes('sponsorship')) slugs.add('sponsorship');
  if (/احتيال|نصب|وهمي|مشبوه|الأمان|الامان/i.test(text) || intent.includes('safety')) slugs.add('safety');
  if (article.city || intent.includes('city')) slugs.add('cities');
  if (article.profession || intent.includes('profession') || intent === 'sector') slugs.add('professions');
  if (/بحث عن عمل|التقديم|فرص عمل|وظائف|بدون خبرة|دوام جزئي|رسالة واتساب/i.test(text) || ['jobs', 'application-guide', 'application-message', 'no-experience', 'part-time', 'benefit', 'manual'].includes(intent)) slugs.add('job-search');

  if (!slugs.size) slugs.add('job-search');
  return [...slugs];
}

function articleCard(article) {
  return `<article class="card">
    <div class="meta">${escapeHtml(article.publishedDate || '')}${article.city ? ` · ${escapeHtml(article.city)}` : ''}${article.profession ? ` · ${escapeHtml(article.profession)}` : ''}</div>
    <h2><a href="/guide/${escapeHtml(article.slug)}/">${escapeHtml(article.title)}</a></h2>
    <p>${escapeHtml(article.description || '')}</p>
    <a class="read" href="/guide/${escapeHtml(article.slug)}/">قراءة الدليل ←</a>
  </article>`;
}

function categoryPage(category, articles) {
  const canonical = `${SITE_URL}/guide/${category.slug}/`;
  const items = articles.map((article, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${SITE_URL}/guide/${article.slug}/`,
    name: article.title
  }));
  const graph = [
    {
      '@type': 'CollectionPage',
      '@id': canonical,
      name: `${category.title} لليمنيين في السعودية | NEXT JOB`,
      description: category.description,
      url: canonical,
      inLanguage: 'ar-SA',
      isPartOf: { '@type': 'WebSite', name: 'NEXT JOB', url: `${SITE_URL}/` },
      mainEntity: { '@type': 'ItemList', itemListElement: items }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'المقالات والأدلة', item: `${SITE_URL}/guide/` },
        { '@type': 'ListItem', position: 3, name: category.title, item: canonical }
      ]
    },
    {
      '@type': 'FAQPage',
      mainEntity: category.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    }
  ];
  const schema = { '@context': 'https://schema.org', '@graph': graph };
  const relatedSlugs = new Set(category.related || []);
  const related = CATEGORIES
    .filter(item => relatedSlugs.has(item.slug))
    .map(item => `<a href="/guide/${item.slug}/">${escapeHtml(item.title)}</a>`)
    .join('');
  const intro = category.intro.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
  const takeaways = category.takeaways.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  const faq = category.faq.map(item => `<details class="faq"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(category.title)} لليمنيين في السعودية | NEXT JOB</title>
  <meta name="description" content="${escapeHtml(category.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:site_name" content="NEXT JOB">
  <meta property="og:title" content="${escapeHtml(category.title)} لليمنيين في السعودية | NEXT JOB">
  <meta property="og:description" content="${escapeHtml(category.description)}">
  <meta property="og:url" content="${canonical}">
  <script type="application/ld+json">${safeJson(schema)}</script>
  <style>
    :root{--bg:#f7faf8;--surface:#fff;--ink:#10211c;--muted:#66756f;--line:#dfe9e4;--green:#0f7a55;--dark:#0b4f3b;--soft:#eaf7f0;--soft2:#f3f8f5}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Tahoma,Arial,sans-serif;line-height:1.9}a{text-decoration:none;color:inherit}.shell{max-width:1080px;margin:auto;padding:0 18px}.top{background:#fff;border-bottom:1px solid var(--line)}.top .shell{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{font-weight:900;font-size:20px;color:var(--dark)}.topnav{display:flex;gap:8px;font-size:13px}.topnav a{padding:8px 10px;border-radius:10px}.topnav a:hover{background:var(--soft)}.hero{padding:44px 0 20px}.hero-card{background:linear-gradient(145deg,#0b4f3b,#0f7a55);color:#fff;border-radius:30px;padding:36px}.crumbs{font-size:12px;color:#ccecdf}.hero h1{font-size:clamp(30px,5vw,48px);line-height:1.3;margin:12px 0}.hero p{max-width:830px;color:#ddf5ea;margin:0}.count{margin-top:18px;font-size:13px;color:#bfe8d7}.content-panel{background:#fff;border:1px solid var(--line);border-radius:26px;padding:28px;margin:8px 0 22px}.content-panel h2,.section-title h2{font-size:23px;line-height:1.45;margin:0 0 12px}.content-panel p{color:#455851;font-size:15px;margin:0 0 14px}.content-panel p:last-child{margin-bottom:0}.takeaways{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:18px 0 0;padding:0;list-style:none}.takeaways li{position:relative;background:var(--soft2);border:1px solid var(--line);border-radius:14px;padding:11px 36px 11px 12px;font-size:13px;color:#43554e}.takeaways li:before{content:'✓';position:absolute;right:13px;top:10px;color:var(--green);font-weight:900}.section-title{display:flex;align-items:end;justify-content:space-between;gap:14px;margin:30px 0 12px}.section-title p{font-size:12px;color:var(--muted);margin:0}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:0 0 30px}.card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px;display:flex;flex-direction:column;min-height:230px}.card h2{font-size:20px;line-height:1.5;margin:8px 0}.card p{font-size:14px;color:var(--muted);margin:0 0 18px}.meta{font-size:11px;color:#7f8f88}.read{margin-top:auto;color:var(--green);font-weight:900;font-size:13px}.empty{background:#fff;border:1px dashed #c9d8d1;border-radius:20px;padding:28px;text-align:center;color:var(--muted);margin-bottom:28px}.faq-wrap{background:#fff;border:1px solid var(--line);border-radius:24px;padding:24px;margin-bottom:22px}.faq-wrap h2{font-size:22px;margin:0 0 12px}.faq{border-top:1px solid var(--line);padding:4px 0}.faq:first-of-type{border-top:0}.faq summary{cursor:pointer;padding:13px 0;font-weight:800;font-size:14px;color:#163c30}.faq p{margin:0 0 14px;color:var(--muted);font-size:13px}.related{background:#fff;border:1px solid var(--line);border-radius:24px;padding:22px;margin-bottom:38px}.related h2{font-size:18px;margin:0 0 12px}.chips{display:flex;flex-wrap:wrap;gap:8px}.chips a{background:var(--soft);color:var(--dark);padding:8px 11px;border-radius:999px;font-size:12px;font-weight:800}.note{font-size:12px;color:#6e7d77;margin-top:16px}.footer{text-align:center;color:#77867f;font-size:12px;padding:28px 0 44px}@media(max-width:720px){.grid,.takeaways{grid-template-columns:1fr}.topnav a:nth-child(n+3){display:none}.hero-card{padding:26px}.content-panel{padding:22px}.section-title{display:block}.section-title p{margin-top:6px}}
  </style>
</head>
<body>
  <header class="top"><div class="shell"><a class="brand" href="/">NEXT JOB</a><nav class="topnav"><a href="/guide/">كل الأدلة</a><a href="/guide/job-search/">البحث عن عمل</a><a href="/guide/safety/">الأمان المهني</a></nav></div></header>
  <main class="shell">
    <section class="hero"><div class="hero-card"><div class="crumbs"><a href="/guide/">مركز NEXT JOB الإرشادي</a> / ${escapeHtml(category.title)}</div><h1>${escapeHtml(category.title)} لليمنيين في السعودية</h1><p>${escapeHtml(category.description)}</p><div class="count">${articles.length ? `${articles.length} مقالًا أو دليلًا مرتبطًا بهذا المسار` : 'صفحة إرشادية أساسية وسيضاف إليها المحتوى المرتبط تلقائيًا'}</div></div></section>

    <section class="content-panel" aria-labelledby="about-${escapeHtml(category.slug)}">
      <h2 id="about-${escapeHtml(category.slug)}">دليل ${escapeHtml(category.title)}: من أين تبدأ؟</h2>
      ${intro}
      <h2 style="font-size:18px;margin-top:24px">ما الذي ستجده في هذا المسار؟</h2>
      <ul class="takeaways">${takeaways}</ul>
    </section>

    <div class="section-title"><h2>أحدث الأدلة في ${escapeHtml(category.title)}</h2><p>محتوى مرتبط بالموضوع يُحدّث مع نشر أدلة جديدة</p></div>
    ${articles.length ? `<section class="grid" aria-label="مقالات ${escapeHtml(category.title)}">${articles.map(articleCard).join('\n')}</section>` : '<div class="empty">سيظهر المحتوى المرتبط هنا تلقائيًا عند نشر أدلة جديدة. يمكنك الاستفادة الآن من الشرح والأسئلة الشائعة في هذه الصفحة.</div>'}

    <section class="faq-wrap" aria-labelledby="faq-title"><h2 id="faq-title">أسئلة شائعة حول ${escapeHtml(category.title)}</h2>${faq}</section>

    <section class="related"><h2>الخطوة التالية في دليلك المهني</h2><div class="chips">${related}</div><p class="note">المحتوى إرشادي عام لليمنيين داخل السعودية. عند التعامل مع عقد أو نقل خدمات أو إجراء حكومي، تحقق من المصدر الرسمي المختص والمعلومات السارية على حالتك قبل اتخاذ أي قرار.</p></section>
  </main>
  <footer class="footer">NEXT JOB — مركز إرشادي للعمل والمسار المهني لليمنيين في السعودية.</footer>
</body>
</html>`;
}

function ensureCategoryPages(manifest) {
  const map = new Map(CATEGORIES.map(category => [category.slug, []]));
  for (const article of manifest) {
    for (const slug of categorySlugsFor(article)) map.get(slug)?.push(article);
  }

  for (const category of CATEGORIES) {
    const dir = path.join(GUIDE_DIR, category.slug);
    fs.mkdirSync(dir, { recursive: true });
    const articles = (map.get(category.slug) || []).sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));
    fs.writeFileSync(path.join(dir, 'index.html'), categoryPage(category, articles), 'utf8');
  }
}

function injectArticleLinks(manifest) {
  for (const article of manifest) {
    const file = path.join(GUIDE_DIR, article.slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/<!-- NEXTJOB_TOPIC_LINKS_START -->[\s\S]*?<!-- NEXTJOB_TOPIC_LINKS_END -->/g, '');
    const links = categorySlugsFor(article)
      .map(slug => CATEGORIES.find(item => item.slug === slug))
      .filter(Boolean)
      .map(category => `<a href="/guide/${category.slug}/" style="display:inline-block;margin:4px;padding:7px 10px;border-radius:999px;background:#eaf7f0;color:#0b4f3b;text-decoration:none;font-size:12px;font-weight:700">${escapeHtml(category.title)}</a>`)
      .join('');
    const block = `<!-- NEXTJOB_TOPIC_LINKS_START --><nav aria-label="موضوعات مرتبطة" style="margin:28px 0;padding:16px;border:1px solid #dfe9e4;border-radius:16px;background:#f8fbf9"><div style="font-weight:800;margin-bottom:8px">موضوعات مرتبطة بهذا الدليل</div>${links}<a href="/guide/" style="display:inline-block;margin:4px;padding:7px 10px;border-radius:999px;background:#0f7a55;color:white;text-decoration:none;font-size:12px;font-weight:700">كل الأدلة</a></nav><!-- NEXTJOB_TOPIC_LINKS_END -->`;
    if (html.includes('</article>')) html = html.replace('</article>', `${block}</article>`);
    else if (html.includes('</main>')) html = html.replace('</main>', `${block}</main>`);
    else html = html.replace('</body>', `${block}</body>`);
    fs.writeFileSync(file, html, 'utf8');
  }
}

function ensureSitemap() {
  if (!fs.existsSync(SITEMAP_FILE)) return;
  let xml = fs.readFileSync(SITEMAP_FILE, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const rows = [];
  for (const category of CATEGORIES) {
    const loc = `${SITE_URL}/guide/${category.slug}/`;
    if (!xml.includes(`<loc>${loc}</loc>`)) rows.push(`  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.75</priority></url>`);
  }
  if (rows.length && xml.includes('</urlset>')) {
    xml = xml.replace('</urlset>', `${rows.join('\n')}\n</urlset>`);
    fs.writeFileSync(SITEMAP_FILE, xml, 'utf8');
  }
}

const manifest = readJson(MANIFEST_FILE, []);
ensureCategoryPages(Array.isArray(manifest) ? manifest : []);
injectArticleLinks(Array.isArray(manifest) ? manifest : []);
ensureSitemap();
console.log(`Guide category hubs generated: ${CATEGORIES.length}.`);