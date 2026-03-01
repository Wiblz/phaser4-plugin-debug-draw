import Phaser from 'phaser';
import colors from './colors';
import type {
  DrawableGameObject,
  InputGameObject,
  PhaserCamera,
  PhaserLight,
  PhaserSystems,
} from './types';

const { cos, max, sin } = Math;
const { START, PRE_RENDER, SHUTDOWN, DESTROY } = Phaser.Scenes.Events;
const POINTER_RADIUS = 20;

export interface DebugDrawConfig {
  alpha?: number;
  cameraBoundsColor?: number;
  cameraDeadzoneColor?: number;
  cameraFollowColor?: number;
  color?: number;
  inputColor?: number;
  inputDisabledColor?: number;
  lightColor?: number;
  lineWidth?: number;
  maskColor?: number;
  pointerColor?: number;
  pointerDownColor?: number;
  pointerInactiveColor?: number;
  showInactivePointers?: boolean;
  showInput?: boolean;
  showLights?: boolean;
  showPointers?: boolean;
  showRotation?: boolean;
}

class DebugDrawPlugin extends Phaser.Plugins.ScenePlugin {
  // Configuration properties
  alpha: number = 1;
  cameraBoundsColor: number = colors.fuchsia;
  cameraDeadzoneColor: number = colors.orange;
  cameraFollowColor: number = colors.orange;
  color: number = colors.aqua;
  inputColor: number = colors.yellow;
  inputDisabledColor: number = colors.silver;
  lightColor: number = colors.purple;
  lineWidth: number = 1;
  maskColor: number = colors.red;
  pointerColor: number = colors.yellow;
  pointerDownColor: number = colors.green;
  pointerInactiveColor: number = colors.silver;
  showInactivePointers: boolean = false;
  showInput: boolean = true;
  showLights: boolean = true;
  showPointers: boolean = true;
  showRotation: boolean = true;

  private graphic!: Phaser.GameObjects.Graphics;

  boot(): void {
    const systems = this.systems as PhaserSystems;

    systems.events
      .on(START, this.sceneStart, this)
      .on(PRE_RENDER, this.scenePreRender, this)
      .on(SHUTDOWN, this.sceneShutdown, this)
      .once(DESTROY, this.sceneDestroy, this);

    if (systems.settings.isBooted) {
      this.sceneStart();
    }
  }

  sceneStart(): void {
    if (!this.scene) return;
    this.graphic = this.scene.add.graphics().setDepth(Number.MAX_VALUE);
  }

  sceneShutdown(): void {
    if (this.graphic) {
      this.graphic.destroy();
    }
  }

  scenePreRender(): void {
    this.drawAll();
  }

  drawAll(): void {
    if (!this.systems) return;
    const systems = this.systems as PhaserSystems;
    const { cameras, displayList, lights } = systems;

    if (!displayList.length) return;

    const disabledInputObjs: Phaser.GameObjects.GameObject[] = [];
    const inputObjs: Phaser.GameObjects.GameObject[] = [];
    const maskObjs: Phaser.GameObjects.GameObject[] = [];
    const otherObjs: Phaser.GameObjects.GameObject[] = [];
    const showInput = this.showInput && systems.input.isActive();

    this.graphic.clear();

    displayList.each(
      this.processObj,
      this,
      disabledInputObjs,
      inputObjs,
      maskObjs,
      otherObjs,
      showInput
    );

    if (otherObjs.length) {
      this.drawOthers(otherObjs);
    }

    if (disabledInputObjs.length) {
      this.drawDisabledInputs(disabledInputObjs);
    }

    if (inputObjs.length) {
      this.drawInputs(inputObjs);
    }

    if (maskObjs.length) {
      this.drawMasks(maskObjs);
    }

    if (showInput && this.showPointers) {
      this.drawPointers(this.getPointers());
    }

    this.drawCamera(cameras.main);

    if (lights && lights.active && this.showLights) {
      this.drawLights(lights.lights);
    }

    // For Mesh/Rope debug callbacks
    this.setColor(this.color);
  }

  processObj(
    obj: Phaser.GameObjects.GameObject,
    disabledInputObjs: Phaser.GameObjects.GameObject[],
    inputObjs: Phaser.GameObjects.GameObject[],
    maskObjs: Phaser.GameObjects.GameObject[],
    otherObjs: Phaser.GameObjects.GameObject[],
    showInput: boolean
  ): void {
    const inputObj = obj as InputGameObject;

    if (inputObj.input && showInput) {
      if (inputObj.input.enabled) {
        inputObjs[inputObjs.length] = obj;
      } else {
        disabledInputObjs[disabledInputObjs.length] = obj;
      }
    } else if (inputObj.type === 'Layer') {
      // Process Layer children
      if (inputObj.list && Array.isArray(inputObj.list)) {
        inputObj.list.forEach((child: Phaser.GameObjects.GameObject) => {
          this.processObj(child, disabledInputObjs, inputObjs, maskObjs, otherObjs, showInput);
        });
      }
    } else {
      otherObjs[otherObjs.length] = obj;
    }

    const maskObj = inputObj.mask ? inputObj.mask.bitmapMask : null;

    if (maskObj && maskObjs.indexOf(maskObj) === -1) {
      maskObjs[maskObjs.length] = maskObj;
    }
  }

  sceneDestroy(): void {
    if (!this.systems) return;

    const systems = this.systems as PhaserSystems;

    systems.events
      .off(START, this.sceneStart, this)
      .off(PRE_RENDER, this.scenePreRender, this)
      .off(SHUTDOWN, this.sceneShutdown, this)
      .off(DESTROY, this.sceneDestroy, this);
  }

  drawOthers(objs: Phaser.GameObjects.GameObject[]): void {
    this.setColor(this.color);
    objs.forEach(this.drawObj, this);
  }

  drawDisabledInputs(objs: Phaser.GameObjects.GameObject[]): void {
    this.setColor(this.inputDisabledColor);
    objs.forEach(this.drawObjInput, this);
  }

  drawInputs(objs: Phaser.GameObjects.GameObject[]): void {
    this.setColor(this.inputColor);
    objs.forEach(this.drawObjInput, this);
  }

  drawMasks(objs: Phaser.GameObjects.GameObject[]): void {
    this.setColor(this.maskColor);
    objs.forEach(this.drawObj, this);
  }

  drawObj(obj: Phaser.GameObjects.GameObject): void {
    const drawable = obj as unknown as DrawableGameObject;
    this.dot(drawable.x, drawable.y);

    if ('originX' in drawable && drawable.originX !== undefined && drawable.originY !== undefined) {
      let width = drawable.width || 0;
      let height = drawable.height || 0;

      if ('displayWidth' in drawable) {
        width = drawable.displayWidth || 0;
        height = drawable.displayHeight || 0;
      }

      if (width || height) {
        this.graphic.strokeRect(
          drawable.x - drawable.originX * width,
          drawable.y - drawable.originY * height,
          width,
          height
        );

        if (drawable.rotation && this.showRotation) {
          const rad = 0.5 * max(width, height);
          this.line(
            drawable.x,
            drawable.y,
            cos(drawable.rotation) * rad,
            sin(drawable.rotation) * rad
          );
        }
      }
    }
  }

  drawObjInput(obj: Phaser.GameObjects.GameObject): void {
    this.drawObj(obj);
  }

  drawPointers(pointers: Phaser.Input.Pointer[]): void {
    pointers.forEach(this.drawPointer, this);
  }

  drawPointer(pointer: Phaser.Input.Pointer): void {
    if (!pointer.active && !this.showInactivePointers) return;
    if (!this.systems) return;

    const { x, y, zoom } = this.systems.cameras.main;
    const worldX = pointer.worldX - x;
    const worldY = pointer.worldY - y;

    this.setColor(this.getColorForPointer(pointer));

    if (pointer.locked) {
      this.graphic.strokeRect(
        worldX - POINTER_RADIUS,
        worldY - POINTER_RADIUS,
        2 * POINTER_RADIUS,
        2 * POINTER_RADIUS
      );
      this.line(worldX, worldY, pointer.movementX, pointer.movementY);
    } else {
      this.graphic.strokeCircle(worldX, worldY, POINTER_RADIUS);
    }

    if (pointer.isDown) {
      this.line(
        worldX,
        worldY,
        (pointer.downX - pointer.x) / zoom,
        (pointer.downY - pointer.y) / zoom
      );
    }
  }

  drawCamera(camera: Phaser.Cameras.Scene2D.Camera): void {
    const extendedCamera = camera as PhaserCamera;

    if (camera.useBounds && extendedCamera._bounds) {
      this.setColor(this.cameraBoundsColor);
      this.graphic.strokeRectShape(extendedCamera._bounds);
    }

    if (camera.deadzone) {
      this.setColor(this.cameraDeadzoneColor);
      this.graphic.strokeRectShape(camera.deadzone);
    }

    if (extendedCamera._follow && camera.followOffset) {
      this.setColor(this.cameraFollowColor);
      this.dot(extendedCamera._follow.x, extendedCamera._follow.y);
      this.lineDelta(extendedCamera._follow, camera.followOffset, -1);
    }
  }

  drawLights(lights: PhaserLight[]): void {
    this.setColor(this.lightColor);
    lights.forEach(this.drawLight, this);
  }

  drawLight(light: PhaserLight): void {
    this.graphic.strokeCircleShape(light as unknown as Phaser.Geom.Circle);
  }

  getColorForPointer(pointer: Phaser.Input.Pointer): number {
    if (pointer.isDown) return this.pointerDownColor;
    if (!pointer.active) return this.pointerInactiveColor;
    return this.pointerColor;
  }

  getPointers(): Phaser.Input.Pointer[] {
    if (!this.systems) return [];
    const systems = this.systems as PhaserSystems;
    const { input } = systems;

    return [
      input.mousePointer,
      input.pointer1,
      input.pointer2,
      input.pointer3,
      input.pointer4,
      input.pointer5,
      input.pointer6,
      input.pointer7,
      input.pointer8,
      input.pointer9,
    ].filter(Boolean) as Phaser.Input.Pointer[];
  }

  toggle(): void {
    this.graphic.setVisible(!this.graphic.visible);
  }

  setColor(color: number): void {
    this.graphic.fillStyle(color, this.alpha).lineStyle(this.lineWidth, color, this.alpha);
  }

  line(x: number, y: number, dx: number, dy: number): void {
    if (!dx && !dy) return;
    this.graphic.lineBetween(x, y, x + dx, y + dy);
  }

  lineDelta(
    start: { x: number; y: number },
    delta: { x: number; y: number },
    scale: number = 1
  ): void {
    this.line(start.x, start.y, scale * delta.x, scale * delta.y);
  }

  dot(x: number, y: number): void {
    this.graphic.fillPoint(x, y, 3 * this.lineWidth);
  }

  dotPoint(p: { x: number; y: number }): void {
    this.dot(p.x, p.y);
  }
}

export default DebugDrawPlugin;
