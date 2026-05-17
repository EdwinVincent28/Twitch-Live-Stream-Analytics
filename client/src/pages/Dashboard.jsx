import StatsRow from "../components/dashboard/StatsRow";
import HypeMeter from "../components/dashboard/HypeMeter";
import EmoteLeaderboard from "../components/dashboard/EmoteLeaderboard";
import LiveFeed from "../components/dashboard/LiveFeed";
import SpamDetector from "../components/dashboard/SpamDetector";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4 p-5 h-full">
      {/* Stats row */}
      <StatsRow />

      {/* Hype meter - full width */}
      <HypeMeter />

      {/* Bottom grid: feed | emotes + spam */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Live feed - takes 2 cols */}
        <div className="lg:col-span-2 min-h-0">
          <LiveFeed />
        </div>

        {/* Right column: emote + spam */}
        <div className="flex flex-col gap-4 min-h-0">
          <EmoteLeaderboard />
          <SpamDetector />
        </div>
      </div>
    </div>
  );
}