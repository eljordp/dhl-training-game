"use client";

interface DHLHeaderProps {
  scenarioNumber?: number;
  totalScenarios?: number;
  showProgress?: boolean;
}

export default function DHLHeader({ scenarioNumber, totalScenarios, showProgress }: DHLHeaderProps) {
  return (
    <header className="bg-dhl-yellow border-b-4 border-dhl-red">
      <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* DHL Logo */}
          <div className="bg-dhl-red text-white font-black text-2xl px-3 py-1 rounded-sm tracking-wider">
            DHL
          </div>
          <div className="text-dhl-dark">
            <div className="font-bold text-sm">Customer Receiving Application</div>
            <div className="text-xs text-dhl-gray">Training Simulator v1.0</div>
          </div>
        </div>

        {showProgress && scenarioNumber && totalScenarios && (
          <div className="flex items-center gap-4">
            <div className="text-xs text-dhl-gray font-medium">
              SCENARIO {scenarioNumber} OF {totalScenarios}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalScenarios }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-2 rounded-sm ${
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
