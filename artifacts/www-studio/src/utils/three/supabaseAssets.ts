export interface ThreeAsset {
  id: string;
  user_id: string;
  name: string;
  type: 'glb' | 'texture' | 'hdr' | 'font';
  url: string;
  size_bytes: number | null;
  thumbnail_url: string | null;
  tags: string[];
  created_at: string;
}

export type AssetType = ThreeAsset['type'];

export const ACCEPTED_MIME_TYPES: Record<AssetType, string[]> = {
  glb: ['model/gltf-binary', 'model/gltf+json', '.glb', '.gltf'],
  texture: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg', '.png', '.jpg', '.jpeg', '.webp'],
  hdr: ['application/octet-stream', 'image/vnd.radiance', '.hdr', '.exr'],
  font: ['font/woff', 'font/woff2', 'application/font-woff', '.ttf', '.otf', '.woff', '.woff2'],
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  glb: '3D Models',
  texture: 'Textures',
  hdr: 'HDR Environments',
  font: 'Fonts',
};
