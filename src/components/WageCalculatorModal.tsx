import React, { useState } from 'react';
import { Calculator, X, HelpCircle, ShieldAlert, CheckCircle2, DollarSign } from 'lucide-react';

interface WageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WageCalculatorModal: React.FC<WageCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [basicSalary, setBasicSalary] = useState<number>(3500);
  const [housingAllowance, setHousingAllowance] = useState<number>(500);
  const [transportAllowance, setTransportAllowance] = useState<number>(300);
  const [otherAllowances, setOtherAllowances] = useState<number>(0);
  const [weeklyHours, setWeeklyHours] = useState<number>(48); // Standard 48 hrs / week
  const [overtimeHoursMonthly, setOvertimeHoursMonthly] = useState<number>(15);

  if (!isOpen) return null;

  // Monthly standard working hours in Saudi labor standard: 30 days * 8 hrs = 240 hrs
  const standardMonthlyHours = 240;
  const basicHourlyRate = basicSalary / standardMonthlyHours;
  
  // Overtime rate: 150% of basic hourly wage (Saudi Labor Law Article 107)
  const overtimeHourlyRate = basicHourlyRate * 1.5;
  const totalOvertimePay = overtimeHoursMonthly * overtimeHourlyRate;

  // Gross package without overtime
  const standardGrossSalary = basicSalary + housingAllowance + transportAllowance + otherAllowances;
  // Total expected monthly with overtime
  const totalExpectedPay = standardGrossSalary + totalOvertimePay;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" id="wage-calc-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200" id="wage-calc-modal">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">حاسبة الأجر وساعات العمل الإضافية (أوفر تايم)</h2>
              <p className="text-xs text-emerald-100 mt-0.5">أداة استرشادية ذكية لحساب مستحقاتك بدقة طبقاً لمعايير نظام العمل السعودي</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الراتب الأساسي (ريال سعودي) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1000"
                  step="100"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm font-semibold"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">ر.س</span>
              </div>
              <span className="text-[11px] text-slate-500">يحسب الأوفرتايم على أساس الراتب الأساسي</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                بدل السكن الشهري (ريال)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={housingAllowance}
                  onChange={(e) => setHousingAllowance(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">ر.س</span>
              </div>
              <span className="text-[11px] text-slate-500">إذا كان السكن مؤمناً عيناً ضع 0</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                بدل المواصلات الشهري (ريال)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={transportAllowance}
                  onChange={(e) => setTransportAllowance(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">ر.س</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                بدلات أو حوافز إضافية (ريال)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={otherAllowances}
                  onChange={(e) => setOtherAllowances(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">ر.س</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ساعات العمل الأسبوعية الأساسية
              </label>
              <select
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
              >
                <option value={48}>48 ساعة أسبوعياً (8 ساعات / 6 أيام - المعيار الأوسع)</option>
                <option value={40}>40 ساعة أسبوعياً (8 ساعات / 5 أيام)</option>
                <option value={36}>36 ساعة أسبوعياً (شهر رمضان للمسلمين)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ساعات العمل الإضافية المتوقعة شهرياً
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overtimeHoursMonthly}
                  onChange={(e) => setOvertimeHoursMonthly(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-16 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm font-semibold"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">ساعة / شهر</span>
              </div>
            </div>
          </div>

          {/* Detailed Calculations Output Card */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              تفصيل الحسابات المالية (معدل الساعة والأوفرتايم):
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[11px] text-slate-500 mb-1">أجر الساعة الأساسي</div>
                <div className="text-base font-bold text-slate-800">{basicHourlyRate.toFixed(2)} ر.س</div>
                <div className="text-[10px] text-slate-400">الأساسي ÷ 240 ساعة</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                <div className="text-[11px] text-emerald-700 font-bold mb-1">أجر ساعة الأوفرتايم</div>
                <div className="text-base font-bold text-emerald-600">{overtimeHourlyRate.toFixed(2)} ر.س</div>
                <div className="text-[10px] text-emerald-500">150% من الأجر الأساسي</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[11px] text-slate-500 mb-1">مستحقات الإضافي</div>
                <div className="text-base font-bold text-slate-800">{totalOvertimePay.toFixed(0)} ر.س</div>
                <div className="text-[10px] text-slate-400">عن {overtimeHoursMonthly} ساعة إضافية</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-300 bg-emerald-500/5 shadow-sm">
                <div className="text-[11px] text-emerald-800 font-bold mb-1">الراتب الشهري المتوقع</div>
                <div className="text-lg font-black text-emerald-700">{totalExpectedPay.toFixed(0)} ر.س</div>
                <div className="text-[10px] text-emerald-600">شامل البدلات والإضافي</div>
              </div>
            </div>

            {/* Breakdown summary row */}
            <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200/80">
              <div className="flex justify-between">
                <span>الراتب الإجمالي الثابت (الأساسي + سكن + مواصلات + بدلات):</span>
                <span className="font-bold text-slate-800">{standardGrossSalary.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي قيمة العمل الإضافي الشهري:</span>
                <span className="font-bold text-emerald-600">+{totalOvertimePay.toFixed(0)} ر.س</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-dashed border-slate-300">
                <span>المجموع المستلم المقدر شهرياً:</span>
                <span className="text-emerald-700 font-black">{totalExpectedPay.toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>

          {/* Legal and Practical Note */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold mb-1">تنبيه استرشادي:</p>
              <p>
                الحاسبة تقديرية استرشادية، وتخضع الاستحقاقات الفعلية للعقد الموثق والأنظمة واللوائح السارية. قد تختلف النتيجة بحسب تفاصيل العقد ونوع العمل والحالة الفعلية.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            إغلاق الحاسبة
          </button>
        </div>
      </div>
    </div>
  );
};
