import { Sprite } from "pixi.js";

declare module "pixi.js" {
  export interface Sprite {
    _bumpPropertiesAdded: boolean;
    gx: number;
    gy: number;
    centerX: number;
    centerY: number;
    halfWidth: number;
    halfHeight: number;
    xAnchorOffset: number;
    yAnchorOffset: number;
  }
}
