"use client";

import { useEffect, useState, useRef } from "react";
import { NPCDialogue } from "@/types/game";

interface NPCChatProps {
  npcName: string;
  npcAvatar: string;
  dialogues: NPCDialogue[];
  difficulty: string;
  hints: Record<string, string>;
  showHints: boolean;
}

export default function NPCChat({ npcName, npcAvatar, dialogues, difficulty, hints, showHints }: NPCChatProps) {
  const [visibleDialogues, setVisibleDialogues] = useState<number>(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleDialogues < dialogues.length) {
      const delay = dialogues[visibleDialogues]?.delay || (visibleDialogues === 0 ? 500 : 1500);
      const timer = setTimeout(() => {
        setVisibleDialogues((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visibleDialogues, dialogues]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleDialogues]);

  const difficultyColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex flex-col h-full">
      {/* NPC Info Bar */}
      <div className="bg-dhl-dark text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{npcAvatar}</div>
          <div>
            <div className="font-bold text-sm">{npcName}</div>
            <div className="text-xs text-gray-400">Customer</div>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${difficultyColors[difficulty]}`}>
          {difficulty.toUpperCase()}
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
        {dialogues.slice(0, visibleDialogues).map((dialogue, idx) => (
          <div key={idx} className="chat-bubble">
            {dialogue.speaker === "system" ? (
              <div className="text-center text-xs text-gray-500 italic py-2 px-4 bg-gray-100 rounded">
                {dialogue.text}
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="text-xl flex-shrink-0 mt-1">{npcAvatar}</div>
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-[90%] shadow-sm">
                  <p className="text-sm text-gray-800 leading-relaxed">{dialogue.text}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {visibleDialogues < dialogues.length && (
          <div className="flex gap-2 items-center">
            <div className="text-xl">{npcAvatar}</div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Hints Panel */}
      {showHints && Object.keys(hints).length > 0 && (
        <div className="border-t border-dhl-border bg-yellow-50 px-4 py-3">
          <div className="text-xs font-bold text-yellow-800 mb-1">💡 HINTS</div>
          {Object.entries(hints).map(([key, hint]) => (
            <div key={key} className="text-xs text-yellow-700 py-0.5">
              • {hint}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
