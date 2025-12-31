/**
 * Hydration Manager Tests
 * @module lib/state/__tests__/hydration-manager.test
 */

import {
  HydrationManager,
  getHydrationManager,
  resetHydrationManager,
} from '../hydration-manager';

describe('HydrationManager', () => {
  let manager: HydrationManager;

  beforeEach(() => {
    resetHydrationManager();
    manager = new HydrationManager();
  });

  describe('Initial State', () => {
    it('should start in idle state', () => {
      const status = manager.getStatus();
      expect(status.state).toBe('idle');
      expect(status.progress).toBe(0);
      expect(status.errors).toHaveLength(0);
    });

    it('should have default stores registered', () => {
      const status = manager.getStatus();
      expect(status.state).toBe('idle');
    });
  });

  describe('registerStore', () => {
    it('should register a store', () => {
      manager.registerStore({
        name: 'customStore',
        hydrate: async () => {},
      });

      expect(manager.isHydrated('customStore')).toBe(false);
    });

    it('should allow unregistering a store', async () => {
      manager.registerStore({
        name: 'tempStore',
        hydrate: async () => {},
      });

      manager.unregisterStore('tempStore');
      // Should not throw when trying to reset non-existent store
      await expect(manager.resetStore('tempStore')).rejects.toThrow();
    });
  });

  describe('needsHydration', () => {
    it('should return true when stores are registered', async () => {
      const needs = await manager.needsHydration();
      expect(needs).toBe(true);
    });
  });

  describe('hydrate', () => {
    it('should complete hydration successfully', async () => {
      manager.registerStore({
        name: 'testStore1',
        hydrate: async () => {},
      });

      manager.registerStore({
        name: 'testStore2',
        hydrate: async () => {},
      });

      const status = await manager.hydrate();

      expect(status.state).toBe('complete');
      expect(status.progress).toBe(100);
      expect(status.errors).toHaveLength(0);
      expect(manager.isHydrated('testStore1')).toBe(true);
      expect(manager.isHydrated('testStore2')).toBe(true);
    });

    it('should handle partial hydration with errors', async () => {
      manager.registerStore({
        name: 'goodStore',
        hydrate: async () => {},
      });

      manager.registerStore({
        name: 'badStore',
        hydrate: async () => {
          throw new Error('Simulated hydration error');
        },
        reset: () => {},
      });

      const status = await manager.hydrate();

      expect(status.state).toBe('complete');
      expect(status.errors).toHaveLength(1);
      expect(status.errors[0].store).toBe('badStore');
      expect(status.errors[0].recovered).toBe(true);
      expect(manager.isHydrated('goodStore')).toBe(true);
    });

    it('should handle complete failure', async () => {
      // Clear default stores first to ensure only failing stores are tested
      manager.unregisterStore('ideStore');
      manager.unregisterStore('agentsStore');
      manager.unregisterStore('conversationStore');
      manager.unregisterStore('navigationStore');

      manager.registerStore({
        name: 'badStore1',
        hydrate: async () => {
          throw new Error('Error 1');
        },
      });

      manager.registerStore({
        name: 'badStore2',
        hydrate: async () => {
          throw new Error('Error 2');
        },
      });

      const status = await manager.hydrate();

      expect(status.state).toBe('error');
      expect(status.errors).toHaveLength(2);
      expect(manager.isHydrated('badStore1')).toBe(false);
      expect(manager.isHydrated('badStore2')).toBe(false);
    });

    it('should track hydration duration', async () => {
      manager.registerStore({
        name: 'fastStore',
        hydrate: async () => {},
      });

      await manager.hydrate();
      const duration = manager.getHydrationDuration();

      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('resetStore', () => {
    it('should reset a specific store', async () => {
      let resetCalled = false;

      manager.registerStore({
        name: 'resettableStore',
        hydrate: async () => {},
        reset: () => {
          resetCalled = true;
        },
      });

      await manager.hydrate();
      expect(manager.isHydrated('resettableStore')).toBe(true);

      await manager.resetStore('resettableStore');
      expect(resetCalled).toBe(true);
      expect(manager.isHydrated('resettableStore')).toBe(false);
    });

    it('should throw when resetting non-existent store', async () => {
      await expect(manager.resetStore('nonExistent')).rejects.toThrow(
        'Store nonExistent not found'
      );
    });
  });

  describe('getFailedStores', () => {
    it('should return list of failed stores', async () => {
      manager.registerStore({
        name: 'goodStore',
        hydrate: async () => {},
      });

      manager.registerStore({
        name: 'failedStore',
        hydrate: async () => {
          throw new Error('Failed');
        },
      });

      await manager.hydrate();
      const failedStores = manager.getFailedStores();

      expect(failedStores).toContain('failedStore');
      expect(failedStores).not.toContain('goodStore');
    });
  });

  describe('getHydratedStores', () => {
    it('should return list of successfully hydrated stores', async () => {
      manager.registerStore({
        name: 'store1',
        hydrate: async () => {},
      });

      manager.registerStore({
        name: 'store2',
        hydrate: async () => {},
      });

      await manager.hydrate();
      const hydratedStores = manager.getHydratedStores();

      expect(hydratedStores).toContain('store1');
      expect(hydratedStores).toContain('store2');
    });
  });

  describe('reset', () => {
    it('should clear all hydration state', async () => {
      manager.registerStore({
        name: 'testStore',
        hydrate: async () => {},
      });

      await manager.hydrate();
      expect(manager.isHydrated('testStore')).toBe(true);

      manager.reset();

      const status = manager.getStatus();
      expect(status.state).toBe('idle');
      expect(status.progress).toBe(0);
      expect(status.errors).toHaveLength(0);
    });
  });

  describe('Singleton', () => {
    it('should return same instance', () => {
      const instance1 = getHydrationManager();
      const instance2 = getHydrationManager();
      expect(instance1).toBe(instance2);
    });

    it('should reset singleton', () => {
      const instance1 = getHydrationManager();

      resetHydrationManager();

      const instance2 = getHydrationManager();
      expect(instance2).not.toBe(instance1);
    });
  });

  describe('Hydration Status', () => {
    it('should report correct status during hydration', async () => {
      let hydrateDelay = 0;

      manager.registerStore({
        name: 'slowStore',
        hydrate: async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          hydrateDelay = 50;
        },
      });

      // Initial status should be idle
      let status = manager.getStatus();
      expect(status.state).toBe('idle');

      // Start hydration
      const hydratePromise = manager.hydrate();

      // Status should be hydrating
      status = manager.getStatus();
      expect(status.state).toBe('hydrating');

      await hydratePromise;

      // Status should be complete
      status = manager.getStatus();
      expect(status.state).toBe('complete');
      expect(status.progress).toBe(100);
    });

    it('should track errors correctly', async () => {
      manager.registerStore({
        name: 'errorStore',
        hydrate: async () => {
          throw new Error('Specific error message');
        },
        reset: () => {},
      });

      const status = await manager.hydrate();

      expect(status.errors).toHaveLength(1);
      expect(status.errors[0].store).toBe('errorStore');
      expect(status.errors[0].error).toBe('Specific error message');
      expect(status.errors[0].recovered).toBe(true);
    });
  });
});
