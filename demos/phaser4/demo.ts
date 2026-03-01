/// <reference types="./types" />
import Phaser from 'phaser';
import DebugDrawPlugin from '../../src/main';

const WHITE = 0xffffff;
const GREEN = 0x00ffff;
const RED = 0xff0000;
const { Geom } = Phaser;
const { IncX } = Phaser.Actions;
const { WrapInRectangle } = Phaser.Actions;

const images = ['blue-planet', 'elephant', 'mask', 'nebula', 'starfield'].map((name) => ({
  key: name,
}));

let sprites: Phaser.GameObjects.GameObject[];
let maskImage: Phaser.GameObjects.Image;
let nebula: Phaser.GameObjects.TileSprite;
let starfield: Phaser.GameObjects.TileSprite;
let planet: Phaser.GameObjects.Image;
let controls: Phaser.Cameras.Controls.FixedKeyControl;
let bounds: Phaser.Geom.Rectangle;

function dragStart(
  _pointer: Phaser.Input.Pointer,
  gameObject: Phaser.GameObjects.GameObject
): void {
  (gameObject as Phaser.GameObjects.Sprite).setTint(GREEN, GREEN, RED, RED);
}

function drag(
  _pointer: Phaser.Input.Pointer,
  gameObject: Phaser.GameObjects.GameObject,
  dragX: number,
  dragY: number
): void {
  (gameObject as Phaser.GameObjects.Sprite).setPosition(dragX, dragY);
}

function dragEnd(_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
  (gameObject as Phaser.GameObjects.Sprite).clearTint();
}

function snapshot(this: Phaser.Scene): void {
  this.game.renderer.snapshot((image: HTMLImageElement) => {
    image.style.width = '200px';
    image.style.height = '150px';
    document.body.appendChild(image);
  });
}

const scene: Phaser.Types.Scenes.SettingsConfig & {
  preload?: (this: Phaser.Scene) => void;
  create?: (this: Phaser.Scene) => void;
  update?: (this: Phaser.Scene, time: number, delta: number) => void;
} = {
  preload: function (this: Phaser.Scene) {
    this.load.image(images);
  },

  create: function (this: Phaser.Scene) {
    this.lights.enable().setAmbientColor(WHITE);

    this.add.pointlight(512, 192, 0xffffff, 64, 0.5, 0.05);

    this.lights.addLight(128, 128, 256, RED, 2);

    bounds = new Geom.Rectangle(
      0,
      0,
      this.sys.game.config.width as number,
      this.sys.game.config.height as number
    );
    starfield = (this.add.tileSprite(512, 384, 1024, 1024, 'starfield') as any)
      .setBlendMode(1)
      .setPipeline('Light2D');
    nebula = (this.add.tileSprite(512, 384, 1024, 1024, 'nebula') as any)
      .setBlendMode(1)
      .setPipeline('Light2D');
    planet = this.add.image(512, 384, 'blue-planet');
    maskImage = this.make.image({ key: 'mask', add: false });

    const mask = (maskImage as any).createBitmapMask();

    planet.setMask(mask);

    const group = this.add.group({
      key: 'elephant',
      frameQuantity: 5,
      setXY: { x: 128, y: 64, stepX: 128, stepY: 128 },
      hitArea: new Geom.Rectangle(-16, 16, 128, 64),
      hitAreaCallback: Geom.Rectangle.Contains,
    });

    sprites = group.getChildren();

    (sprites[0] as Phaser.GameObjects.Sprite).setName('inertElephant').disableInteractive();

    (sprites[1] as Phaser.GameObjects.Sprite).setName('invisibleElephant').setVisible(false);

    (sprites[2] as Phaser.GameObjects.Sprite).setName('maskedElephant').setMask(mask);

    (sprites[3] as Phaser.GameObjects.Sprite).setName('infinitesimalElephant').setScale(0);

    const layer = this.add.layer();

    layer.add(sprites);

    Phaser.Actions.PropertyValueSet(sprites, 'angle', -15);

    this.input
      .setDraggable(sprites, true)
      .on('drag', drag)
      .on('dragstart', dragStart)
      .on('dragend', dragEnd);

    this.add.tween({
      targets: sprites,
      angle: 15,
      duration: 2000,
      ease: 'Sine.easeInOut',
      loop: -1,
      yoyo: true,
    });

    const mesh = (this.add as any)
      .mesh(512, 192, 'elephant')
      .setName('meshElephant')
      .addVertices([-1, 1, 1, 1, -1, -1, 1, -1], [0, 0, 1, 0, 0, 1, 1, 1], [0, 2, 1, 2, 3, 1])
      .panZ(40);

    mesh.setDebug((this.debugDraw as any).graphic);

    this.tweens.add({
      targets: mesh.modelRotation,
      props: {
        x: { value: '-0.5', delay: 0, duration: 1000 },
        y: { value: '-0.5', delay: 500, duration: 750 },
      },
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    });

    sprites.push(mesh);

    const rope = (this.add as any)
      .rope(768, 192, 'elephant', undefined, 10)
      .setName('elephantRope') as Phaser.GameObjects.Rope;

    rope.setDebug((this.debugDraw as any).graphic);

    this.add.tween({
      targets: rope.points,
      delay: (this.tweens as any).stagger(100),
      duration: 1000,
      ease: 'Sine.easeInOut',
      props: { y: 16 },
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        rope.setDirty();
      },
    });

    sprites.push(rope);

    this.add.text(0, 0, 'Drag the elephants around (Phaser 4)');

    this.add.star(128, 32, 5, 8, 16, 0xffffff, 0.5);

    this.input.keyboard
      .on(
        'keyup-T',
        function (this: Phaser.Scene) {
          this.debugDraw.toggle();
        },
        this
      )
      .on(
        'keyup-R',
        function (this: Phaser.Scene) {
          this.scene.restart();
        },
        this
      )
      .on(
        'keyup-U',
        function (this: Phaser.Scene) {
          this.scene.remove();
        },
        this
      )
      .on(
        'keyup-C',
        function (this: Phaser.Scene) {
          this.cameras.main.setScroll(0, 0).setZoom(1);
        },
        this
      )
      .on(
        'keyup-I',
        function (this: Phaser.Scene) {
          this.debugDraw.showInput = !this.debugDraw.showInput;
        },
        this
      )
      .on(
        'keyup-P',
        function (this: Phaser.Scene) {
          this.debugDraw.showPointers = !this.debugDraw.showPointers;
        },
        this
      )
      .on(
        'keyup-O',
        function (this: Phaser.Scene) {
          this.debugDraw.showRotation = !this.debugDraw.showRotation;
        },
        this
      )
      .once('keyup-S', snapshot, this);

    const cursors = this.input.keyboard.createCursorKeys();

    controls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      speed: 0.2,
    });

    console.log('this.debugDraw (Phaser 4)', this.debugDraw);
  },

  update: function (this: Phaser.Scene, _time: number, delta: number) {
    const pointer = this.input.activePointer;

    maskImage.setPosition(pointer.worldX, pointer.worldY);
    nebula.tilePositionX -= 0.5;
    starfield.tilePositionX -= 0.25;
    planet.angle += 0.1;

    IncX(sprites, -1);
    WrapInRectangle(sprites, bounds, 50);

    controls.update(delta);
  },
};

declare global {
  interface Window {
    game: Phaser.Game;
  }
}

window.game = new Phaser.Game({
  scene: scene,
  plugins: {
    scene: [{ key: 'DebugDrawPlugin', plugin: DebugDrawPlugin, mapping: 'debugDraw' }],
  },
  loader: { path: '../assets/' },
  audio: { noAudio: true },
});
