/**
 * Type extensions for Phaser properties not included in official type definitions.
 * These are runtime properties added by Phaser plugins.
 */

import type Phaser from 'phaser';

/**
 * Systems with plugin-injected properties (input, lights)
 */
export interface PhaserSystems extends Phaser.Scenes.Systems {
  input: Phaser.Input.InputPlugin;
  lights?: {
    active: boolean;
    lights: PhaserLight[];
  };
}

/**
 * Camera with private internal properties
 */
export interface PhaserCamera extends Phaser.Cameras.Scene2D.Camera {
  _bounds?: Phaser.Geom.Rectangle;
  _follow?: Phaser.GameObjects.GameObject & { x: number; y: number };
}

/**
 * Light2D object
 */
export interface PhaserLight {
  x: number;
  y: number;
  radius: number;
}

/**
 * GameObject with optional input component
 */
export interface InputGameObject {
  input?:
    | {
        enabled: boolean;
      }
    | Phaser.Types.Input.InteractiveObject
    | null;
  type: string;
  list?: Phaser.GameObjects.GameObject[];
  mask?: {
    bitmapMask?: Phaser.GameObjects.GameObject;
  } | null;
}

/**
 * GameObject with transform and dimension properties
 */
export interface DrawableGameObject {
  x: number;
  y: number;
  originX?: number;
  originY?: number;
  width?: number;
  height?: number;
  displayWidth?: number;
  displayHeight?: number;
  rotation?: number;
}
