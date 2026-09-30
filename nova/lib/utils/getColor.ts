const COLOR_NAMES: Record<string, string> = {
  "#F5EFE6": "Linen",
  "#111827": "Rich Black",
  "#4F7CFF": "Cornflower Blue",
  "#F4A6C6": "Cotton Candy Pink",
  "#E5E7EB": "Light Gray",
  "#94A3B8": "Slate Gray",
  "#F3F4F6": "Cloud Gray",
  "#EF4444": "Red",
};

export function getColorName(hex: string | any): string {
  return COLOR_NAMES[hex.toUpperCase()] ?? hex;
}
