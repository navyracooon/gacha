import { Gacha } from '../types/gacha';
import { Operation } from '../types/operation';

export class GachaUtils {
  constructor (readonly gacha: Gacha) {}

  private aggregateOperationHistory = (operationHistory: Operation[]) => {
    const aggregation: { [prizeId: string]: number } = {};

    this.gacha.prizes.forEach(prize => {
      aggregation[prize.id] = 0;
    });

    operationHistory.forEach(history => {
      for (const [prizeId, count] of Object.entries(history.results)) {
        if (prizeId in aggregation) {
          aggregation[prizeId] += count;
        }
      }
    });
    return aggregation;
  };

  // 全体の集計結果
  public getOverallAggregation = () => {
    const overallAggregation = this.aggregateOperationHistory(this.gacha.operationHistory);
    return overallAggregation;
  };

  // 対象者ごとの集計結果
  public getTargetAggregation = (targetId: string) => {
    const targetAggregation = this.aggregateOperationHistory(
      this.gacha.operationHistory.filter(history => history.target === targetId)
    );
    return targetAggregation;
  };

  // 景品の重みの合計（相対確率の分母）
  public getTotalPrizeWeight = () => {
    return this.gacha.prizes.reduce((sum, p) => sum + p.weight, 0);
  };
}
