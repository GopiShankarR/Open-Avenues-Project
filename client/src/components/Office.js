import React, { useContext, useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';

import CanvasContext    from './CanvasContext';
import ImagesBuffer     from './ImagesBuffer';
import Grid             from './Grid';
import Map              from './Map';
import MyCharacter      from './MyCharacter';
import OtherCharacters  from './OtherCharacters';
import FirebaseListener from './FirebaseListener';
import VideoChat        from './VideoChat';

import {
  MAP_DIMENSIONS,
  TILE_SIZE,
  MAP_TILE_IMAGES
} from './mapConstants';
import { MY_CHARACTER_INIT_CONFIG } from './characterConstants';

function Office({
  mapImagesLoaded,
  gameStatus,
  webrtcSocket,
  mySocketId,
  allCharactersData
}) {
  const width   = MAP_DIMENSIONS.COLS * TILE_SIZE;
  const height  = MAP_DIMENSIONS.ROWS * TILE_SIZE;
  const context = useContext(CanvasContext);

  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        console.log("📹 got local stream");
        setLocalStream(stream);
      })
      .catch(err => console.error("Error getting local media:", err));
  }, []);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      if (context) {
        context.canvas.clearRect(
          0, 0,
          context.canvas.canvas.width,
          context.canvas.canvas.height
        );
      }
    };
  }, [context]);

  const myUserId   = MY_CHARACTER_INIT_CONFIG.id;
  const otherUsers = Object.values(allCharactersData)
    .filter(u => u.id !== myUserId && !!u.socketId);

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

      <div style={{
        marginTop: '1rem',
        display:       'flex',
        flexWrap:      'wrap',
        gap:           '1rem',
        justifyContent:'center'
      }}>
        {localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width:200, height:150, backgroundColor:'black' }}
          />
        )}

        {localStream && otherUsers.map(u => (
          <VideoChat
            key={u.socketId}
            webrtcSocket={webrtcSocket}
            localStream={localStream}
            mySocketId={mySocketId}
            peerSocketId={u.socketId}
          />
        ))}
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  mapImagesLoaded:    state.mapImagesLoaded,
  gameStatus:         state.gameStatus,
  allCharactersData:  state.allCharacters.users,
  mySocketId:         state.allCharacters.users[MY_CHARACTER_INIT_CONFIG.id]?.socketId
});

export default connect(mapStateToProps)(Office);
