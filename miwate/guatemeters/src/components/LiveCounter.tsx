'use client';

import { useState, useEffect } from 'react';
import { StatisticItem, getCurrentValue } from '@/data/guatemalaStats';

interface LiveCounterProps {
  stat: StatisticItem;
  className?: string;
}

export default function LiveCounter({ stat, className = '' }: LiveCounterProps) {
  const [currentValue, setCurrentValue] = useState(getCurrentValue(stat));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setCurrentValue(getCurrentValue(stat));
      
      setTimeout(() => setIsAnimating(false), 200);
    }, 1000);

    return () => clearInterval(interval);
  }, [stat]);

  const formatNumber = (num: number): string => {
    const decimals = stat.decimals || 0;
    
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(decimals) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    
    return num.toFixed(decimals);
  };

  const formattedValue = formatNumber(currentValue);

  return (
    <div className={`${className}`}>
      <div className={`font-mono text-xl font-bold transition-all duration-200 ${
        isAnimating ? 'scale-105 text-opacity-80' : 'scale-100'
      } ${stat.color || 'text-gray-800'}`}>
        {stat.prefix}{formattedValue}{stat.suffix}
      </div>
    </div>
  );
}