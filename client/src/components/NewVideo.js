import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const StyledVideo = styled.video`
  height: 300px;
  width: 400px;
`;

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

let myVideoStream;

const NewVideo = () => {
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const { id: roomID } = useParams();

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:5000");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        myVideoStream = stream;
        userVideo.current.srcObject = stream;
        socketRef.current.emit("join room", roomID);
        socketRef.current.on("all users", (users) => {
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers((users) => [...users, peer]);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      });
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const videoPlayPause = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
    } else {
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  };

  const audioPlayPause = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
    } else {
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  };

  return (
    <div>
      <StyledVideo muted ref={userVideo} autoPlay playsInline />
      {peers.map((peer, index) => {
        return <Video key={index} peer={peer} />;
      })}
      <div>
        <div
          style={{ display: "inline-block", cursor: "pointer" }}
          onClick={audioPlayPause}
        >
          Audio
        </div>
        <div
          style={{
            display: "inline-block",
            marginLeft: "20px",
            cursor: "pointer",
          }}
          onClick={videoPlayPause}
        >
          Video
        </div>
      </div>
    </div>
  );
};

export default NewVideo;
