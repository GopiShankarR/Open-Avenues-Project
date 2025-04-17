// src/components/ReceivedVideoCall.js
import { useEffect, useRef } from 'react';
import Peer from 'simple-peer';

export default function ReceivedVideoCall({
  webrtcSocket,
  localStream,
  mySocketId
}) {
  const peerRef = useRef();

  useEffect(() => {
    webrtcSocket.on('offer', (payload) => {
      console.log('Client 2 got offer:', payload);

      peerRef.current = new Peer({
        initiator: false,
        trickle: false,
        stream: localStream
      });

      peerRef.current.on('signal', (answerSignal) => {
        console.log('Client 2 sending answer:', answerSignal);
        webrtcSocket.emit('answer', {
          callFromUserSocketId: mySocketId,
          callToUserSocketId: payload.callFromUserSocketId,
          answerSignal
        });
      });

      peerRef.current.signal(payload.offerSignal);
    });

    return () => {
      webrtcSocket.off('offer');
    };
  }, [webrtcSocket, localStream, mySocketId]);

  return null;
}
