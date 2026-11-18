// Shape of the screen specs exported from Figma (data/source/figma_scripts/export_render.js).
export type Num = number | [string, number]; // raw px, or [Figma variable name, px fallback]

export interface Paint {
  c?: string | null; // Figma colour variable
  h?: string;        // hex fallback
  o?: number;        // paint opacity
  img?: string;      // image hash
  m?: 'FILL' | 'FIT' | 'CROP' | 'TILE';
  t?: number[][];    // crop transform
  sf?: number;       // tile scale
  lg?: [string, number, number][]; // linear gradient stops [hex, alpha, position]
  tr?: number[][];   // gradient transform
}

export interface Effect { t: string; c: [string, number] | null; x?: number; y?: number; b?: number; s?: number }

export interface Seg { x: string; s?: string | null; f?: Paint[]; fs?: number; fn?: string; dec?: string; tc?: string }

export interface SpecNode {
  n: string;
  t: 'F' | 'I' | 'T' | 'E' | 'R' | 'G';
  w: number; h: number;
  x?: number; y?: number; abs?: 1;
  rot?: number; op?: number;
  sz?: string; grow?: 1; st?: 1; minW?: number; maxW?: number;
  c?: string;   // main component "Set / Variant"
  g?: string;   // vector art file in /gfx
  f?: Paint[]; b?: Paint[]; bw?: number | number[]; ba?: string; dash?: 1;
  r?: number | number[] | [string, number];
  fx?: string; fxr?: Effect[];
  clip?: 1;
  L?: { d: 'r' | 'c'; g: Num; p: Num[]; a: string; ca: string; ps: string; cs: string; wrap?: Num; rz?: 1 };
  // text
  txt?: string; s?: string | null; al?: string; va?: string; ar?: string; trunc?: number;
  fs?: number; fn?: string; dec?: string; tc?: string; seg?: Seg[];
  k?: SpecNode[];
}
