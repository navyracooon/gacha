import { Category } from './category';
import { Operation } from './operation';
import { Prize } from './prize';
import { Target } from './target';

export type GachaListFields = 'targets' | 'prizes' | 'categories' | 'operationHistory';

export type Gacha = {
  id: string;
  name: string;
  targets: Target[];
  prizes: Prize[];
  categories: Category[];
  operationHistory: Operation[];
};
