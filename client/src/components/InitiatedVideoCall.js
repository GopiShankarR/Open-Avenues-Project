import React, { useEffect, useRef } from 'react';
import Peer from 'simple-peer';

function InitiatedVideoCall({
  webrtcSocket,
  localStream,
  mySocketId,
  targetUserSocketId
}) {
  const peerRef = useRef();

  useEffect(() => {
    if (!localStream || !mySocketId || !targetUserSocketId) return;

    peerRef.current = new Peer({
      initiator: true,
      trickle: false,
      stream: localStream
    });

    peerRef.current.on('signal', (offerSignal) => {
      console.log(
        'InitiatedVideoCall – sending offer:',
        { callFromUserSocketId: mySocketId, callToUserSocketId: targetUserSocketId }
      );
      webrtcSocket.emit('offer', {
        callFromUserSocketId: mySocketId,
        callToUserSocketId: targetUserSocketId,
        offerSignal
      });
    });

    return () => {
      peerRef.current.destroy();
    };
  }, [localStream, mySocketId, targetUserSocketId, webrtcSocket]);

  return null;
}

export default InitiatedVideoCall;
