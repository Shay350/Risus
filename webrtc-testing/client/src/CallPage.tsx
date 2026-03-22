import type { RefObject } from "react";
import { Mic, MicOff, Video, VideoOff, Paperclip, Phone } from "lucide-react";
import AvatarFallback from "./components/AvatarFallback";

type TranscriptMessage = {
  id: number;
  sender: string;
  text: string;
  isSelf: boolean;
};

type CallPageProps = {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  isMuted: boolean;
  isVideoOff: boolean;
  remoteMicOn: boolean;
  remoteVideoOn: boolean;
  localSpeaking: boolean;
  remoteSpeaking: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onHangup: () => void;
  localName: string;
  remoteName: string;
  callDurationLabel: string;
};

const transcript: TranscriptMessage[] = [
  {
    id: 1,
    sender: "Ayesha Alshareef",
    text: "It's been a long time since I look for help.",
    isSelf: false,
  },
  {
    id: 2,
    sender: "Ayesha Alshareef",
    text: "I want to find a new product that can sustain my business",
    isSelf: false,
  },
  {
    id: 3,
    sender: "Micheal Smyth",
    text: "Absolutely, we can definitely look into some options for you.",
    isSelf: true,
  },
  {
    id: 4,
    sender: "Micheal Smyth",
    text: "Can you share a bit more about your current business and what you're looking for in a new product?",
    isSelf: true,
  },
  {
    id: 5,
    sender: "Ayesha Alshareef",
    text: "Sure! I run a small online boutique that sells handmade jewelry. I'm looking for a product that can help me manage my inventory and sales more efficiently.",
    isSelf: false,
  },
];

function VoiceIndicator({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }
  return (
    <div className="flex gap-0.5 items-center h-3 ml-1">
      <div className="w-0.5 h-1.5 bg-activeGreen rounded-full animate-pulse"></div>
      <div className="w-0.5 h-2.5 bg-activeGreen rounded-full animate-pulse delay-75"></div>
      <div className="w-0.5 h-3.5 bg-activeGreen rounded-full animate-pulse delay-150"></div>
    </div>
  );
}

const VideoCall = ({
  localVideoRef,
  remoteVideoRef,
  isMuted,
  isVideoOff,
  remoteMicOn,
  remoteVideoOn,
  localSpeaking,
  remoteSpeaking,
  onToggleMute,
  onToggleVideo,
  onHangup,
  localName,
  remoteName,
  callDurationLabel,
}: CallPageProps) => {
  const localMicOn = !isMuted;
  const localVideoOn = !isVideoOff;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-appBg text-white font-inter overflow-hidden antialiased">
      <div className="flex flex-col flex-1 relative h-full">
        <div className="flex justify-between items-center px-6 py-5 w-full z-10">
          <h1 className="font-bold tracking-wide text-gray-100 text-xl">Consulting consultations</h1>
          <div className="text-sm text-gray-300 font-medium tracking-wide bg-panelBg px-3 py-1.5 rounded-lg">
            {callDurationLabel}
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 px-6 pb-2 overflow-hidden">
          <div
            className={`relative w-full md:w-1/2 aspect-video rounded-2xl bg-linear-to-br from-panelBg to-[#202224] border flex items-center justify-center overflow-hidden ${
              localSpeaking
                ? "border-activeGreen shadow-[0_0_20px_rgba(53,200,152,0.1)]"
                : "border-[#383b3d]"
            }`}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover ${localVideoOn ? "block" : "hidden"}`}
            />
            {!localVideoOn && <AvatarFallback name={localName} />}

            <div className="absolute bottom-4 left-4 bg-appBg/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
              {localName}
              <VoiceIndicator active={localSpeaking} />
            </div>

            {!localMicOn && (
              <div className="absolute bottom-4 right-4 bg-appBg/80 backdrop-blur-md p-2 rounded-full">
                <MicOff size={14} className="text-gray-400" />
              </div>
            )}
          </div>

          <div
            className={`relative w-full md:w-1/2 aspect-video rounded-2xl bg-[#242729] border flex items-center justify-center overflow-hidden ${
              remoteSpeaking
                ? "border-activeGreen shadow-[0_0_20px_rgba(53,200,152,0.1)]"
                : "border-[#383b3d]"
            }`}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-cover ${remoteVideoOn ? "block" : "hidden"}`}
            />
            {!remoteVideoOn && <AvatarFallback name={remoteName} />}

            <div className="absolute bottom-4 left-4 bg-appBg/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
              {remoteName}
              <VoiceIndicator active={remoteSpeaking} />
            </div>

            {!remoteMicOn && (
              <div className="absolute bottom-4 right-4 bg-appBg/80 backdrop-blur-md p-2 rounded-full">
                <MicOff size={14} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 py-5 z-10">
          <button
            onClick={onToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-panelBg hover:bg-[#383b3d] text-white" : "bg-white hover:bg-gray-200 text-black"}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={onToggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? "bg-panelBg hover:bg-[#383b3d] text-white" : "bg-white hover:bg-gray-200 text-black"}`}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <button
            onClick={onHangup}
            className="w-14 h-14 rounded-full bg-dangerRed hover:bg-[#d43d4a] text-white flex items-center justify-center transition-colors shadow-lg"
          >
            <Phone fill="white" className="rotate-135" size={20} />
          </button>
        </div>
      </div>

      <div className="w-full md:w-[360px] h-[40vh] md:h-full bg-panelBg border-t md:border-t-0 md:border-l border-[#383b3d] flex flex-col z-20">
        <div className="px-5 py-4 border-b border-[#383b3d] flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-100">Meeting Transcript</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {transcript.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}>
              <span className="text-xs text-gray-400 mb-1.5 font-medium px-1">{msg.sender}</span>
              <div
                className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.isSelf
                    ? "bg-activeGreen text-gray-900 rounded-tr-sm border border-[#383b3d]"
                    : "bg-appBg text-gray-200 rounded-tl-sm border border-[#383b3d]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#383b3d] flex justify-end">
          <button className="w-10 h-10 rounded-full bg-appBg hover:bg-[#383b3d] border border-[#484b4d] text-gray-400 flex items-center justify-center transition-colors">
            <Paperclip size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
