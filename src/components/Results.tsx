import React from 'react';
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

import { Gacha } from "../types/gacha";
import { Operation } from "../types/operation";
import { Target } from "../types/target";

type Props = {
  gacha: Gacha;
  targets: Target[];
}

export const ResultsView: React.FC<Props> = ({ gacha, targets }) => {
  const overallAgg: { [prizeId: string]: number } = {};
  gacha.prizes.forEach(prize => {
    overallAgg[prize.id] = 0;
  });
  gacha.operationHistory.forEach(op => {
    for (const pid in op.results) {
      overallAgg[pid] = (overallAgg[pid] || 0) + op.results[pid];
    }
  });
  const totalAbs = gacha.prizes.reduce((sum, p) => sum + p.abs, 0);
  const overallOps = [...gacha.operationHistory].sort((a, b) => b.timestamp - a.timestamp);
  const opsByTarget: { [key: string]: Operation[] } = {};
  targets.forEach(target => {
    opsByTarget[target.id] = [];
  });
  gacha.operationHistory.forEach(op => {
    const key = op.target || 'none';
    if (!opsByTarget[key]) {
      opsByTarget[key] = [];
    }
    opsByTarget[key].push(op);
  });

  return (
    <Box>
      <Typography variant="h5">全体の結果</Typography>
      <Typography variant="subtitle1">全体の集計結果</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
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
            {gacha.prizes.map(prize => (
              <TableRow key={prize.id}>
                <TableCell>{prize.name}</TableCell>
                <TableCell>{prize.abs}</TableCell>
                <TableCell>
                  {totalAbs > 0 ? ((prize.abs / totalAbs) * 100).toFixed(2) : '0.00'}
                </TableCell>
                <TableCell>{overallAgg[prize.id] || 0}</TableCell>
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
          {overallOps.map(op => (
            <Box key={op.id} sx={{ border: '1px solid #ccc', p: 1, mb: 1, borderRadius: '4px' }}>
              <Typography>
                実行日時: {new Date(op.timestamp).toLocaleString()} - {op.count}回実行 - 対象者:{' '}
                {(() => {
                  const t = targets.find(t => t.id === op.target);
                  return t ? t.name : 'なし';
                })()}
              </Typography>
              {Object.keys(op.results).map(prizeId => {
                const prize = gacha.prizes.find(p => p.id === prizeId);
                return prize ? (
                  <Typography key={prizeId}>
                    {prize.name}: {op.results[prizeId]}回
                  </Typography>
                ) : null;
              })}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
      <Typography variant="h5" sx={{ mt: 2 }}>各対象者の結果</Typography>
      {targets.map(target => {
        const agg: { [prizeId: string]: number } = {};
        gacha.prizes.forEach(prize => {
          agg[prize.id] = 0;
        });
        const targetOps = (opsByTarget[target.id] || []).sort((a, b) => b.timestamp - a.timestamp);
        targetOps.forEach(op => {
          for (const pid in op.results) {
            agg[pid] = (agg[pid] || 0) + op.results[pid];
          }
        });
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
                    {gacha.prizes.map(prize => (
                      <TableRow key={prize.id}>
                        <TableCell>{prize.name}</TableCell>
                        <TableCell>{prize.abs}</TableCell>
                        <TableCell>
                          {totalAbs > 0 ? ((prize.abs / totalAbs) * 100).toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell>{agg[prize.id] || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">操作履歴</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {targetOps.map(op => (
                    <Box key={op.id} sx={{ border: '1px solid #ccc', p: 1, mb: 1, borderRadius: '4px' }}>
                      <Typography>
                        実行日時: {new Date(op.timestamp).toLocaleString()} - {op.count}回実行 - 対象者:{' '}
                        {(() => {
                          const t = targets.find(t => t.id === op.target);
                          return t ? t.name : 'なし';
                        })()}
                      </Typography>
                      {Object.keys(op.results).map(prizeId => {
                        const prize = gacha.prizes.find(p => p.id === prizeId);
                        return prize ? (
                          <Typography key={prizeId}>
                            {prize.name}: {op.results[prizeId]}回
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

