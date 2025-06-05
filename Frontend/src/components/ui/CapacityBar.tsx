
import { Progress } from '@/components/ui/progress';

interface CapacityBarProps {
  current: number;
  max: number;
  className?: string;
}

export const CapacityBar = ({ current, max, className }: CapacityBarProps) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isOverloaded = current > max;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-sm">
        <span>Capacity</span>
        <span className={isOverloaded ? 'text-red-600 font-medium' : ''}>
          {current}% / {max}%
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isOverloaded ? '[&>[data-state="complete"]]:bg-red-500' : ''}`}
      />
    </div>
  );
};
