import React, { useEffect, useState } from 'react';
import { Camera, CheckCircle2, ImageUp, X } from 'lucide-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { storage } from '../lib/storage';
import { cropAndCompressAvatar } from '../lib/imageProcessing';

interface Props {
  candidateId: string;
  currentUrl?: string;
  onUpdated?: (url: string) => void;
}

export const CandidateAvatarUploader: React.FC<Props> = ({ candidateId, currentUrl, onUpdated }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const save = async () => {
    const user = auth.currentUser;
    if (!user || !file) {
      setError('يجب تسجيل الدخول لاستخدام رفع الصور.');
      return;
    }
    setBusy(true);
    setError('');
    setDone(false);
    try {
      const blob = await cropAndCompressAvatar(file, zoom, x, y);
      const path = `candidate-avatars-v2/${candidateId}/${Date.now()}.webp`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob, {
        contentType: 'image/webp',
        cacheControl: 'public,max-age=604800',
        customMetadata: { ownerUid: user.uid, candidateId }
      });
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'candidates', candidateId), {
        avatarUrl: url,
        updatedAt: new Date().toISOString()
      });
      setDone(true);
      setFile(null);
      onUpdated?.(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر رفع الصورة.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border flex items-center justify-center shrink-0">
          {(preview || currentUrl) ? (
            <img src={preview || currentUrl} alt="صورة الباحث" className="w-full h-full object-cover" style={preview ? { transform: `scale(${zoom}) translate(${x / 4}%, ${y / 4}%)` } : undefined} />
          ) : <Camera className="w-6 h-6 text-slate-400" />}
        </div>
        <div className="flex-1">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-white border px-3 py-2 font-bold text-slate-700">
            <ImageUp className="w-4 h-4" /> اختيار صورة
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
          <p className="text-[10px] text-slate-500 mt-1">تُعالج إلى 400×400 WebP بنسبة 1:1 قبل الرفع.</p>
        </div>
      </div>

      {file && (
        <div className="mt-3 grid sm:grid-cols-3 gap-2">
          <label>تكبير <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full" /></label>
          <label>أفقي <input type="range" min="-100" max="100" value={x} onChange={e => setX(Number(e.target.value))} className="w-full" /></label>
          <label>رأسي <input type="range" min="-100" max="100" value={y} onChange={e => setY(Number(e.target.value))} className="w-full" /></label>
          <div className="sm:col-span-3 flex gap-2 justify-end">
            <button type="button" onClick={() => setFile(null)} className="px-3 py-1.5 rounded-lg bg-white border flex items-center gap-1"><X className="w-3 h-3" />إلغاء</button>
            <button type="button" disabled={busy} onClick={save} className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold disabled:opacity-50">{busy ? 'جارٍ المعالجة والرفع...' : 'قص 1:1 وحفظ'}</button>
          </div>
        </div>
      )}
      {error && <div className="text-rose-700 mt-2">{error}</div>}
      {done && <div className="text-emerald-700 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />تم تحديث الصورة.</div>}
    </div>
  );
};
