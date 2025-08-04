import React from 'react';
import { Menu, BookOpen, Target, TrendingUp } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
  onOpenVocabulary: () => void;
  onOpenProgress: () => void;
  selectedTopic: string | null;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenSidebar,
  onOpenVocabulary,
  onOpenProgress,
  selectedTopic
}) => {
  return (
    <div className="lg:hidden bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button */}
        <Button
          onClick={onOpenSidebar}
          variant="ghost"
          className="p-2 text-white hover:bg-white/10"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Center - Selected topic */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-white">
            {selectedTopic || 'Chọn chủ đề'}
          </h1>
          {selectedTopic && (
            <p className="text-xs text-white/60 mt-1">Đang luyện nói</p>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenVocabulary}
            variant="ghost"
            className="p-2 text-white hover:bg-white/10"
            title="Từ vựng"
          >
            <BookOpen className="w-5 h-5" />
          </Button>
          <Button
            onClick={onOpenProgress}
            variant="ghost"
            className="p-2 text-white hover:bg-white/10"
            title="Tiến trình"
          >
            <TrendingUp className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader; 