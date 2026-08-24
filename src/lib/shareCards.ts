import { Candidate, Job } from '../types';

async function readyFonts() {
  if ('fonts' in document) await document.fonts.ready;
}

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 3) {
  const words = text.split(/\s+/);
  let line = '';
  let lineNo = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineNo * lineHeight);
      line = word;
      lineNo += 1;
      if (lineNo >= maxLines) return;
    } else line = test;
  }
  if (lineNo < maxLines) ctx.fillText(line, x, y + lineNo * lineHeight);
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('تعذر إنشاء بطاقة المشاركة.')), 'image/png'));
}

export async function createJobShareCard(job: Job): Promise<Blob> {
  await readyFonts();
  const canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.textAlign = 'right'; ctx.direction = 'rtl';
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#052e2b'); gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = '#34d399'; ctx.font = '800 44px Tajawal, sans-serif'; ctx.fillText('NEXT JOB', 1090, 90);
  ctx.fillStyle = '#ffffff'; ctx.font = '900 66px Tajawal, sans-serif'; wrap(ctx, job.title, 1090, 190, 930, 78, 2);
  ctx.fillStyle = '#d1fae5'; ctx.font = '700 32px Tajawal, sans-serif'; ctx.fillText(job.company, 1090, 360);
  ctx.fillStyle = '#ffffff'; ctx.font = '600 29px Tajawal, sans-serif'; ctx.fillText(`📍 ${job.city}    💰 ${job.salary || 'الراتب يحدد لاحقًا'}`, 1090, 420);
  ctx.fillStyle = '#10b981'; rounded(ctx, 650, 485, 440, 76, 24);
  ctx.fillStyle = '#041c1a'; ctx.font = '800 27px Tajawal, sans-serif'; ctx.fillText('فرصتك القادمة تبدأ هنا', 1050, 534);
  ctx.fillStyle = '#94a3b8'; ctx.font = '500 21px Tajawal, sans-serif'; ctx.fillText('بيانات التواصل غير مضمنة في بطاقة الصورة', 1090, 590);
  return canvasBlob(canvas);
}

async function tryAvatar(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
  try {
    const image = new Image(); image.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(); image.src = url; });
    ctx.save(); ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(image, x, y, size, size); ctx.restore();
  } catch { /* Avatar is optional in share output. */ }
}

export async function createCandidateShareCard(candidate: Candidate): Promise<Blob> {
  if (candidate.isHidden) throw new Error('لا يمكن مشاركة ملف مخفي.');
  await readyFonts();
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.textAlign = 'right'; ctx.direction = 'rtl';
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, '#064e3b'); gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 1080);
  ctx.fillStyle = '#6ee7b7'; ctx.font = '900 50px Tajawal, sans-serif'; ctx.fillText('NEXT JOB', 960, 105);
  if (candidate.avatarUrl) await tryAvatar(ctx, candidate.avatarUrl, 90, 155, 220);
  ctx.fillStyle = '#ffffff'; ctx.font = '900 58px Tajawal, sans-serif'; wrap(ctx, candidate.fullName, 960, 245, 600, 68, 2);
  ctx.fillStyle = '#a7f3d0'; ctx.font = '800 40px Tajawal, sans-serif'; ctx.fillText(candidate.profession, 960, 410);
  ctx.fillStyle = '#e2e8f0'; ctx.font = '600 30px Tajawal, sans-serif'; ctx.fillText(`📍 ${candidate.city}    الخبرة: ${candidate.experienceYears}`, 960, 485);
  ctx.font = '600 27px Tajawal, sans-serif'; wrap(ctx, candidate.bio, 960, 570, 860, 45, 4);
  const skills = (candidate.skills || []).slice(0, 5).join(' · ');
  ctx.fillStyle = '#6ee7b7'; ctx.font = '700 28px Tajawal, sans-serif'; wrap(ctx, skills, 960, 790, 860, 42, 2);
  ctx.fillStyle = '#10b981'; rounded(ctx, 500, 920, 460, 78, 24);
  ctx.fillStyle = '#042f2e'; ctx.font = '900 28px Tajawal, sans-serif'; ctx.fillText('ابحث عن هذا الملف في NEXT JOB', 920, 970);
  ctx.fillStyle = '#94a3b8'; ctx.font = '500 20px Tajawal, sans-serif'; ctx.fillText('لا تتضمن البطاقة رقم الهاتف أو واتساب أو محافظة الأصل', 960, 1030);
  return canvasBlob(canvas);
}

export async function shareImage(blob: Blob, filename: string, text: string) {
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share({ files: [file], text });
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
