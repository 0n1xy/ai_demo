import React from 'react';
import type { ProgressChartData } from '../types/types';

interface Props {
  data: ProgressChartData[];
  title: string;
  metric: keyof Omit<ProgressChartData, 'date'>;
  color: string;
  maxValue?: number;
}

const ProgressChart: React.FC<Props> = ({ data, title, metric, color, maxValue }) => {
  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
        <div className="text-center text-slate-400 py-8">
          Chưa có dữ liệu để hiển thị
        </div>
      </div>
    );
  }

  const values = data.map(d => d[metric]);
  const max = maxValue || Math.max(...values);
  const min = Math.min(...values);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const value = item[metric];
          const percentage = max > 0 ? (value / max) * 100 : 0;
          const height = Math.max(20, percentage * 2); // Tối thiểu 20px

          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-xs text-slate-300 text-right">
                {item.date}
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div 
                    className={`rounded transition-all duration-300 ${color}`}
                    style={{ 
                      width: `${percentage}%`, 
                      height: `${height}px`,
                      minWidth: '20px'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {typeof value === 'number' ? value.toFixed(1) : value}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-slate-400">
        <span>Min: {min.toFixed(1)}</span>
        <span className="mx-2">|</span>
        <span>Max: {max.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default ProgressChart; 