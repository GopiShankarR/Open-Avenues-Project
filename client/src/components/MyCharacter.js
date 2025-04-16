import React, { useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import CanvasContext from './CanvasContext';
import { CHARACTER_IMAGE_SIZE, CHARACTER_CLASSES_MAP, MY_CHARACTER_INIT_CONFIG } from './characterConstants';
import { TILE_SIZE } from './mapConstants';
import { loadCharacter } from './slices/statusSlice';
import { update as updateAllCharactersData } from './slices/allCharactersSlice';
import { ref, set } from 'firebase/database';
import { firebaseDatabase } from '../firebase/firebase';

function MyCharacter({ myCharactersData, loadCharacter, updateAllCharactersData, webrtcSocket }) {
  const context = useContext(CanvasContext);

  useEffect(() => {
    const myInitData = {
      ...MY_CHARACTER_INIT_CONFIG,
      socketId: webrtcSocket.id,
    };
    const myId = myInitData.id;
    
    updateAllCharactersData({ [myId]: myInitData });
    
    set(ref(firebaseDatabase, `users/${myId}`), myInitData);
  }, [webrtcSocket, updateAllCharactersData]);

  useEffect(() => {
    if (!context || !myCharactersData) return;
    
    const characterImg = document.querySelector(`#character-sprite-img-${myCharactersData.characterClass}`);
    if (!characterImg) return;
    
    const { sx, sy } = CHARACTER_CLASSES_MAP[myCharactersData.characterClass].icon;
    
    context.canvas.drawImage(
      characterImg,
      sx,
      sy,
      CHARACTER_IMAGE_SIZE - 5,
      CHARACTER_IMAGE_SIZE - 5,
      myCharactersData.position.x * TILE_SIZE,
      myCharactersData.position.y * TILE_SIZE,
      CHARACTER_IMAGE_SIZE,
      CHARACTER_IMAGE_SIZE
    );
    
    loadCharacter(true);
  }, [context, myCharactersData?.position.x, myCharactersData?.position.y, loadCharacter]);

  return null;
}

const mapStateToProps = (state) => ({
  myCharactersData: state.allCharacters.users[MY_CHARACTER_INIT_CONFIG.id],
});

const mapDispatchToProps = { loadCharacter, updateAllCharactersData };

export default connect(mapStateToProps, mapDispatchToProps)(MyCharacter);
