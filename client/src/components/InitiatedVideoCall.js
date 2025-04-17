import { useEffect, useRef } from 'react';
import Peer from 'simple-peer';

export default function InitiatedVideoCall({
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
        'InitiatedVideoCall - sending offer:',
        { callFromUserSocketId: mySocketId, callToUserSocketId: targetUserSocketId }
      );
      webrtcSocket.emit('offer', {
        callFromUserSocketId: mySocketId,
        callToUserSocketId: targetUserSocketId,
        offerSignal
      });
    });

    webrtcSocket.on('answer', (payload) => {
      if (payload.callToUserSocketId === mySocketId) {
        console.log('Client 1 got answer:', payload.answerSignal);
        peerRef.current.signal(payload.answerSignal);
      }
    });

    return () => {
      webrtcSocket.off('answer');
      peerRef.current.destroy();
    };
  }, [localStream, mySocketId, targetUserSocketId, webrtcSocket]);

  return null;
}
