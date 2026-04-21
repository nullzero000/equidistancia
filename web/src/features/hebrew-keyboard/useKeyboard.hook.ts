import { useState } from 'react';
import type { KeyboardActions } from './types';

interface UseKeyboardProps {
  input: string;
  setInput: (text: string) => void;
}

export function useKeyboard({ input, setInput }: UseKeyboardProps) {
  const [showFinals, setShowFinals] = useState(false);

  const actions: KeyboardActions = {
    onKeyPress: (char: string) => {
      setInput(input + char);
    },
    onBackspace: () => {
      setInput(input.slice(0, -1));
    },
    onSpace: () => {
      setInput(input + ' ');
    },
    onClear: () => {
      setInput('');
    },
  };

  const toggleFinals = () => setShowFinals(!showFinals);

  return { showFinals, toggleFinals, actions };
}
