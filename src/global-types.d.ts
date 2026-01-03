/**
 * WebGPU API Type Declarations
 *
 * Type augmentations for experimental WebGPU API
 */

declare global {
  interface GPU {
    requestAdapter(): Promise<GPUAdapter | null>;
  }

  interface Navigator {
    readonly gpu?: GPU;
  }
}

export {};
