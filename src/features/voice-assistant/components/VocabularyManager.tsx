import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter, Download, Trash, Edit, Check, X, Star, Clock, Target, Sparkles, Loader2 } from 'lucide-react';
import { VocabularyService } from '../service/vocabularyService';
import { AzureAIService } from '../service/azureAIService';
import type { SavedWord, VocabularySettings, VocabularyStats } from '../types/vocabulary.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  openInAddMode?: boolean;
  onVocabularyChange?: () => void; // Callback khi có thay đổi từ vựng
}

const VocabularyManager: React.FC<Props> = ({ isOpen, onClose, openInAddMode = false, onVocabularyChange }) => {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [filteredWords, setFilteredWords] = useState<SavedWord[]>([]);
  const [stats, setStats] = useState<VocabularyStats>(VocabularyService.getStats());
  const [settings, setSettings] = useState<VocabularySettings>(VocabularyService.getSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState<SavedWord | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);


  // Form state
  const [formData, setFormData] = useState({
    word: '',
    pronunciation: '',
    meaning: '',
    example: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    category: 'General',
    tags: [] as string[],
    notes: ''
  });

  const categories = VocabularyService.getAllCategories();
  const allTags = VocabularyService.getAllTags();

  // Load data
  useEffect(() => {
    if (isOpen) {
      loadData();
      // If openInAddMode is true, automatically show the add form
      if (openInAddMode) {
        setShowAddForm(true);
        setEditingWord(null);
        resetForm();
      }
    }
  }, [isOpen, openInAddMode]);

  const loadData = () => {
    const allWords = VocabularyService.getAllWords();
    setWords(allWords);
    setFilteredWords(allWords);
    setStats(VocabularyService.getStats());
  };

  // Filter words
  useEffect(() => {
    let filtered = words;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(word =>
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(word => word.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(word => word.difficulty === selectedDifficulty);
    }

    setFilteredWords(filtered);
  }, [words, searchQuery, selectedCategory, selectedDifficulty]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.word.trim()) {
      alert('Vui lòng nhập từ.');
      return;
    }

    // If no meaning is provided, try to auto-fill first
    if (!formData.meaning.trim() && !isLoadingAI) {
      alert('Vui lòng nhập nghĩa của từ hoặc sử dụng tính năng tự động điền.');
      return;
    }
    
    if (editingWord) {
      // Update existing word
      VocabularyService.updateWord(editingWord.id, formData);
    } else {
      // Add new word
      VocabularyService.saveWord(formData);
    }

    resetForm();
    loadData();
    
    // Notify parent component about vocabulary change
    if (onVocabularyChange) {
      onVocabularyChange();
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      word: '',
      pronunciation: '',
      meaning: '',
      example: '',
      difficulty: 'medium',
      category: 'General',
      tags: [],
      notes: ''
    });
    setEditingWord(null);
    setShowAddForm(false);
    setIsLoadingAI(false);
  };

  // Auto-fill word details using Azure AI
  const handleAutoFill = async () => {
    if (!formData.word.trim()) {
      alert('Vui lòng nhập từ trước khi sử dụng tính năng tự động điền.');
      return;
    }

    setIsLoadingAI(true);
    try {
      const wordDetails = await AzureAIService.getWordDetails(formData.word.trim());
      setFormData({
        ...formData,
        pronunciation: wordDetails.pronunciation,
        meaning: wordDetails.meaning,
        example: wordDetails.example,
        difficulty: wordDetails.difficulty,
        category: wordDetails.category,
        tags: wordDetails.tags,
        notes: wordDetails.notes
      });
    } catch (error) {
      console.error('Error auto-filling word details:', error);
      alert('Không thể tự động điền thông tin từ. Vui lòng thử lại hoặc nhập thủ công.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Edit word
  const handleEdit = (word: SavedWord) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      pronunciation: word.pronunciation,
      meaning: word.meaning,
      example: word.example,
      difficulty: word.difficulty,
      category: word.category,
      tags: word.tags,
      notes: word.notes
    });
    setShowAddForm(true);
  };

  // Delete word
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa từ này?')) {
      VocabularyService.deleteWord(id);
      loadData();
      
      // Notify parent component about vocabulary change
      if (onVocabularyChange) {
        onVocabularyChange();
      }
    }
  };

  // Mark as reviewed
  const handleReview = (id: string) => {
    VocabularyService.markAsReviewed(id);
    loadData();
    
    // Notify parent component about vocabulary change
    if (onVocabularyChange) {
      onVocabularyChange();
    }
  };

  // Mark as mastered
  const handleMaster = (id: string) => {
    VocabularyService.markAsMastered(id);
    loadData();
    
    // Notify parent component about vocabulary change
    if (onVocabularyChange) {
      onVocabularyChange();
    }
  };

  // Export vocabulary
  const handleExport = () => {
    const content = VocabularyService.exportVocabulary();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabulary_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Update settings
  const updateSettings = (newSettings: Partial<VocabularySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    VocabularyService.saveSettings(updatedSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800/90 to-green-800/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl w-full max-w-6xl max-h-[90vh] sm:max-h-[90vh] h-screen sm:h-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-xl">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-300" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {showAddForm ? (editingWord ? 'Sửa từ vựng' : 'Thêm từ vựng mới') : 'Quản lý từ vựng'}
              </h3>
              <p className="text-white/70 text-xs sm:text-sm">
                {showAddForm ? 'Điền thông tin từ vựng mới' : `${stats.totalWords} từ • ${stats.masteredWords} đã thuộc • ${stats.needReviewWords} cần ôn`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {!showAddForm && (
              <>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Cài đặt"
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Xuất file"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Settings Panel - Only show when not in add form */}
        {showSettings && !showAddForm && (
          <div className="p-4 bg-white/5 border-b border-white/20 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-white/80 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.autoSaveNewWords}
                    onChange={(e) => updateSettings({ autoSaveNewWords: e.target.checked })}
                    className="rounded"
                  />
                  Tự động lưu từ mới
                </label>
                
                <label className="flex items-center gap-2 text-white/80 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showPronunciation}
                    onChange={(e) => updateSettings({ showPronunciation: e.target.checked })}
                    className="rounded"
                  />
                  Hiển thị phiên âm
                </label>
                
                <label className="flex items-center gap-2 text-white/80 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showMeaning}
                    onChange={(e) => updateSettings({ showMeaning: e.target.checked })}
                    className="rounded"
                  />
                  Hiển thị nghĩa
                </label>
                
                <label className="flex items-center gap-2 text-white/80 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showExample}
                    onChange={(e) => updateSettings({ showExample: e.target.checked })}
                    className="rounded"
                  />
                  Hiển thị ví dụ
                </label>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Độ khó mặc định</label>
                  <select
                    value={settings.defaultDifficulty}
                    onChange={(e) => updateSettings({ defaultDifficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Danh mục mặc định</label>
                  <input
                    type="text"
                    value={settings.defaultCategory}
                    onChange={(e) => updateSettings({ defaultCategory: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    placeholder="General"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters - Only show when not in add form */}
        {!showAddForm && (
          <div className="p-4 border-b border-white/20 flex-shrink-0">
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Tìm từ vựng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50"
                />
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 sm:flex-none bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="flex-1 sm:flex-none bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="all">Tất cả độ khó</option>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Thêm từ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form - Full screen when active */}
        {showAddForm && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
              {/* Word Input Section */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label className="text-white/80 text-sm mb-2 block">Từ *</label>
                  <input
                    type="text"
                    required
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    placeholder="Nhập từ tiếng Anh..."
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={isLoadingAI || !formData.word.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 rounded-lg text-white font-medium transition-all duration-150 hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 text-sm"
                >
                  {isLoadingAI ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isLoadingAI ? 'Đang xử lý...' : 'Tự động điền'}
                </button>
              </div>

              {/* Action Buttons - Moved to top for better accessibility */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors text-sm"
                >
                  {editingWord ? 'Cập nhật' : 'Thêm từ'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors text-sm"
                >
                  Quay lại danh sách
                </button>
              </div>

              {/* Dictionary API Info */}
              <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>ℹ️ Thông tin:</strong> Tính năng tự động điền sẽ sử dụng Dictionary API để lấy thông tin cơ bản về từ tiếng Anh.
                </p>
              </div>

              {/* Auto-filled Details Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Phiên âm</label>
                  <input
                    type="text"
                    value={formData.pronunciation}
                    onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    placeholder="[phát âm]"
                  />
                </div>
              
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Nghĩa</label>
                  <input
                    type="text"
                    value={formData.meaning}
                    onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    placeholder="Nghĩa của từ..."
                  />
                </div>
              
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Ví dụ</label>
                  <input
                    type="text"
                    value={formData.example}
                    onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    placeholder="Câu ví dụ..."
                  />
                </div>
              
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Độ khó</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Danh mục</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    placeholder="General"
                  />
                </div>
              
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-white/80 text-sm mb-2 block">Tags (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    placeholder="tag1, tag2, tag3..."
                  />
                </div>
              
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-white/80 text-sm mb-2 block">Ghi chú</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white h-20 resize-none"
                    placeholder="Ghi chú thêm..."
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Words List - Only show when not in add form */}
        {!showAddForm && (
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {filteredWords.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70">
                  {words.length === 0 ? 'Chưa có từ vựng nào' : 'Không tìm thấy từ vựng phù hợp'}
                </p>
                {words.length === 0 && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Thêm từ đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredWords.map(word => (
                  <div key={word.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h4 className="text-lg font-bold text-white">{word.word}</h4>
                          {settings.showPronunciation && (
                            <span className="text-blue-300 text-sm">[{word.pronunciation}]</span>
                          )}
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            word.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                            word.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {word.difficulty === 'easy' ? 'Dễ' : word.difficulty === 'medium' ? 'TB' : 'Khó'}
                          </div>
                          {word.mastered && (
                            <div className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-300">
                              <Star className="w-3 h-3 inline mr-1" />
                              Thuộc
                            </div>
                          )}
                        </div>
                        
                        {settings.showMeaning && (
                          <p className="text-white/90 mb-2">{word.meaning}</p>
                        )}
                        
                        {settings.showExample && word.example && (
                          <p className="text-white/70 text-sm mb-2 italic">"{word.example}"</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/60">
                          <span>{word.category}</span>
                          {word.tags.length > 0 && (
                            <span>Tags: {word.tags.join(', ')}</span>
                          )}
                          <span>Ôn: {word.reviewCount} lần</span>
                          <span>Thêm: {word.createdAt.toLocaleDateString()}</span>
                        </div>
                        
                        {word.notes && (
                          <p className="text-white/60 text-sm mt-2 italic">{word.notes}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleReview(word.id)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Đánh dấu đã ôn"
                        >
                          <Clock className="w-4 h-4 sm:w-4 sm:h-4 text-blue-400" />
                        </button>
                        
                        <button
                          onClick={() => handleMaster(word.id)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Đánh dấu đã thuộc"
                        >
                          <Target className="w-4 h-4 sm:w-4 sm:h-4 text-purple-400" />
                        </button>
                        
                        <button
                          onClick={() => handleEdit(word)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4 sm:w-4 sm:h-4 text-yellow-400" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(word.id)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash className="w-4 h-4 sm:w-4 sm:h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyManager; 