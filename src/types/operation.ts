export type Operation = {
  id: string;
  count: number;
  results: { [prizeId: string]: number };
  timestamp: number;
  target: string;
};

