import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import Grid from './Grid';
import ImagesBuffer from './ImagesBuffer';
import Map from './Map';
import CanvasContext from './CanvasContext';
import MyCharacter from './MyCharacter';
import OtherCharacters from './OtherCharacters';
import FirebaseListener from './FirebaseListener';
import VideoChat from './VideoChat';

import { MAP_DIMENSIONS, TILE_SIZE, MAP_TILE_IMAGES } from './mapConstants';
import { MY_CHARACTER_INIT_CONFIG } from './characterConstants';

const Office = ({
  mapImagesLoaded,
  gameStatus,
  webrtcSocket,
  mySocketId,
  targetUserSocketId
}) => {
  const width = MAP_DIMENSIONS.COLS * TILE_SIZE;
  const height = MAP_DIMENSIONS.ROWS * TILE_SIZE;
  const context = useContext(CanvasContext);

  const params = new URLSearchParams(window.location.search);
  const isInitiator = params.get('initiator') === 'true';

  useEffect(() => {
    return () => {
      context && context.canvas.clearRect(0, 0, context.canvas.width, context.canvas.height);
    };
  }, [context]);

  return (
    <>
      <FirebaseListener />
      <ImagesBuffer />

      {Object.keys(mapImagesLoaded).length === Object.keys(MAP_TILE_IMAGES).length && (
        <Grid width={width} height={height}>
          <Map />
        </Grid>
      )}

      {gameStatus.mapLoaded && <MyCharacter webrtcSocket={webrtcSocket} />}
      {gameStatus.mapLoaded && <OtherCharacters />}

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
        <VideoChat
          webrtcSocket={webrtcSocket}
          isInitiator={isInitiator}
          mySocketId={mySocketId}
          targetUserSocketId={isInitiator ? targetUserSocketId : null}
        />
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  const allUsers = state.allCharacters.users;
  const myUserId = MY_CHARACTER_INIT_CONFIG.id;

  const myUser = allUsers[myUserId];
  const mySocketId = myUser ? myUser.socketId : null;

  const otherUser = Object.values(allUsers).find((u) => u.id !== myUserId);
  const targetUserSocketId = otherUser ? otherUser.socketId : null;

  return {
    mapImagesLoaded: state.mapImagesLoaded,
    gameStatus: state.gameStatus,
    mySocketId,
    targetUserSocketId
  };
};

export default connect(mapStateToProps)(Office);
