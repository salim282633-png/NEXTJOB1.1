import fs from 'node:fs';

function patch(path, changes) {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to, label] of changes) {
    if (!text.includes(from)) throw new Error(`${path}: missing patch target: ${label}`);
    text = text.replace(from, to);
  }
  fs.writeFileSync(path, text);
  console.log(`patched ${path}`);
}

patch('src/types.ts', [[
  "  skills: string[];\n  bio: string;",
  "  skills: string[];\n  hobbies?: string[];\n  noExperience?: boolean;\n  bio: string;",
  'candidate type fields'
]]);

patch('src/components/PostCandidateModal.tsx', [
  [
    "  const [experienceYears, setExperienceYears] = useState('3 سنوات');\n  const [educationLevel, setEducationLevel] = useState('ثانوية عامة / دبلوم');",
    "  const [experienceYears, setExperienceYears] = useState('');\n  const [noExperience, setNoExperience] = useState(false);\n  const [educationLevel, setEducationLevel] = useState('ثانوية عامة / دبلوم');",
    'experience state'
  ],
  [
    "  const [skillsInput, setSkillsInput] = useState('');\n  const [bio, setBio] = useState('');",
    "  const [skillsInput, setSkillsInput] = useState('');\n  const [hobbiesInput, setHobbiesInput] = useState('');\n  const [bio, setBio] = useState('');",
    'hobbies state'
  ],
  [
    "      setErrorMsg('يرجى ملء الاسم، المهنة، رقم الجوال، ونبذة مختصرة عن خبرتك.');",
    "      setErrorMsg('يرجى ملء الاسم، المهنة، رقم الجوال، ونبذة مختصرة عن نفسك وما تستطيع القيام به.');",
    'validation wording'
  ],
  [
    "      const skills = skillsInput\n        .split(/[,،]/)\n        .map(s => s.trim())\n        .filter(s => s.length > 0);",
    "      const skills = skillsInput\n        .split(/[,،]/)\n        .map(s => s.trim())\n        .filter(s => s.length > 0);\n\n      const hobbies = hobbiesInput\n        .split(/[,،]/)\n        .map(item => item.trim())\n        .filter(item => item.length > 0)\n        .slice(0, 12);",
    'hobbies parsing'
  ],
  [
    "        experienceYears: experienceYears.trim() || 'خبرة عملية',",
    "        experienceYears: noExperience ? 'لا توجد خبرة سابقة' : (experienceYears.trim() || 'لم يحدد'),\n        noExperience,",
    'experience submit value'
  ],
  [
    "        skills: skills.length > 0 ? skills : [profession.trim()],\n        bio: bio.trim(),",
    "        skills: skills.length > 0 ? skills : [profession.trim()],\n        hobbies,\n        bio: bio.trim(),",
    'hobbies submit value'
  ],
  [
    "              <label className=\"block text-xs font-bold text-slate-700 mb-1.5\">سنوات الخبرة بالسعودية</label>\n              <input\n                id=\"input-cand-exp\"\n                type=\"text\"\n                value={experienceYears}\n                onChange={e => setExperienceYears(e.target.value)}\n                placeholder=\"مثال: 4 سنوات بالسعودية\"\n                className=\"w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none\"\n              />",
    "              <label className=\"block text-xs font-bold text-slate-700 mb-1.5\">الخبرة العملية</label>\n              <input\n                id=\"input-cand-exp\"\n                type=\"text\"\n                value={experienceYears}\n                disabled={noExperience}\n                onChange={e => setExperienceYears(e.target.value)}\n                placeholder={noExperience ? 'تم اختيار: لا توجد خبرة سابقة' : 'مثال: سنتان في المبيعات أو المطاعم'}\n                className=\"w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400\"\n              />\n              <label className=\"mt-2 flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer\">\n                <input\n                  type=\"checkbox\"\n                  checked={noExperience}\n                  onChange={e => {\n                    setNoExperience(e.target.checked);\n                    if (e.target.checked) setExperienceYears('');\n                  }}\n                  className=\"rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4\"\n                />\n                <span>لا توجد لدي خبرة سابقة</span>\n              </label>",
    'no experience UI'
  ],
  [
    "              نبذة عن خبراتك والمهام التي تجيدها <span className=\"text-rose-500\">*</span>",
    "              عرّف عن نفسك وما الأعمال أو المهارات التي تستطيع القيام بها <span className=\"text-rose-500\">*</span>",
    'bio label'
  ],
  [
    "              placeholder=\"اكتب نبذة مقنعة: الشركات أو المتاجر التي عملت بها، البرامج التي تتقنها، والأعمال التي أنجزتها...\"",
    "              placeholder=\"مثال: أتعلم بسرعة، أجيد التعامل مع العملاء واستخدام الحاسب، ومستعد للتدريب والعمل في المبيعات أو المطاعم...\"",
    'bio placeholder'
  ],
  [
    "          {/* Contact Details & Verification */}",
    "          {/* Hobbies / Interests */}\n          <div>\n            <label className=\"block text-xs font-bold text-slate-700 mb-1.5\">الهوايات والاهتمامات التي قد تعكس مهاراتك (اختياري)</label>\n            <input\n              id=\"input-cand-hobbies\"\n              type=\"text\"\n              maxLength={300}\n              value={hobbiesInput}\n              onChange={e => setHobbiesInput(e.target.value)}\n              placeholder=\"مثال: الطبخ، التصوير، صيانة الأجهزة، البيع والتفاوض، التصميم، الأعمال اليدوية\"\n              className=\"w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none\"\n            />\n            <p className=\"text-[10px] text-slate-500 mt-1.5\">الهوايات تساعد صاحب العمل على فهم اهتماماتك، لكنها لا تدخل في ترتيب «فرص قد تناسبك».</p>\n          </div>\n\n          {/* Contact Details & Verification */}",
    'hobbies UI'
  ]
]);

patch('src/components/CandidateCard.tsx', [
  [
    "      <div className=\"flex flex-wrap gap-1.5 mb-3\"><span className=\"text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-lg flex gap-1\"><ShieldCheck className=\"w-3 h-3\" />{candidate.iqamaStatus}</span>{candidate.availableImmediately && <span className=\"text-[11px] font-bold bg-teal-50 text-teal-800 px-2 py-1 rounded-lg\">مباشر فورًا</span>}</div>",
    "      <div className=\"flex flex-wrap gap-1.5 mb-3\"><span className=\"text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-lg flex gap-1\"><ShieldCheck className=\"w-3 h-3\" />{candidate.iqamaStatus}</span>{candidate.noExperience && <span className=\"text-[11px] font-bold bg-violet-50 text-violet-800 border border-violet-100 px-2 py-1 rounded-lg\">بدون خبرة سابقة</span>}{candidate.availableImmediately && <span className=\"text-[11px] font-bold bg-teal-50 text-teal-800 px-2 py-1 rounded-lg\">مباشر فورًا</span>}</div>",
    'no experience badge'
  ],
  [
    "<Clock className=\"w-3.5 h-3.5 text-emerald-600\" />{candidate.experienceYears}</span>",
    "<Clock className=\"w-3.5 h-3.5 text-emerald-600\" />{candidate.noExperience ? 'بدون خبرة سابقة' : candidate.experienceYears}</span>",
    'experience display'
  ],
  [
    "      <div className=\"flex flex-wrap gap-1.5 mb-4\">{(candidate.skills || []).map((s,i)=><span key={i} className=\"text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md\">{s}</span>)}{candidate.hasDriverLicense && <span className=\"text-[11px] bg-sky-50 text-sky-800 px-2 py-1 rounded-md flex gap-1\"><Car className=\"w-3 h-3\" />رخصة قيادة</span>}</div>",
    "      <div className=\"flex flex-wrap gap-1.5 mb-2\">{(candidate.skills || []).map((s,i)=><span key={i} className=\"text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md\">{s}</span>)}{candidate.hasDriverLicense && <span className=\"text-[11px] bg-sky-50 text-sky-800 px-2 py-1 rounded-md flex gap-1\"><Car className=\"w-3 h-3\" />رخصة قيادة</span>}</div>\n      {candidate.hobbies && candidate.hobbies.length > 0 && <div className=\"mb-4\"><span className=\"text-[10px] font-bold text-slate-500 ml-1\">هوايات واهتمامات:</span><div className=\"inline-flex flex-wrap gap-1\">{candidate.hobbies.map((h,i)=><span key={i} className=\"text-[10px] bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-md\">{h}</span>)}</div></div>}",
    'hobbies display'
  ]
]);

patch('firestore.rules', [
  [
    "        incoming().bio is string && incoming().bio.size() <= 2000 &&\n        incoming().phoneVerified is bool &&",
    "        incoming().bio is string && incoming().bio.size() <= 2000 &&\n        (!incoming().keys().hasAny(['hobbies']) || (incoming().hobbies is list && incoming().hobbies.size() <= 12)) &&\n        (!incoming().keys().hasAny(['noExperience']) || incoming().noExperience is bool) &&\n        incoming().phoneVerified is bool &&",
    'candidate create optional field validation'
  ],
  [
    "            'availabilityNote', 'avatarUrl', 'isHidden', 'allowContact',\n            'nationality', 'phoneVerified', 'updatedAt', 'views'\n          ]) &&\n          verifiedPublicStateMatchesContact(candidateId, incoming())",
    "            'availabilityNote', 'avatarUrl', 'hobbies', 'noExperience', 'isHidden', 'allowContact',\n            'nationality', 'phoneVerified', 'updatedAt', 'views'\n          ]) &&\n          (!incoming().keys().hasAny(['hobbies']) || (incoming().hobbies is list && incoming().hobbies.size() <= 12)) &&\n          (!incoming().keys().hasAny(['noExperience']) || incoming().noExperience is bool) &&\n          verifiedPublicStateMatchesContact(candidateId, incoming())",
    'candidate update fields'
  ]
]);

console.log('candidate hobbies/no-experience migration complete');
