import React from 'react';
import { Star, TrendingUp, Target, CheckCircle, AlertCircle, Volume2 } from 'lucide-react';
import type { PronunciationResult, WordLevelResult } from '../service/pronunciationService';

interface Props {
  result: PronunciationResult;
  onClose?: () => void;
}

const PronunciationResult: React.FC<Props> = ({ result, onClose }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Star className="w-5 h-5 text-green-400" />;
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-blue-400" />;
    if (score >= 70) return <TrendingUp className="w-5 h-5 text-yellow-400" />;
    return <AlertCircle className="w-5 h-5 text-red-400" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Practice';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-purple-800/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl">
            <Volume2 className="w-6 h-6 text-blue-300" />
          </div>
          <h3 className="text-xl font-bold text-white">Pronunciation Assessment</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="text-white/70 hover:text-white">✕</span>
          </button>
        )}
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 mb-6 border border-blue-400/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {getScoreIcon(result.overallScore)}
              <span className="text-white font-semibold">Overall Score</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore.toFixed(1)}/100
            </div>
            <div className="text-white/70 text-sm mt-1">
              {getScoreLabel(result.overallScore)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold text-white/20">
              {Math.round(result.overallScore)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-white/80 text-sm">Accuracy</span>
          </div>
          <div className={`text-lg font-bold ${getScoreColor(result.accuracyScore)}`}>
            {result.accuracyScore.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-white/80 text-sm">Fluency</span>
          </div>
          <div className={`text-lg font-bold ${getScoreColor(result.fluencyScore)}`}>
            {result.fluencyScore.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-purple-400" />
            <span className="text-white/80 text-sm">Completeness</span>
          </div>
          <div className={`text-lg font-bold ${getScoreColor(result.completenessScore)}`}>
            {result.completenessScore.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="w-4 h-4 text-yellow-400" />
            <span className="text-white/80 text-sm">Pronunciation</span>
          </div>
          <div className={`text-lg font-bold ${getScoreColor(result.pronunciationScore)}`}>
            {result.pronunciationScore.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Word Level Results */}
      {result.wordLevelResults.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Word Analysis
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {result.wordLevelResults.map((word, index) => (
              <WordLevelItem key={index} word={word} />
            ))}
          </div>
        </div>
      )}

      {/* Detailed Feedback */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Feedback & Suggestions
        </h4>
        <div className="text-white/90 text-sm whitespace-pre-line">
          {result.detailedFeedback}
        </div>
      </div>
    </div>
  );
};

// Component con để hiển thị từng từ
const WordLevelItem: React.FC<{ word: WordLevelResult }> = ({ word }) => {
  const getWordScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getWordIcon = (score: number) => {
    if (score >= 80) return '✅';
    if (score >= 60) return '⚠️';
    return '❌';
  };

  return (
    <div className="flex items-center justify-between bg-white/5 rounded-lg p-2 border border-white/10">
      <div className="flex items-center gap-2">
        <span className="text-lg">{getWordIcon(word.accuracyScore)}</span>
        <span className="text-white font-medium">{word.word}</span>
        {word.errorType && (
          <span className="text-red-400 text-xs bg-red-400/20 px-2 py-1 rounded">
            {word.errorType}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className={`text-sm font-bold ${getWordScoreColor(word.accuracyScore)}`}>
            {word.accuracyScore.toFixed(0)}%
          </div>
          <div className="text-white/50 text-xs">Accuracy</div>
        </div>
        {word.suggestedPronunciation && (
          <div className="text-white/70 text-xs bg-white/10 px-2 py-1 rounded">
            Try: "{word.suggestedPronunciation}"
          </div>
        )}
      </div>
    </div>
  );
};

export default PronunciationResult; 