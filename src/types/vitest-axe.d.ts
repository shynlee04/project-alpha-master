declare module 'vitest-axe' {
  export { axe, toHaveNoViolations } from 'jest-axe';
}

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
