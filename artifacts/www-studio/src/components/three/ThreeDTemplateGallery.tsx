import React, { useState, useMemo } from 'react';
import { sceneTemplates, type SceneTemplate } from '@/utils/three/sceneTemplates';

interface ThreeDTemplateGalleryProps {
  isOpen: boolean;
  onLoadTemplate: (config: Partial<SceneTemplate['config']>) => void;
  onClose: () => void;
}

const ALL_CATEGORIES = ['All', ...Array.from(new Set(sceneTemplates.map((t) => t.category)))];

export default function ThreeDTemplateGallery({ isOpen, onLoadTemplate, onClose }: ThreeDTemplateGalleryProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = useMemo(() => {
    return sceneTemplates.filter((t) => {
      const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[85vh] bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">3D Scene Templates</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-xl">✕</button>
        </div>

        {/* Search + Filters */}
        <div className="p-4 border-b border-zinc-800 space-y-3">
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
          />
          <div className="flex gap-2 overflow-x-auto">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((template) => (
              <button
                key={template.id}
                onClick={() => onLoadTemplate(template.config)}
                className="group text-left p-4 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-purple-500/50 rounded-xl transition-all"
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <div className="text-sm font-medium text-zinc-200 group-hover:text-purple-300 transition-colors">
                  {template.name}
                </div>
                <div className="text-xs text-zinc-500 mt-1 line-clamp-2">
                  {template.description}
                </div>
                <div className="mt-2 text-[10px] text-zinc-600">
                  {template.category}
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-zinc-500 py-8">No templates match your search.</div>
          )}
        </div>

        <div className="p-3 border-t border-zinc-800 text-center">
          <button
            onClick={() => {
              const random = sceneTemplates[Math.floor(Math.random() * sceneTemplates.length)];
              onLoadTemplate(random.config);
            }}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            🎲 Surprise Me
          </button>
        </div>
      </div>
    </div>
  );
}
