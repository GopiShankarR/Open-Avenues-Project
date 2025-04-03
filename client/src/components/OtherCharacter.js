import React, { useContext, useEffect } from 'react';
import CanvasContext from './CanvasContext';
import { CHARACTER_CLASSES_MAP, CHARACTER_IMAGE_SIZE } from './characterConstants';
import { TILE_SIZE } from './mapConstants';

const OtherCharacter = ({ character }) => {
  const context = useContext(CanvasContext);

  useEffect(() => {
    if (!context || !character) return;

    const characterImg = document.querySelector(`#character-sprite-img-${character.characterClass}`);
    if (!characterImg) return;

    const { sx, sy } = CHARACTER_CLASSES_MAP[character.characterClass].icon;
    const { x, y } = character.position;

    context.canvas.drawImage(
      characterImg,
      sx, sy,
      CHARACTER_IMAGE_SIZE - 5, CHARACTER_IMAGE_SIZE - 5,
      x * TILE_SIZE, y * TILE_SIZE,
      CHARACTER_IMAGE_SIZE, CHARACTER_IMAGE_SIZE
    );
  }, [context, character]);

  return null;
};

export default OtherCharacter;
