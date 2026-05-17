import {
  HOST_RANKS,
  PARTICIPATION_RANKS,
} from "@/lib/gamification/ranks";
import { uiCopy } from "@/lib/ui/copy";

export function RankLadder() {
  return (
    <details className="rank-ladder advanced-panel">
      <summary>{uiCopy.ranks.ladderTitle}</summary>
      <div className="advanced-panel-body">
        <h3 className="font-label text-base m-0 mb-2">
          {uiCopy.ranks.ladderJoined}
        </h3>
        <ol className="rank-ladder-list list-none m-0 mb-6 p-0">
          {PARTICIPATION_RANKS.map((rank) => (
            <li key={rank.id} className="rank-ladder-item">
              <span className="rank-ladder-title">{rank.title}</span>
              <span className="rank-ladder-req">
                {uiCopy.ranks.ladderReqJoined(rank.minJoined)}
              </span>
              <span className="rank-ladder-tag">{rank.tagline}</span>
            </li>
          ))}
        </ol>
        <h3 className="font-label text-base m-0 mb-2">
          {uiCopy.ranks.ladderHosted}
        </h3>
        <ol className="rank-ladder-list list-none m-0 p-0">
          {HOST_RANKS.map((rank) => (
            <li key={rank.id} className="rank-ladder-item">
              <span className="rank-ladder-title">{rank.title}</span>
              <span className="rank-ladder-req">
                {uiCopy.ranks.ladderReqHosted(rank.minHosted)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}
