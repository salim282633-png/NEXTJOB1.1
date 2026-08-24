import React, { useEffect } from 'react';
import { GOOGLE_PRODUCTION_STATUS, googleProductionConfig } from '../lib/googleProduction';

interface Props {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

/**
 * Production-only AdSense surface. It renders nothing until all Google
 * production requirements are READY and a real numeric ad slot is supplied.
 */
export const AdSenseSlot: React.FC<Props> = ({ slot, format = 'auto', className = '' }) => {
  const resolvedSlot = String(slot || import.meta.env.VITE_ADSENSE_SLOT_JOBS || '').trim();
  const ready = GOOGLE_PRODUCTION_STATUS === 'READY' && /^\d+$/.test(resolvedSlot);

  useEffect(() => {
    if (!ready) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      console.warn('AdSense slot initialization failed:', error);
    }
  }, [ready, resolvedSlot]);

  if (!ready) return null;

  return (
    <aside className={`my-5 rounded-2xl border border-slate-200 bg-white p-3 ${className}`} aria-label="إعلان ممول">
      <div className="mb-2 text-[10px] font-medium text-slate-400">إعلان</div>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={googleProductionConfig.adsenseClient}
        data-ad-slot={resolvedSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
};
