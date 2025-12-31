/**
 * Hydration Manager
 * @module lib/state/hydration-manager
 *
 * Manages Zustand store hydration from Dexie with error recovery.
 */

export type HydrationState = 'idle' | 'hydrating' | 'complete' | 'error';

export interface HydrationStatus {
  state: HydrationState;
  progress: number;
  errors: HydrationError[];
}

export interface HydrationError {
  store: string;
  error: string;
  recovered: boolean;
}

export interface StoreHydrator {
  name: string;
  hydrate: () => Promise<void>;
  reset?: () => void;
  schema?: unknown;
}

const MAX_HYDRATION_TIME = 5000; // 5 seconds max

/**
 * Hydration Manager for coordinating store hydration with error recovery
 */
export class HydrationManager {
  private status: HydrationStatus = {
    state: 'idle',
    progress: 0,
    errors: [],
  };
  private stores: Map<string, StoreHydrator> = new Map();
  private hydratedStores: Set<string> = new Set();
  private hydrationStartTime = 0;

  constructor() {
    // Register default stores
    this.registerStore({
      name: 'ideStore',
      hydrate: async () => {},
    });
    this.registerStore({
      name: 'agentsStore',
      hydrate: async () => {},
    });
    this.registerStore({
      name: 'conversationStore',
      hydrate: async () => {},
    });
    this.registerStore({
      name: 'navigationStore',
      hydrate: async () => {},
    });
  }

  /**
   * Register a store for hydration
   */
  registerStore(hydrator: StoreHydrator): void {
    this.stores.set(hydrator.name, hydrator);
  }

  /**
   * Unregister a store
   */
  unregisterStore(name: string): void {
    this.stores.delete(name);
  }

  /**
   * Check if hydration is needed
   */
  async needsHydration(): Promise<boolean> {
    // Check if any stores have existing data
    // This is a simplified check - in production, you'd check Dexie directly
    return this.stores.size > 0;
  }

  /**
   * Hydrate all registered stores
   */
  async hydrate(): Promise<HydrationStatus> {
    this.hydrationStartTime = Date.now();
    this.status = {
      state: 'hydrating',
      progress: 0,
      errors: [],
    };
    this.hydratedStores.clear();

    const storeNames = Array.from(this.stores.keys());
    const totalStores = storeNames.length;
    let completedStores = 0;

    // Hydrate stores in parallel with timeout
    const hydrationPromises = storeNames.map(async (name) => {
      try {
        const hydrator = this.stores.get(name);
        if (!hydrator) {
          throw new Error(`Store ${name} not found`);
        }

        // Apply timeout
        const hydratePromise = hydrator.hydrate();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Hydration timeout')), MAX_HYDRATION_TIME);
        });

        await Promise.race([hydratePromise, timeoutPromise]);

        this.hydratedStores.add(name);
        completedStores++;

        // Update progress
        this.status.progress = Math.round((completedStores / totalStores) * 100);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        this.status.errors.push({
          store: name,
          error: errorMessage,
          recovered: false,
        });

        // Try to reset the store to defaults
        const hydrator = this.stores.get(name);
        if (hydrator?.reset) {
          try {
            hydrator.reset();
            this.status.errors[this.status.errors.length - 1].recovered = true;
          } catch (resetError) {
            console.error(`Failed to reset store ${name}:`, resetError);
          }
        }
      }
    });

    await Promise.all(hydrationPromises);

    // Determine final state
    if (this.status.errors.length > 0) {
      this.status.state = this.hydratedStores.size > 0 ? 'complete' : 'error';
    } else {
      this.status.state = 'complete';
    }
    this.status.progress = 100;

    return this.status;
  }

  /**
   * Get current hydration status
   */
  getStatus(): HydrationStatus {
    return { ...this.status };
  }

  /**
   * Check if a specific store is hydrated
   */
  isHydrated(storeName: string): boolean {
    return this.hydratedStores.has(storeName);
  }

  /**
   * Get hydration duration
   */
  getHydrationDuration(): number {
    return Date.now() - this.hydrationStartTime;
  }

  /**
   * Reset a specific store
   */
  async resetStore(storeName: string): Promise<void> {
    const hydrator = this.stores.get(storeName);
    if (!hydrator) {
      throw new Error(`Store ${storeName} not found`);
    }

    if (hydrator.reset) {
      hydrator.reset();
    }

    this.hydratedStores.delete(storeName);
  }

  /**
   * Clear all hydration state
   */
  reset(): void {
    this.status = {
      state: 'idle',
      progress: 0,
      errors: [],
    };
    this.hydratedStores.clear();
  }

  /**
   * Get list of stores that failed to hydrate
   */
  getFailedStores(): string[] {
    return this.status.errors
      .filter((e) => !e.recovered)
      .map((e) => e.store);
  }

  /**
   * Get list of stores that hydrated successfully
   */
  getHydratedStores(): string[] {
    return Array.from(this.hydratedStores);
  }
}

// Singleton instance
let instance: HydrationManager | null = null;

export function getHydrationManager(): HydrationManager {
  if (!instance) {
    instance = new HydrationManager();
  }
  return instance;
}

export function resetHydrationManager(): void {
  instance = null;
}
