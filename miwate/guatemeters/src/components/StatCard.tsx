import { StatisticItem } from '@/data/guatemalaStats';
import LiveCounter from './LiveCounter';

interface StatCardProps {
  stat: StatisticItem;
  className?: string;
}

export default function StatCard({ stat, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {stat.title}
        </h3>
        <LiveCounter stat={stat} />
        {stat.source && (
          <p className="text-xs text-gray-400 mt-2">
            Source: {stat.source}
          </p>
        )}
      </div>
    </div>
  );
}