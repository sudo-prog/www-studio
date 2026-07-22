import React, { useState, useCallback } from 'react';
import { ACCEPTED_MIME_TYPES, ASSET_TYPE_LABELS, type AssetType, type ThreeAsset } from './supabaseAssets';

interface ThreeDAssetLibraryProps {
  isOpen: boolean;
  onModelSelect: (url: string) => void;
  onClose: () => void;
}

const ASSET_TYPES: AssetType[] = ['glb', 'texture', 'hdr', 'font'];

// Max file sizes per asset type (in bytes)
const MAX_FILE_SIZES: Record<AssetType, number> = {
  glb: 200 * 1024 * 1024,      // 200MB for GLB/GLTF models
  texture: 50 * 1024 * 1024,   // 50MB for textures
  hdr: 100 * 1024 * 1024,      // 100MB for HDR environments
  font: 10 * 1024 * 1024,      // 10MB for fonts
};

export default function ThreeDAssetLibrary({ isOpen, onModelSelect, onClose }: ThreeDAssetLibraryProps) {
  const [activeTab, setActiveTab] = useState<AssetType>('glb');
  const [assets, setAssets] = useState<ThreeAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const maxSize = MAX_FILE_SIZES[activeTab];
    const sizeLabel = activeTab === 'glb' ? '200MB' : activeTab === 'texture' ? '50MB' : activeTab === 'hdr' ? '100MB' : '10MB';
    
    // Validate file sizes
    const oversizedFiles = Array.from(files).filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles.map(f => f.name).join(', ')} exceed${oversizedFiles.length === 1 ? 's' : ''} the ${sizeLabel} limit for ${ASSET_TYPE_LABELS[activeTab].toLowerCase()}.`);
      e.target.value = '';
      return;
    }
    
    setError(null);
    setUploading(true);
    // Upload placeholder — actual Supabase Storage upload requires auth context
    // In production: upload to 'three-assets' bucket, insert into three_assets table
    await new Promise((r) => setTimeout(r, 500));
    const newAssets: ThreeAsset[] = Array.from(files).map((file, i) => ({
      id: `temp-${Date.now()}-${i}`,
      user_id: 'guest',
      name: file.name,
      type: activeTab,
      url: URL.createObjectURL(file),
      size_bytes: file.size,
      thumbnail_url: null,
      tags: [],
      created_at: new Date().toISOString(),
    }));
    setAssets((prev) => [...prev, ...newAssets]);
    setUploading(false);
    e.target.value = '';
  }, [activeTab]);

  const handleSelect = (asset: ThreeAsset) => {
    onModelSelect(asset.url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[80vh] bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">3D Asset Library</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-xl">✕</button>
        </div>

        <div className="flex border-b border-zinc-800">
          {ASSET_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex-1 px-4 py-2 text-sm transition-colors ${
                activeTab === type
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-zinc-800/50'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {ASSET_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <div className="p-4">
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-700 hover:border-purple-500/50 rounded-lg cursor-pointer transition-colors">
            <span className="text-sm text-zinc-400 mb-2">
              {uploading ? 'Uploading...' : `Drop ${ASSET_TYPE_LABELS[activeTab]} here or click to browse`}
            </span>
            <input
              type="file"
              accept={ACCEPTED_MIME_TYPES[activeTab].join(',')}
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {error && (
            <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {assets.length === 0 ? (
            <div className="text-center text-zinc-500 py-8 text-sm">
              No assets yet. Upload your first {ASSET_TYPE_LABELS[activeTab].toLowerCase()}.
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {assets
                .filter((a) => a.type === activeTab)
                .map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => handleSelect(asset)}
                    className="group p-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-purple-500/50 rounded-lg transition-all text-left"
                  >
                    <div className="aspect-square bg-zinc-700 rounded mb-2 flex items-center justify-center">
                      {asset.thumbnail_url ? (
                        <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <span className="text-2xl">
                          {asset.type === 'glb' ? '📦' : asset.type === 'texture' ? '🖼️' : asset.type === 'hdr' ? '🌅' : '🔤'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-300 truncate">{asset.name}</div>
                    {asset.size_bytes && (
                      <div className="text-[10px] text-zinc-600">{(asset.size_bytes / 1024).toFixed(0)} KB</div>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
