import React, { useEffect, useRef, useState } from 'react';
import InitiatedVideoCall from './InitiatedVideoCall';

function VideoChat({
  webrtcSocket,
  isInitiator,
  mySocketId,
  targetUserSocketId
}) {
  const [localStream, setLocalStream] = useState(null);
  const videoRef = useRef(null);

  // Capture local video on mount
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing camera/mic:', err);
      });
  }, []);

  // Listen for incoming offers if this client is NOT the initiator
  useEffect(() => {
    if (!isInitiator) {
      webrtcSocket.on('offer', (payload) => {
        console.log('Non‑initiator received offer:', payload);
      });
      return () => {
        webrtcSocket.off('offer');
      };
    }
  }, [isInitiator, webrtcSocket]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      <h2>Video Chat</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: 150, height: 100, backgroundColor: 'black' }}
      />

      {isInitiator &&
        localStream &&
        mySocketId &&
        targetUserSocketId && (
          <InitiatedVideoCall
            webrtcSocket={webrtcSocket}
            localStream={localStream}
            mySocketId={mySocketId}
            targetUserSocketId={targetUserSocketId}
          />
        )}
    </div>
  );
}

export default VideoChat;
