"use client";

export default function DHLHeader() {
  return (
    <header className="bg-[#FFCC00] border-b border-gray-300 flex-shrink-0">
      <div className="px-3 py-1.5 flex items-center justify-between" style={{ fontFamily: "Arial, sans-serif" }}>
        {/* Left: Logo + Title + Role info */}
        <div className="flex items-center gap-3">
          {/* DHL red pill logo */}
          <div
            className="text-white font-black italic px-3 py-1 rounded-full text-base leading-tight"
            style={{ background: "#D40511", fontSize: "18px", letterSpacing: "0.5px" }}
          >
            DHL
          </div>

          {/* CRA 10 + subtitle */}
          <div>
            <div className="font-bold text-black" style={{ fontSize: "16px", lineHeight: "1.2" }}>
              CRA 10
            </div>
            <div className="text-gray-600" style={{ fontSize: "11px", lineHeight: "1.3" }}>
              Role: PRICE OVERRIDE &nbsp;|&nbsp; UNITED STATES OF AMERICA &nbsp;|&nbsp; Location: Oak Lawn 1 - 409 - Agent
            </div>
          </div>
        </div>

        {/* Right: Installation + email */}
        <div className="hidden sm:flex flex-col items-end gap-0.5">
          <div className="text-gray-600 flex items-center gap-1.5" style={{ fontSize: "11px" }}>
            <span>Installation: 1 (GMT-04:00)</span>
            <span className="text-gray-500">🔔</span>
          </div>
          <div className="text-gray-700" style={{ fontSize: "11px" }}>
            retail.cubichomesolutions.oaklawn1@dhl.com
          </div>
        </div>
      </div>
    </header>
  );
}
