import React, { useEffect, useRef, useState, useCallback } from 'react';

function MyVideo({ onStreamReady }) {
  const [myStream, setMyStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setMyStream(stream);

        if (onStreamReady) {
          onStreamReady(stream);
        }
      })
      .catch(err => {
        console.error('Error accessing media devices:', err);
      });
  }, [onStreamReady]);

  const setVideoNode = useCallback((node) => {
    if (node && myStream) {
      node.srcObject = myStream;
    }
  }, [myStream]);

  return (
    <>
      {myStream && (
        <video
          width="200px"
          height="150px"
          ref={setVideoNode}
          autoPlay
          playsInline
          muted
          style={{ backgroundColor: 'black' }}
        />
      )}
    </>
  );
}

export default MyVideo;
