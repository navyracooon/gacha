'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { ExpandMore, Visibility, VisibilityOff } from '@mui/icons-material';

import { AggregationTable } from './AggregationTable';
import { OperationHistoryBox } from './OperationHistoryBox';
import { useGachaContext } from '../contexts/Gacha';
import { GachaUtils } from '../utils/gacha';

export const ResultsView: React.FC = () => {
  const { gachaList, currentGachaId, retrieveGacha } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const [isZeroVisible, setIsZeroVisible] = useState(true);
  const [isTargetZeroVisible, setIsTargetZeroVisible] = useState(false);

  const gachaUtils = new GachaUtils(currentGacha);
  const overallAggregation = gachaUtils.getOverallAggregation();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">全体の結果</Typography>
        <Tooltip title="個数が0の景品を非表示にする" placement="top">
          <IconButton onClick={() => setIsZeroVisible(!isZeroVisible)}>
            {isZeroVisible ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </Tooltip>
      </Box>
      <AggregationTable aggregation={overallAggregation} isZeroVisible={isZeroVisible} />
      <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">全体の操作履歴</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {currentGacha.operationHistory
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(history => (
              <OperationHistoryBox key={history.id} operationHistory={history} />
            ))}
        </AccordionDetails>
      </Accordion>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ mt: 2 }}>
          各対象者の結果
        </Typography>
        <Tooltip title="個数が0の景品を非表示にする" placement="top">
          <IconButton onClick={() => setIsTargetZeroVisible(!isTargetZeroVisible)}>
            {isTargetZeroVisible ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </Tooltip>
      </Box>
      {currentGacha.targets.map(target => {
        const targetAggregation = gachaUtils.getTargetAggregation(target.id);

        return (
          <Accordion key={target.id} defaultExpanded sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">{target.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <AggregationTable
                aggregation={targetAggregation}
                isZeroVisible={isTargetZeroVisible}
              />
              <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">操作履歴</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {currentGacha.operationHistory
                    .filter(history => history.target === target.id)
                    .slice()
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map(history => (
                      <OperationHistoryBox key={history.id} operationHistory={history} />
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
