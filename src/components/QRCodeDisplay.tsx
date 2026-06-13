'use client';

import { useEffect, useRef } from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(canvasRef.current!, value, {
        width: size,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
    });
  }, [value, size]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="rounded-xl"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
