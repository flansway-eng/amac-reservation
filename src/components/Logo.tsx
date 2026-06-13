import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 72, className = '' }: LogoProps) {
  return (
    <Image
      src="/logo-amac.svg"
      alt="AMAC Bingerville — Section Café Coton"
      width={size}
      height={size}
      className={`object-contain drop-shadow-[0_0_16px_rgba(232,115,12,0.5)] ${className}`}
      priority
    />
  );
}
