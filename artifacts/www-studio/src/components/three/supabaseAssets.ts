// Types for 3D Asset Library
export type AssetType = 'glb' | 'texture' | 'hdr' | 'font';

export interface ThreeAsset {
  id: string;
  user_id: string;
  name: string;
  type: AssetType;
  url: string;
  size_bytes: number;
  thumbnail_url: string | null;
  tags: string[];
  created_at: string;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  glb: '3D Models',
  texture: 'Textures',
  hdr: 'HDRIs',
  font: 'Fonts',
};

export const ACCEPTED_MIME_TYPES: Record<AssetType, string[]> = {
  glb: ['model/gltf-binary', 'model/gltf+json', '.glb', '.gltf'],
  texture: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg', '.png', '.jpg', '.jpeg', '.webp'],
  hdr: ['image/vnd.radiance', 'application/octet-stream', '.hdr', '.exr'],
  font: ['font/ttf', 'font/otf', 'font/woff', 'font/woff2', '.ttf', '.otf', '.woff', '.woff2'],
};
