import * as ex from 'excalibur';
import logoUrl from '../src/ex-logo.png';
export function addLogo(game: ex.Engine, x: number, y: number, height: number) {
  const image = new ex.ImageSource(logoUrl);
  const sprite = image.toSprite();
  sprite.scale = ex.vec(height / 256, height / 256);
  const element = new ex.ScreenElement({ x, y, z: 2 });
  element.graphics.use(sprite);
  game.add(element);
  return image;
}
