import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  VideoCameraIcon,
  MicrophoneIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
// import { MicrophoneOffIcon, VideoOffIcon } from "@heroicons/react/24/solid";

export default function VideoCall() {
  const { id } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callStarted, setCallStarted] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [error, setError] = useState("");
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Get appointment details
        const res = await axios.get(
          `https://counseling-app-backend.onrender.com/api/appointments/${id}`
        );

        // Initialize WebRTC
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;

        // Initialize Socket.io connection
        const socket = io(process.env.REACT_APP_SOCKET_SERVER);
        setSocket(socket);

        // Create peer connection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        setPeerConnection(pc);

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              appointmentId: id,
              candidate: event.candidate,
            });
          }
        };

        // Socket event listeners
        socket.on("offer", async (offer) => {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", {
            appointmentId: id,
            answer: answer,
          });
        });

        socket.on("answer", async (answer) => {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice-candidate", async (candidate) => {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // Start call
        socket.emit("join-call", { appointmentId: id });
        setCallStarted(true);
      } catch (err) {
        console.error(err);
        setError("Failed to initialize call");
      }
    };

    initializeCall();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [id]);

  const toggleMic = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setMicMuted(!micMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setVideoOff(!videoOff);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (socket) {
      socket.emit("leave-call", { appointmentId: id });
      socket.disconnect();
    }
    window.location.href = `/appointments`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex-grow relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-4 right-4 w-1/4 h-1/4">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>

      <div className="bg-gray-800 p-4 flex justify-center space-x-6">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${
            micMuted ? "bg-red-500" : "bg-gray-700"
          } text-white`}
          title={micMuted ? "Unmute" : "Mute"}
        >
          {micMuted ? (
            <MicrophoneOffIcon className="h-6 w-6" />
          ) : (
            <MicrophoneIcon className="h-6 w-6" />
          )}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            videoOff ? "bg-red-500" : "bg-gray-700"
          } text-white`}
          title={videoOff ? "Turn on video" : "Turn off video"}
        >
          {videoOff ? (
            <VideoOffIcon className="h-6 w-6" />
          ) : (
            <VideoCameraIcon className="h-6 w-6" />
          )}
        </button>
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 text-white"
          title="End call"
        >
          <PhoneIcon className="h-6 w-6 transform rotate-135" />
        </button>
      </div>
    </div>
  );
}
