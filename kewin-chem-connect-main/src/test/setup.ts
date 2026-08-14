import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

Object.defineProperties(HTMLElement.prototype, {
  hasPointerCapture: {
    value: vi.fn(() => false),
  },
  releasePointerCapture: {
    value: vi.fn(),
  },
  setPointerCapture: {
    value: vi.fn(),
  },
  scrollIntoView: {
    value: vi.fn(),
  },
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
