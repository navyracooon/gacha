import { Prize } from "./prize";
import { Operation } from "./operation";

export type Gacha = {
  id: string;
  name: string;
  prizes: Prize[];
  operationHistory: Operation[];
};
