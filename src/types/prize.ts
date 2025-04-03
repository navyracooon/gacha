export type PrizeField = 'name' | 'weight' | 'limit';

export type Prize = {
  id: string;
  name: string;
  weight: number;
  limit?: number;
};

