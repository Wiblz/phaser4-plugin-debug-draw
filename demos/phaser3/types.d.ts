import type DebugDrawPlugin from '../../src/main';

declare global {
  namespace Phaser {
    interface Scene {
      debugDraw: DebugDrawPlugin;
    }
  }
}
