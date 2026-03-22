import type { RefObject } from "react";
import { Mic, MicOff, Video, VideoOff, Paperclip, Phone } from "lucide-react";

type CallPageProps = {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoReady: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onHangup: () => void;
  localName: string;
  remoteName: string;
};

const VideoCall = ({
  localVideoRef,
  remoteVideoRef,
  remoteVideoReady,
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onHangup,
  localName,
  remoteName,
}: CallPageProps) => {
  // Mock transcript data
  const transcript = [
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

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-appBg text-white font-inter overflow-hidden antialiased">
      {/* Main Video Area */}
      <div className="flex flex-col flex-1 relative h-full">
        {/* Top Header */}
        <div className="flex justify-between items-center px-6 py-5 w-full z-10">
          <h1 className="font-bold tracking-wide text-gray-100 text-xl">
            Consulting consultations
          </h1>
          <div className="text-sm text-gray-300 font-medium tracking-wide bg-panelBg px-3 py-1.5 rounded-lg">
            00:34:12
          </div>
        </div>

        {/* Video Grid (Strictly Two People, 16:9 Aspect Ratio) */}
        {/* Using standard flex and max-w to ensure 16:9 doesn't stretch weirdly on ultra-wide screens */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 px-6 pb-2 overflow-hidden">
          {/* Person 1 (Michael) */}
          <div className="relative w-full md:w-1/2 aspect-video rounded-2xl bg-linear-to-br from-panelBg to-[#202224] border border-activeGreen shadow-[0_0_20px_rgba(53,200,152,0.1)] flex items-center justify-center overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover ${isVideoOff ? "hidden" : "block"}`}
            />

            {/* Avatar representation */}
            <div
              className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#c9839f] items-center justify-center shadow-lg relative overflow-hidden border-2 border-appBg ${isVideoOff ? "flex" : "hidden"}`}
            >
              <div className="w-12 h-12 bg-[#3a202a] rounded-full absolute -bottom-2"></div>
              <div className="w-8 h-8 bg-[#f4b69c] rounded-full absolute top-5"></div>
            </div>

            {/* Name & Audio visualizer */}
            <div className="absolute bottom-4 left-4 bg-appBg/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
              {localName}
              <div className="flex gap-0.5 items-center h-3 ml-1">
                <div className="w-0.5 h-1.5 bg-activeGreen rounded-full animate-pulse"></div>
                <div className="w-0.5 h-2.5 bg-activeGreen rounded-full animate-pulse delay-75"></div>
                <div className="w-0.5 h-3.5 bg-activeGreen rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>

          {/* Person 2 (Susan) */}
          <div className="relative w-full md:w-1/2 aspect-video rounded-2xl bg-[#242729] border border-[#383b3d] flex items-center justify-center overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
              alt={remoteName}
              className={`absolute inset-0 w-full h-full object-cover ${remoteVideoReady ? "hidden" : "block"}`}
            />

            <div className="absolute bottom-4 left-4 bg-appBg/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium">
              {remoteName}
            </div>

            <div className="absolute bottom-4 right-4 bg-appBg/80 backdrop-blur-md p-2 rounded-full">
              <MicOff size={14} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
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

          {/* End Call Icon Button */}
          <button
            onClick={onHangup}
            className="w-14 h-14 rounded-full bg-dangerRed hover:bg-[#d43d4a] text-white flex items-center justify-center transition-colors shadow-lg"
          >
            <Phone fill="white" className="rotate-135" size={20} />
          </button>
        </div>
      </div>

      {/* Right Sidebar - Transcript */}
      <div className="w-full md:w-[360px] h-[40vh] md:h-full bg-panelBg border-t md:border-t-0 md:border-l border-[#383b3d] flex flex-col z-20">
        {/* Sidebar Header */}
        <div className="px-5 py-4 border-b border-[#383b3d] flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-100">
            Meeting Transcript
          </h2>
        </div>

        {/* Chat / Transcript Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {transcript.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
            >
              <span className="text-xs text-gray-400 mb-1.5 font-medium px-1">
                {msg.sender}
              </span>
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

        {/* Attach Action Area (Icon Only) */}
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
