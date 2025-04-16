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

    // Create a Peer in initiator mode
    peerRef.current = new Peer({
      initiator: true,
      trickle: false,
      stream: localStream
    });

    // When the SDP offer is ready, send it to the server with caller/target IDs
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

    // Clean up when unmounting
    return () => {
      peerRef.current.destroy();
    };
  }, [localStream, mySocketId, targetUserSocketId, webrtcSocket]);

  return null;
}

export default InitiatedVideoCall;
