export interface RankingItem { name: string; frequency: number; rank: number }
export interface DecadePoint { decade: number; count: number }
export interface NameDetail {
  name: string; series: DecadePoint[]; total: number; peakDecade: number;
  firstDecade: number; lastDecade: number; changePercent: number | null;
}
export interface CompareResult {
  decades: number[];
  names: { name: string; total: number; values: number[] }[];
}
export interface SavedName { id: number; name: string; rating: number; note: string | null; created_at: string }
