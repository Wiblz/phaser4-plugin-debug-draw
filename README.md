# phaser4-plugin-debug-draw

> TypeScript debug draw plugin for Phaser 3.53+ and Phaser 4

Modern fork of [phaser-plugin-debug-draw](https://github.com/samme/phaser-plugin-debug-draw) with full TypeScript support, modern tooling, and compatibility with both Phaser 3 and Phaser 4.

## Features

- ✅ **Dual Phaser Support** - Works with Phaser 3.53.0+ and Phaser 4.0.0+
- ✅ **Full TypeScript** - Complete type safety with proper type definitions
- ✅ **Tiny Bundle** - ~9KB minified

### What it displays

- Game object position, origin, bounds, and rotation
- Interactive objects (input-enabled/disabled)
- Bitmap masks
- Input pointers (mouse/touch)
- Camera bounds, deadzone, and follow target
- Lights (Light2D system)
- Layers (recursively processes children)

## Installation

```bash
npm install phaser4-plugin-debug-draw
```

## Usage

### Register the plugin

```typescript
import Phaser from 'phaser';
import DebugDrawPlugin from 'phaser4-plugin-debug-draw';

const config = {
  // ... your game config
  plugins: {
    scene: [
      {
        key: 'DebugDrawPlugin',
        plugin: DebugDrawPlugin,
        mapping: 'debugDraw'
      }
    ]
  }
};

const game = new Phaser.Game(config);
```

### Use in your scene

```typescript
class MyScene extends Phaser.Scene {
  create() {
    // The plugin is automatically available as this.debugDraw

    // Customize colors (optional)
    this.debugDraw.color = 0x00ff00;
    this.debugDraw.inputColor = 0xff0000;

    // Toggle visibility
    this.debugDraw.toggle();
  }
}
```

## Configuration

All properties are optional and can be set at runtime:

```typescript
interface DebugDrawConfig {
  alpha?: number;                    // Default: 1
  cameraBoundsColor?: number;        // Default: 0xff00c3 (fuchsia)
  cameraDeadzoneColor?: number;      // Default: 0xeb7700 (orange)
  cameraFollowColor?: number;        // Default: 0xeb7700 (orange)
  color?: number;                    // Default: 0x00d9f7 (aqua)
  inputColor?: number;               // Default: 0xebcf00 (yellow)
  inputDisabledColor?: number;       // Default: 0x777777 (silver)
  lightColor?: number;               // Default: 0x8d00ff (purple)
  lineWidth?: number;                // Default: 1
  maskColor?: number;                // Default: 0xeb0012 (red)
  pointerColor?: number;             // Default: 0xebcf00 (yellow)
  pointerDownColor?: number;         // Default: 0x00d942 (green)
  pointerInactiveColor?: number;     // Default: 0x777777 (silver)
  showInactivePointers?: boolean;    // Default: false
  showInput?: boolean;               // Default: true
  showLights?: boolean;              // Default: true
  showPointers?: boolean;            // Default: true
  showRotation?: boolean;            // Default: true
}
```

## API

### Methods

- `toggle()` - Show/hide the debug graphics

## Known Limitations

- Does NOT show Game Objects in Containers
- Does NOT show Blitter Bobs
- Does NOT show Particle Emitters

## Differences from Original

This fork includes:

- **TypeScript** - Full type safety with `.d.ts` files
- **Phaser 4 support** - Tested with both v3 and v4
- **Smaller bundle** - ~15% smaller than original

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Type check
npm run typecheck

# Lint & format
npm run lint
npm run format
```

## Credits

Original plugin by [samme](https://github.com/samme/phaser-plugin-debug-draw)

## License

ISC
