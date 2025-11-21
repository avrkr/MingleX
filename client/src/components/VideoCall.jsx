import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { useSocket } from '../context/SocketContext';

const VideoCall = ({ conversationId, isInitiator }) => {
    const [stream, setStream] = useState(null);
    const [peer, setPeer] = useState(null);
    const userVideo = useRef();
    const partnerVideo = useRef();
    const socket = useSocket();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            setStream(stream);
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

            if (isInitiator) {
                const p = new SimplePeer({ initiator: true, trickle: false, stream });

                p.on('signal', data => {
                    socket.emit('call:signal', { to: conversationId, signal: data, type: 'offer' });
                });

                p.on('stream', stream => {
                    if (partnerVideo.current) partnerVideo.current.srcObject = stream;
                });

                setPeer(p);
            }
        });
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('call:signal', data => {
            if (data.type === 'offer' && !isInitiator) {
                const p = new SimplePeer({ initiator: false, trickle: false, stream });

                p.on('signal', signal => {
                    socket.emit('call:signal', { to: conversationId, signal, type: 'answer' });
                });

                p.on('stream', stream => {
                    if (partnerVideo.current) partnerVideo.current.srcObject = stream;
                });

                p.signal(data.signal);
                setPeer(p);
            } else if (data.type === 'answer' && peer) {
                peer.signal(data.signal);
            }
        });
    }, [socket, peer, stream]);

    return (
        <div className="flex justify-center items-center h-full space-x-4 bg-black p-4">
            <div className="relative">
                <video playsInline muted ref={userVideo} autoPlay className="w-64 rounded-lg border-2 border-primary" />
                <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 rounded">You</p>
            </div>
            <div className="relative">
                <video playsInline ref={partnerVideo} autoPlay className="w-96 rounded-lg border-2 border-secondary" />
                <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 rounded">Partner</p>
            </div>
        </div>
    );
};

export default VideoCall;
