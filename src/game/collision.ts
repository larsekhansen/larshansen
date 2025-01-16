import { Sprite } from "pixi.js";

/* 

  This is an Typescript adapted version of rectangleCollision from the "bump" collision
  detection library for PixiJS, used to detect collisions between two sprites.

  The original library is available at: https://github.com/kittykatattack/bump

*/

interface SpriteWithCollisionProperties extends Sprite {
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

export function rectangleCollision(
  r1: SpriteWithCollisionProperties,
  r2: SpriteWithCollisionProperties,
  bounce = false,
  global = true
): string | undefined {
  //Add collision properties
  if (!r1._bumpPropertiesAdded) addCollisionProperties(r1);
  if (!r2._bumpPropertiesAdded) addCollisionProperties(r2);

  let collisionSide: string | undefined;
  let combinedHalfWidths: number | undefined;
  let combinedHalfHeights: number | undefined;
  let overlapX: number | undefined;
  let overlapY: number | undefined;
  let vx: number | undefined;
  let vy: number | undefined;

  //Calculate the distance vector
  if (global) {
    vx =
      r1.gx +
      Math.abs(r1.halfWidth) -
      r1.xAnchorOffset -
      (r2.gx + Math.abs(r2.halfWidth) - r2.xAnchorOffset);
    vy =
      r1.gy +
      Math.abs(r1.halfHeight) -
      r1.yAnchorOffset -
      (r2.gy + Math.abs(r2.halfHeight) - r2.yAnchorOffset);
  } else {
    vx =
      r1.x +
      Math.abs(r1.halfWidth) -
      r1.xAnchorOffset -
      (r2.x + Math.abs(r2.halfWidth) - r2.xAnchorOffset);
    vy =
      r1.y +
      Math.abs(r1.halfHeight) -
      r1.yAnchorOffset -
      (r2.y + Math.abs(r2.halfHeight) - r2.yAnchorOffset);
  }

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = Math.abs(r1.halfWidth) + Math.abs(r2.halfWidth);
  combinedHalfHeights = Math.abs(r1.halfHeight) + Math.abs(r2.halfHeight);

  //Check whether vx is less than the combined half widths
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occurring!
    //Check whether vy is less than the combined half heights
    if (Math.abs(vy) < combinedHalfHeights) {
      //A collision has occurred! This is good!
      //Find out the size of the overlap on both the X and Y axes
      overlapX = combinedHalfWidths - Math.abs(vx);
      overlapY = combinedHalfHeights - Math.abs(vy);

      //The collision has occurred on the axis with the
      //*smallest* amount of overlap. Let's figure out which
      //axis that is

      if (overlapX >= overlapY) {
        //The collision is happening on the X axis
        //But on which side? vy can tell us

        if (vy > 0) {
          collisionSide = "top";
          //Move the rectangle out of the collision
          r1.y = r1.y + overlapY;
        } else {
          collisionSide = "bottom";
          //Move the rectangle out of the collision
          r1.y = r1.y - overlapY;
        }

        //Bounce
        if (bounce) {
          //r1.vy *= -1; // LARS: I think this is wrong, so will try using vy not as method
          vy *= -1;

          /*Alternative
          //Find the bounce surface's vx and vy properties
          var s = {};
          s.vx = r2.x - r2.x + r2.width;
          s.vy = 0;

          //Bounce r1 off the surface
          //this.bounceOffSurface(r1, s);
          */
        }
      } else {
        //The collision is happening on the Y axis
        //But on which side? vx can tell us

        if (vx > 0) {
          collisionSide = "left";
          //Move the rectangle out of the collision
          r1.x = r1.x + overlapX;
        } else {
          collisionSide = "right";
          //Move the rectangle out of the collision
          r1.x = r1.x - overlapX;
        }

        //Bounce
        if (bounce) {
          //r1.vx *= -1; // LARS: I think this is wrong, so will try using vx not as method
          vx *= -1;

          /*Alternative
          //Find the bounce surface's vx and vy properties
          var s = {};
          s.vx = 0;
          s.vy = r2.y - r2.y + r2.height;

          //Bounce r1 off the surface
          this.bounceOffSurface(r1, s);
          */
        }
      }
    } else {
      //No collision
    }
  } else {
    //No collision
  }

  //Return the collision string. it will be either "top", "right",
  //"bottom", or "left" depending on which side of r1 is touching r2.
  return collisionSide;
}

function addCollisionProperties(sprite: SpriteWithCollisionProperties) {
  //Add properties to Pixi sprites

  //gx
  if (sprite.gx === undefined) {
    Object.defineProperty(sprite, "gx", {
      get() {
        return sprite.getGlobalPosition().x;
      },
      enumerable: true,
      configurable: true
    });
  }

  //gy
  if (sprite.gy === undefined) {
    Object.defineProperty(sprite, "gy", {
      get() {
        return sprite.getGlobalPosition().y;
      },
      enumerable: true,
      configurable: true
    });
  }

  //centerX
  if (sprite.centerX === undefined) {
    Object.defineProperty(sprite, "centerX", {
      get() {
        return sprite.x + sprite.width / 2;
      },
      enumerable: true,
      configurable: true
    });
  }

  //centerY
  if (sprite.centerY === undefined) {
    Object.defineProperty(sprite, "centerY", {
      get() {
        return sprite.y + sprite.height / 2;
      },
      enumerable: true,
      configurable: true
    });
  }

  //halfWidth
  if (sprite.halfWidth === undefined) {
    Object.defineProperty(sprite, "halfWidth", {
      get() {
        return sprite.width / 2;
      },
      enumerable: true,
      configurable: true
    });
  }

  //halfHeight
  if (sprite.halfHeight === undefined) {
    Object.defineProperty(sprite, "halfHeight", {
      get() {
        return sprite.height / 2;
      },
      enumerable: true,
      configurable: true
    });
  }

  //xAnchorOffset
  if (sprite.xAnchorOffset === undefined) {
    Object.defineProperty(sprite, "xAnchorOffset", {
      get() {
        if (sprite.anchor !== undefined) {
          return sprite.width * sprite.anchor.x;
        } else {
          return 0;
        }
      },
      enumerable: true,
      configurable: true
    });
  }

  //yAnchorOffset
  if (sprite.yAnchorOffset === undefined) {
    Object.defineProperty(sprite, "yAnchorOffset", {
      get() {
        if (sprite.anchor !== undefined) {
          return sprite.height * sprite.anchor.y;
        } else {
          return 0;
        }
      },
      enumerable: true,
      configurable: true
    });
  }

  // if (sprite.circular && sprite.radius === undefined) {
  //   Object.defineProperty(sprite, "radius", {
  //     get() {
  //       return sprite.width / 2;
  //     },
  //     enumerable: true,
  //     configurable: true
  //   });
  // }

  sprite._bumpPropertiesAdded = true;
}
