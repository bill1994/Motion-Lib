export type CompositionCategory =
  | 'typography'
  | 'card'
  | 'entrance'
  | 'transition'
  | 'vfx'
  | 'character';

export interface CompositionVariant {
  id: string;
  props: Record<string, string>;
  desc?: string;
}

export interface CatalogEntry {
  name: string;
  category: CompositionCategory;
  description: string;
  params?: Record<string, { type: string; default: string; desc: string }>;
  compositions?: CompositionVariant[];
}
