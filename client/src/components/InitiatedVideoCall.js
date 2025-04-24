import React, { useEffect, useRef, useCallback, useState } from 'react';
import Peer from 'simple-peer';

export default function InitiatedVideoCall({
  webrtcSocket,
  localStream, 
  mySocketId,
  targetUserSocketId
}) {
  const peerRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const createPeer = useCallback(
    (targetId, callerId, stream, socket) => {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream
      });
      peer.on('signal', offerSignal => {
        socket.emit('offer', {
          callFromUserSocketId: callerId,
          callToUserSocketId: targetId,
          offerSignal
        });
      });
      return peer;
    },
    []
  );

  useEffect(() => {
    if (!localStream || !mySocketId || !targetUserSocketId) return;

    peerRef.current = createPeer(
      targetUserSocketId,
      mySocketId,
      localStream,
      webrtcSocket
    );

    const handleAnswer = payload => {
      if (
        payload.callToUserSocketId === mySocketId &&
        peerRef.current
      ) {
        console.log('Received answer signal:', payload.answerSignal);
        peerRef.current.signal(payload.answerSignal);
      }
    };
    webrtcSocket.on('answer', handleAnswer);

    const handleStream = stream => {
      console.log('Received remote stream from peer');
      setRemoteStream(stream);
    };
    peerRef.current.on('stream', handleStream);

    return () => {
      webrtcSocket.off('answer', handleAnswer);

      if (peerRef.current) {
        peerRef.current.removeListener('stream', handleStream);
        peerRef.current.destroy();
        peerRef.current = null;
      }

      setRemoteStream(null);
    };
  }, [
    createPeer,
    localStream,
    mySocketId,
    targetUserSocketId,
    webrtcSocket
  ]);

  return remoteStream ? (
    <video
      autoPlay
      playsInline
      ref={vid => {
        if (vid) vid.srcObject = remoteStream;
      }}
      style={{ width: 200, height: 150, backgroundColor: 'black' }}
    />
  ) : null;
}
