'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href?: string;
  className?: string;
  label?: string;
}

export default function BackButton({ href, className = '', label = '← Retour' }: BackButtonProps) {
  const router = useRouter();
  const styles =
    'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 border border-[rgba(255,45,85,0.25)] transition-all';

  if (href) {
    return (
      <Link href={href} className={`${styles} ${className}`}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={`${styles} ${className}`}>
      {label}
    </button>
  );
}
