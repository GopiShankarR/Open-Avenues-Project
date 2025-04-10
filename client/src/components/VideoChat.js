import React, { useEffect, useRef, useState } from 'react';

function VideoChat({ webrtcSocket }) {
  const [myStream, setMyStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setMyStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Error accessing camera:', err);
      });

    webrtcSocket.on('offer', (offer) => {
      console.log('Received offer:', offer);
    });

    return () => {
      webrtcSocket.off('offer');
      if (myStream) {
        myStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webrtcSocket, myStream]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '150px', height: '100px', backgroundColor: 'black' }}
      />

    </div>
  );
}

export default VideoChat;
