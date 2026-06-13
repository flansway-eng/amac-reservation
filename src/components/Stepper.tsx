'use client';

interface StepperProps {
  steps: string[];
  current: number;
}

export default function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-lg mx-auto px-4 py-4">
      {steps.map((label, i) => {
        const isCompleted = i < current;
        const isActive = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 border-yellow-500 text-black'
                    : isActive
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-400 text-black shadow-[0_0_12px_rgba(212,175,55,0.6)]'
                    : 'bg-white/5 border-white/20 text-white/40'
                }`}
              >
                {isCompleted ? '✓' : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:block whitespace-nowrap ${
                  isActive ? 'text-yellow-400' : isCompleted ? 'text-yellow-600' : 'text-white/30'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 transition-all duration-300 ${
                  isCompleted ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
