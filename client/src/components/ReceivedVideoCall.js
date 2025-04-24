import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';

export default function ReceivedVideoCall({
  webrtcSocket,
  localStream,
  mySocketId
}) {
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef        = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (!localStream || !mySocketId) return;

    const handleOffer = (payload) => {
      if (payload.callToUserSocketId !== mySocketId) return;

      const peer = new Peer({
        initiator: false,
        trickle:   false,
        stream:    localStream
      });
      peerRef.current = peer;

      peer.on('signal', answerSignal => {
        webrtcSocket.emit('answer', {
          callFromUserSocketId: mySocketId,
          callToUserSocketId:   payload.callFromUserSocketId,
          answerSignal
        });
      });

      peer.on('stream', stream => setRemoteStream(stream));

      peer.signal(payload.offerSignal);
    };

    webrtcSocket.on('offer', handleOffer);

    return () => {
      webrtcSocket.off('offer', handleOffer);
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [webrtcSocket, localStream, mySocketId]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ width: 200, height: 150, backgroundColor: 'black' }}
      />
      {remoteStream && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: 200, height: 150, backgroundColor: 'black' }}
        />
      )}
    </div>
  );
}
