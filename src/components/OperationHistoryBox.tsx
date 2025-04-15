import { Box, Button, Typography } from '@mui/material';

import { useGachaContext } from '../contexts/Gacha';
import { Operation } from '../types/operation';

type Props = {
  operationHistory: Operation;
};

export const OperationHistoryBox = (props: Props) => {
  const { operationHistory } = props;

  const { gachaList, currentGachaId, retrieveGacha, retrieveItemInField, deleteItemInField } =
    useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  return (
    <Box
      key={operationHistory.id}
      sx={{ border: '1px solid #ccc', p: 1, mb: 1, borderRadius: '4px' }}
    >
      <Typography>
        実行日時: {new Date(operationHistory.timestamp).toLocaleString()} - {operationHistory.count}
        回実行 - 対象者:{' '}
        {retrieveItemInField(currentGachaId, 'targets', operationHistory.target)?.name || 'なし'}
      </Typography>
      {currentGacha.prizes.map(prize => {
        const count = operationHistory.results[prize.id];
        return count !== undefined ? (
          <Typography key={prize.id}>
            {prize.name}: {count}回
          </Typography>
        ) : null;
      })}
      <Button
        variant="outlined"
        color="error"
        onClick={() => deleteItemInField(currentGachaId, 'operationHistory', operationHistory.id)}
      >
        取り消し
      </Button>
    </Box>
  );
};
