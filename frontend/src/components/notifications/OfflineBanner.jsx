import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const OfflineBanner = () => {
  const { currentTheme } = useTheme();
  return (
    <div className={`border-b px-4 py-2 flex items-center justify-center gap-2 transition-colors duration-500 ${
      currentTheme === 'midnight'
        ? 'bg-neutral-900 border-neutral-800 text-curry-400'
        : 'bg-amber-50 border-amber-100 text-amber-800'
    }`}>
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span className="text-xs font-semibold">
        ⚡ Running in <strong>Offline Demo Mode</strong>. Start the backend Express server on port 5000 to enable full features.
      </span>
    </div>
  );
};

export default OfflineBanner;
