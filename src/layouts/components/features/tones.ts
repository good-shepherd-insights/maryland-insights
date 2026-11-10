// Bar and tile colours used by the feature sections, keyed by the CMS "tone" field.
export const TONES: Record<string, string> = {
  yellow: "#FFB612",
  grey: "#8A8173",
  dark: "#121212",
  light: "#FDFBF7",
  orange: "#D9651A",
  pale: "#D9D0C0",
};
export const tone = (t?: string) => TONES[t ?? "yellow"] ?? TONES.yellow;
