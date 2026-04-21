export interface KeyboardKey {
  char: string;
  label: string;
  value: number;
  finalValue?: number;
}

export interface KeyboardConfig {
  showFinals: boolean;
  colorSystem: string;
  gematriaSystem: string;
}

export interface KeyboardActions {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onClear: () => void;
}
