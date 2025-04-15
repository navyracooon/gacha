import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { useGachaContext } from '../contexts/Gacha';
import { FormatUtils } from '../utils/format';
import { GachaUtils } from '../utils/gacha';

type Props = {
  aggregation: { [prizeId: string]: number };
  isZeroVisible: boolean;
};

export const AggregationTable = (props: Props) => {
  const { aggregation, isZeroVisible } = props;
  const { gachaList, currentGachaId, retrieveGacha } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const gachaUtils = new GachaUtils(currentGacha);
  const totalWeight = gachaUtils.getTotalPrizeWeight();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>景品名</TableCell>
            <TableCell>絶対確率 (%)</TableCell>
            <TableCell>相対確率 (%)</TableCell>
            <TableCell>個数</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentGacha.prizes
            .filter(prize => isZeroVisible || aggregation[prize.id] !== 0)
            .map(prize => (
              <TableRow key={prize.id}>
                <TableCell>{prize.name}</TableCell>
                <TableCell>{prize.weight}</TableCell>
                <TableCell>
                  {totalWeight > 0
                    ? FormatUtils.toFixedWithoutZeros((prize.weight / totalWeight) * 100, 4)
                    : '0.00'}
                </TableCell>
                <TableCell>{aggregation[prize.id] || 0}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
