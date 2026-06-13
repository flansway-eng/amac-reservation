import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizes = { sm: 48, md: 72, lg: 100, xl: 140 };

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const px = sizes[size];
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <Image
        src="/logo-amac.png"
        alt="AMAC Bingerville — Section Café Coton"
        width={px}
        height={px}
        className="object-contain drop-shadow-[0_0_12px_rgba(232,115,12,0.4)]"
        priority
      />
      {showText && (
        <div className="text-center leading-none">
          <p className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase">
            Les Amis de la Musique Afro-Cubaine
          </p>
        </div>
      )}
    </div>
  );
}
