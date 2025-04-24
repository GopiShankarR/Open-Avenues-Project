import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';

export default function VideoChat({
  webrtcSocket,
  localStream,
  mySocketId,
  peerSocketId
}) {
  const [remoteStream, setRemoteStream] = useState(null);
  const videoRef  = useRef();
  const peerRef   = useRef();

  useEffect(() => {
    if (remoteStream && videoRef.current) {
      console.log("🏞 attaching remote stream for", peerSocketId);
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, peerSocketId]);

  useEffect(() => {
    if (!localStream || !mySocketId || !peerSocketId) {
      console.warn("VideoChat missing params", { localStream, mySocketId, peerSocketId });
      return;
    }

    console.log("🤝 Setting up peer: me=", mySocketId, "to", peerSocketId);
    const initiator = mySocketId < peerSocketId;
    const peer = new Peer({ initiator, trickle: false, stream: localStream });
    peerRef.current = peer;

    peer.on('signal', signal => {
      const event = initiator ? 'offer' : 'answer';
      console.log(`📨 Emitting ${event} for`, peerSocketId, signal);
      webrtcSocket.emit(event, {
        callFromUserSocketId: mySocketId,
        callToUserSocketId:   peerSocketId,
        [`${event}Signal`]:   signal
      });
    });

    const oppositeEvent = initiator ? 'answer' : 'offer';
    const handleSignal = payload => {
      console.log(`📥 Received ${oppositeEvent} for`, peerSocketId, payload);
      if (
        payload.callToUserSocketId   === mySocketId &&
        payload.callFromUserSocketId === peerSocketId
      ) {
        const key = initiator ? 'answerSignal' : 'offerSignal';
        peer.signal(payload[key]);
      }
    };
    webrtcSocket.on(oppositeEvent, handleSignal);

    peer.on('stream', stream => {
      console.log("📺 Remote stream arrived for", peerSocketId);
      setRemoteStream(stream);
    });

    return () => {
      webrtcSocket.off('offer', handleSignal);
      webrtcSocket.off('answer', handleSignal);
      peer.destroy();
    };
  }, [webrtcSocket, localStream, mySocketId, peerSocketId]);

  if (!remoteStream) return null;
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{ width:200, height:150, backgroundColor:'black' }}
    />
  );
}
