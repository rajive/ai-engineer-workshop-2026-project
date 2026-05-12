import { Flame, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type GamificationStats = {
  totalPoints: number;
  currentLevel: number;
  levelName: string;
  xpToNextLevel: number | null;
  currentLevelXp: number;
  nextLevelXp: number | null;
  currentStreak: number;
  longestStreak: number;
};

export function GamificationCard({ stats }: { stats: GamificationStats }) {
  const isMaxLevel = stats.nextLevelXp === null;
  const bandSize = isMaxLevel
    ? 1
    : (stats.nextLevelXp as number) - stats.currentLevelXp;
  const inBand = stats.totalPoints - stats.currentLevelXp;
  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.max(0, Math.round((inBand / bandSize) * 100)));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle className="text-lg">
            <span className="text-muted-foreground">Level {stats.currentLevel} — </span>
            <span className="text-foreground">{stats.levelName}</span>
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Flame className="size-4 text-orange-500" />
              <span className="font-medium">
                {stats.currentStreak}-day streak
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Trophy className="size-4" />
              <span>Best: {stats.longestStreak} days</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            {isMaxLevel
              ? `${stats.totalPoints} XP`
              : `${stats.totalPoints} / ${stats.nextLevelXp} XP`}
          </span>
          <span className="text-muted-foreground">
            {isMaxLevel
              ? "Max level reached"
              : `${stats.xpToNextLevel} XP to next level`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
