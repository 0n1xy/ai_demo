import React, { useState, useEffect } from 'react';
import { LocalStorageUtils } from '../utils/localStorageUtils';

const StorageInfo: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [storageSize, setStorageSize] = useState<number>(0);
  const [progressCount, setProgressCount] = useState<number>(0);

  useEffect(() => {
    checkStorageInfo();
  }, []);

  const checkStorageInfo = () => {
    const available = LocalStorageUtils.isAvailable();
    setIsAvailable(available);
    
    if (available) {
      // Tính dung lượng
      let size = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length;
        }
      }
      setStorageSize(size);
      
      // Đếm số progress
      const progress = LocalStorageUtils.getProgressHistory();
      setProgressCount(progress.length);
    }
  };

  if (isAvailable === null) {
    return null;
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 mb-4 border border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span className="text-sm text-slate-300">
            localStorage: {isAvailable ? 'Khả dụng' : 'Không khả dụng'}
          </span>
        </div>
        
        {isAvailable && (
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span>Dung lượng: {storageSize} bytes</span>
            <span>Tiến trình: {progressCount} bản ghi</span>
            <button
              onClick={checkStorageInfo}
              className="text-blue-400 hover:text-blue-300"
            >
              🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageInfo; 