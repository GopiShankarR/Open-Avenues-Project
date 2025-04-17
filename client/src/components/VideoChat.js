import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';

function VideoChat({ webrtcSocket, isInitiator, mySocketId, targetUserSocketId }) {
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error('Error accessing media devices:', err));
  }, []);

  useEffect(() => {
    if (!localStream) return;
    let peer;

    if (isInitiator && mySocketId && targetUserSocketId) {
      peer = new Peer({ initiator: true, trickle: false, stream: localStream });
      peer.on('signal', offerSignal => {
        console.log('⚡ Sending OFFER:', offerSignal);
        webrtcSocket.emit('offer', {
          callFromUserSocketId: mySocketId,
          callToUserSocketId: targetUserSocketId,
          offerSignal
        });
      });

    } else if (!isInitiator) {
      peer = new Peer({ initiator: false, trickle: false, stream: localStream });
      webrtcSocket.once('offer', payload => {
        console.log('⚡ Received OFFER:', payload.offerSignal);
        peer.on('signal', answerSignal => {
          console.log('⚡ Sending ANSWER:', answerSignal);
          webrtcSocket.emit('answer', {
            callFromUserSocketId: mySocketId,
            callToUserSocketId: payload.callFromUserSocketId,
            answerSignal
          });
        });
        peer.signal(payload.offerSignal);
      });
    }

    if (peer) {
      peer.on('stream', remoteStream => {
        console.log('🏞  Remote stream arrived');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      peerRef.current = peer;
    }

    return () => {
      if (peerRef.current) peerRef.current.destroy();
      webrtcSocket.off('offer');
    };
  }, [
    isInitiator,
    localStream,
    mySocketId,
    targetUserSocketId,
    webrtcSocket
  ]);

  useEffect(() => {
    if (!isInitiator) return;
    webrtcSocket.on('answer', payload => {
      console.log('⚡ Received ANSWER:', payload.answerSignal);
      if (peerRef.current) {
        peerRef.current.signal(payload.answerSignal);
      }
    });
    return () => {
      webrtcSocket.off('answer');
    };
  }, [isInitiator, webrtcSocket]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1rem'
      }}
    >
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ width: 200, height: 150, backgroundColor: 'black' }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: 200, height: 150, backgroundColor: 'black' }}
      />
    </div>
  );
}

export default VideoChat;
