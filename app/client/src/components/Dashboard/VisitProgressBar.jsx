import React from 'react';

const VisitProgressBar = ({ current, target, label }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const displayPercentage = target > 0 ? Math.round((current / target) * 100) : 0;

  const getColor = () => {
    if (displayPercentage >= 100) return 'bg-green-500';
    if (displayPercentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (displayPercentage >= 100) return 'text-green-600';
    if (displayPercentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${getTextColor()}`}>
          {displayPercentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">{current} done</span>
        <span className="text-xs text-gray-500">Target: {target}</span>
      </div>
    </div>
  );
};

export default VisitProgressBar;