export type PrizeField = 'name' | 'weight' | 'limit' | 'categoryId';

export type Prize = {
  id: string;
  name: string;
  weight: number;
  limit?: number;
  categoryId: string;
};
