/**
 * Parsea el campo customImageUrl (URLs separadas por "|") en:
 *  - previewUrl: snapshot compuesto del canvas (marcado con sufijo "#preview")
 *  - originals: imágenes originales subidas por el cliente
 */
export interface ParsedCustomImages {
  previewUrl: string | null;
  originals: string[];
}

export const parseCustomImages = (raw: string | null | undefined): ParsedCustomImages => {
  if (!raw) return { previewUrl: null, originals: [] };
  const segments = raw.split('|').filter(Boolean);
  let previewUrl: string | null = null;
  const originals: string[] = [];
  for (const seg of segments) {
    if (seg.includes('#preview')) {
      // Solo conservamos el primer preview encontrado
      if (!previewUrl) previewUrl = seg.replace(/#preview.*$/, '');
    } else {
      originals.push(seg);
    }
  }
  return { previewUrl, originals };
};
