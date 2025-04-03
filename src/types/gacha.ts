import { Operation } from "./operation";
import { Prize } from "./prize";
import { Target } from "./target";

export type GachaListFields = 'targets' | 'prizes' | 'operationHistory';

export type Gacha = {
  id: string;
  name: string;
  targets: Target[];
  prizes: Prize[];
  operationHistory: Operation[];
};
