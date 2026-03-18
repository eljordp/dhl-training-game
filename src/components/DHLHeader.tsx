"use client";

interface DHLHeaderProps {
  scenarioNumber?: number;
  totalScenarios?: number;
  showProgress?: boolean;
}

export default function DHLHeader({ scenarioNumber, totalScenarios, showProgress }: DHLHeaderProps) {
  return (
    <header className="bg-dhl-yellow border-b-4 border-dhl-red flex-shrink-0">
      <div className="max-w-[1400px] mx-auto px-3 md:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {/* DHL Logo */}
          <div className="bg-dhl-red text-white font-black text-lg md:text-2xl px-2 md:px-3 py-0.5 md:py-1 rounded-sm tracking-wider">
            DHL
          </div>
          <div className="text-dhl-dark">
            <div className="font-bold text-xs md:text-sm">CRA Training</div>
            <div className="text-[10px] md:text-xs text-dhl-gray hidden sm:block">Simulator v1.0</div>
          </div>
        </div>

        {showProgress && scenarioNumber && totalScenarios && (
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-[10px] md:text-xs text-dhl-gray font-medium">
              {scenarioNumber}/{totalScenarios}
            </div>
            <div className="flex gap-0.5 md:gap-1">
              {Array.from({ length: totalScenarios }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 md:w-6 h-1.5 md:h-2 rounded-sm ${
                    i < scenarioNumber
                      ? "bg-dhl-red"
                      : i === scenarioNumber
                        ? "bg-dhl-yellow border border-dhl-red"
                        : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
