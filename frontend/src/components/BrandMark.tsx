// Ratio réel du fichier logo (652x383) — width dérivé pour ne jamais déformer
// ou rogner l'image, peu importe le CSS ambiant.
const RATIO = 652 / 383;

export function BrandMark({ height = 32 }: { height?: number }) {
  const width = Math.round(height * RATIO);
  return (
    <img
      src="/logos/jiropay-logo.png"
      alt="JiroPay"
      width={width}
      height={height}
      style={{ height, width, objectFit: "contain", display: "block" }}
    />
  );
}
