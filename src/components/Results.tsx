import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useGachaContext } from '../contexts/Gacha';
import { FormatUtils } from '../utils/format';
import { GachaUtils } from '../utils/gacha';

export const ResultsView: React.FC = () => {
  const { gachaList, currentGachaId, retrieveGacha, retrieveItemInField } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const gachaUtils = new GachaUtils(currentGacha);
  const overallAggregation = gachaUtils.getOverallAggregation();
  const totalWeight = gachaUtils.getTotalPrizeWeight();

  return (
    <Box>
      <Typography variant="h5">全体の結果</Typography>
      <TableContainer component={Paper} sx={{ my: 2 }}>
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
            {currentGacha.prizes.map(prize => (
              <TableRow key={prize.id}>
                <TableCell>{prize.name}</TableCell>
                <TableCell>{prize.weight}</TableCell>
                <TableCell>
                  {totalWeight > 0 ? (FormatUtils.toFixedWithoutZeros((prize.weight / totalWeight) * 100, 4)) : '0.00'}
                </TableCell>
                <TableCell>{overallAggregation[prize.id] || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">全体の操作履歴</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {currentGacha.operationHistory
            .slice().sort((a, b) => b.timestamp - a.timestamp)
            .map(history => (
            <Box key={history.id} sx={{ border: '1px solid #ccc', p: 1, mb: 1, borderRadius: '4px' }}>
              <Typography>
                実行日時: {new Date(history.timestamp).toLocaleString()} - {history.count}回実行 -
                対象者: {retrieveItemInField(currentGachaId, 'targets', history.target)?.name || 'なし'}
              </Typography>
              {currentGacha.prizes.map(prize => {
                const count = history.results[prize.id];
                return count !== undefined ? (
                  <Typography key={prize.id}>
                    {prize.name}: {count}回
                  </Typography>
                ) : null;
              })}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
      <Typography variant="h5" sx={{ mt: 2 }}>各対象者の結果</Typography>
      {currentGacha.targets.map(target => {
        const targetAggregation = gachaUtils.getTargetAggregation(target.id);

        return (
          <Accordion key={target.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{target.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1">集計結果</Typography>
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
                      .filter(prize => targetAggregation[prize.id] !== 0)
                      .map(prize => (
                        <TableRow key={prize.id}>
                          <TableCell>{prize.name}</TableCell>
                          <TableCell>{prize.weight}</TableCell>
                          <TableCell>
                            {totalWeight > 0 ? FormatUtils.toFixedWithoutZeros((prize.weight / totalWeight) * 100, 4) : '0.00'}
                          </TableCell>
                          <TableCell>{targetAggregation[prize.id] || 0}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">操作履歴</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {currentGacha.operationHistory
                    .filter(history => history.target === target.id)
                    .slice().sort((a, b) => b.timestamp - a.timestamp)
                    .map(history => (
                    <Box key={history.id} sx={{ border: '1px solid #ccc', p: 1, mb: 1, borderRadius: '4px' }}>
                      <Typography>
                        実行日時: {new Date(history.timestamp).toLocaleString()} - {history.count}回実行 -
                        対象者: {retrieveItemInField(currentGachaId, 'targets', history.target)?.name || 'なし'}
                      </Typography>
                      {currentGacha.prizes.map(prize => {
                        const count = history.results[prize.id];
                        return count !== undefined ? (
                          <Typography key={prize.id}>
                            {prize.name}: {count}回
                          </Typography>
                        ) : null;
                      })}
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

