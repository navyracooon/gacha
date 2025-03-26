import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  FormControl,
  InputLabel,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

import { Gacha } from "../types/gacha";
import { Prize } from "../types/prize";
import { Target } from "../types/target";

type Props = {
  gacha: Gacha;
  updateGachaType: (gt: Gacha) => void;
  targets: Target[];
  setTargets: React.Dispatch<React.SetStateAction<Target[]>>;
  selectedTargetId: string;
  setSelectedTargetId: React.Dispatch<React.SetStateAction<string>>;
  targetModalOpen: boolean;
  setTargetModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newTargetName: string;
  setNewTargetName: React.Dispatch<React.SetStateAction<string>>;
}

export const GachaView: React.FC<Props> = ({
  gacha,
  updateGachaType,
  targets,
  setTargets,
  selectedTargetId,
  setSelectedTargetId,
  targetModalOpen,
  setTargetModalOpen,
  newTargetName,
  setNewTargetName
}) => {
  const globalCounts: { [prizeId: string]: number } = {};
  gacha.prizes.forEach(prize => {
    globalCounts[prize.id] = 0;
  });
  gacha.operationHistory.forEach(op => {
    for (const pid in op.results) {
      globalCounts[pid] = (globalCounts[pid] || 0) + op.results[pid];
    }
  });

  const aggregatedResults = gacha.prizes.reduce((acc, prize) => {
    acc[prize.id] = 0;
    return acc;
  }, {} as { [prizeId: string]: number });
  gacha.operationHistory
    .filter(op => op.target === selectedTargetId)
    .forEach(op => {
      for (const pid in op.results) {
        aggregatedResults[pid] = (aggregatedResults[pid] || 0) + op.results[pid];
      }
    });

  const totalAbs = gacha.prizes.reduce((sum, p) => sum + p.abs, 0);

  const [newPrizeName, setNewPrizeName] = useState<string>('');
  const [newPrizeAbs, setNewPrizeAbs] = useState<string>('');
  const [newPrizeLimit, setNewPrizeLimit] = useState<string>('');
  const [newPrizeRel, setNewPrizeRel] = useState<string>('');
  const [customGachaCount, setCustomGachaCount] = useState<string>('1');

  const addTarget = () => {
    if (!newTargetName.trim()) return;
    const newTarget: Target = { id: uuidv4(), name: newTargetName.trim() };
    const newTargets = [...targets, newTarget];
    setTargets(newTargets);
    setSelectedTargetId(newTargets[0].id);
    setNewTargetName('');
  };

  const updateTarget = (id: string, name: string) => {
    setTargets(targets.map(t => (t.id === id ? { ...t, name } : t)));
  };

  const deleteTarget = (id: string) => {
    const newTargets = targets.filter(t => t.id !== id);
    setTargets(newTargets);
    if (newTargets.length > 0) {
      setSelectedTargetId(newTargets[0].id);
    } else {
      setSelectedTargetId('');
    }
  };

  const handleCloseTargetModal = () => {
    if (targets.length === 0) {
      setTargets([{ id: 'none', name: 'なし' }]);
      setSelectedTargetId('none');
    }
    setTargetModalOpen(false);
  };

  const handleNewPrizeAbsChange = (value: string) => {
    setNewPrizeAbs(value);
    const absVal = parseFloat(value);
    if (!isNaN(absVal)) {
      const rel = totalAbs + absVal > 0 ? (absVal / (totalAbs + absVal)) * 100 : 0;
      setNewPrizeRel(rel.toFixed(2));
    } else {
      setNewPrizeRel('');
    }
  };

  const addPrize = () => {
    if (!newPrizeName || !newPrizeAbs) return;
    const absVal = parseFloat(newPrizeAbs);
    if (isNaN(absVal)) return;
    let limitVal: number | undefined = undefined;
    if (newPrizeLimit.trim() !== '') {
      limitVal = parseInt(newPrizeLimit);
      if (isNaN(limitVal)) limitVal = undefined;
    }
    const newPrize: Prize = { id: uuidv4(), name: newPrizeName, abs: absVal, limit: limitVal };
    updateGachaType({ ...gacha, prizes: [...gacha.prizes, newPrize] });
    setNewPrizeName('');
    setNewPrizeAbs('');
    setNewPrizeLimit('');
    setNewPrizeRel('');
  };

  const updatePrize = (pid: string, newAbs: number) => {
    const updatedPrizes = gacha.prizes.map(prize =>
      prize.id === pid ? { ...prize, abs: newAbs } : prize
    );
    updateGachaType({ ...gacha, prizes: updatedPrizes });
  };

  const deletePrize = (pid: string) => {
    const updatedPrizes = gacha.prizes.filter(prize => prize.id !== pid);
    updateGachaType({ ...gacha, prizes: updatedPrizes });
  };

  const runGachaHandler = (count: number) => {
    const currentCounts: { [pid: string]: number } = {};
    gacha.prizes.forEach(prize => {
      currentCounts[prize.id] = globalCounts[prize.id] || 0;
    });
    const results: { [pid: string]: number } = {};
    for (let i = 0; i < count; i++) {
      const candidates = gacha.prizes.filter(prize => {
        if (prize.limit !== undefined) {
          return currentCounts[prize.id] < prize.limit;
        }
        return true;
      });
      if (candidates.length === 0) break;
      const totalWeight = candidates.reduce((sum, prize) => sum + prize.abs, 0);
      const rand = Math.random() * totalWeight;
      let cumulative = 0;
      let drawn: Prize | null = null;
      for (const prize of candidates) {
        cumulative += prize.abs;
        if (rand < cumulative) {
          drawn = prize;
          break;
        }
      }
      if (drawn) {
        results[drawn.id] = (results[drawn.id] || 0) + 1;
        currentCounts[drawn.id] += 1;
      }
    }
    const newOp = {
      id: uuidv4(),
      count,
      results,
      timestamp: Date.now(),
      target: selectedTargetId
    };
    updateGachaType({ ...gacha, operationHistory: [newOp, ...gacha.operationHistory] });
  };

  const undoOperation = (opId: string) => {
    const updatedOps = gacha.operationHistory.filter(op => op.id !== opId);
    updateGachaType({ ...gacha, operationHistory: updatedOps });
  };

  const bulkUndoOperations = () => {
    updateGachaType({ ...gacha, operationHistory: [] });
  };

  return (
    <Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">新しい景品の追加</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField label="景品名" value={newPrizeName} onChange={(e) => setNewPrizeName(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="絶対確率 (%)" value={newPrizeAbs} onChange={(e) => handleNewPrizeAbsChange(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="相対確率 (%)" value={newPrizeRel} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="上限" value={newPrizeLimit} onChange={(e) => setNewPrizeLimit(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={addPrize} fullWidth>
              追加
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">景品設定</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>景品名</TableCell>
                <TableCell>絶対確率 (%)</TableCell>
                <TableCell>相対確率 (%)</TableCell>
                <TableCell>上限</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gacha.prizes.map(prize => (
                <TableRow key={prize.id}>
                  <TableCell>{prize.name}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={prize.abs}
                      onChange={(e) => updatePrize(prize.id, parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    {totalAbs > 0 ? ((prize.abs / totalAbs) * 100).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={prize.limit !== undefined ? prize.limit : ''}
                      onChange={(e) => {
                        const newLimit = e.target.value === '' ? undefined : parseInt(e.target.value);
                        const updatedPrizes = gacha.prizes.map(p =>
                          p.id === prize.id ? { ...p, limit: newLimit } : p
                        );
                        updateGachaType({ ...gacha, prizes: updatedPrizes });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" color="error" onClick={() => deletePrize(prize.id)}>
                      削除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">ガチャを回す</Typography>
        <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>対象者</InputLabel>
            <Select
              value={selectedTargetId}
              label="対象者"
              onChange={(e) => setSelectedTargetId(e.target.value)}
            >
              {targets.map(t => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => setTargetModalOpen(true)}>
            対象者管理
          </Button>
        </Box>
        <Dialog open={targetModalOpen} onClose={handleCloseTargetModal} fullWidth maxWidth="sm">
          <DialogTitle>対象者管理</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 3 }}>
              {targets.map(t => (
                <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TextField
                    label="対象者名"
                    value={t.name}
                    onChange={(e) => updateTarget(t.id, e.target.value)}
                    fullWidth
                  />
                  <Button variant="outlined" color="error" onClick={() => deleteTarget(t.id)}>
                    削除
                  </Button>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 3 }}>
              <TextField
                label="新規対象者名"
                value={newTargetName}
                onChange={(e) => setNewTargetName(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={addTarget} sx={{ mt: 1 }}>
                追加
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTargetModal}>閉じる</Button>
          </DialogActions>
        </Dialog>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TextField
              label="回数指定"
              type="number"
              value={customGachaCount}
              onChange={(e) => setCustomGachaCount(e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim() === '') {
                  setCustomGachaCount('1');
                }
              }}
            />
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => runGachaHandler(parseInt(customGachaCount))}>
              実行
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => runGachaHandler(1)}>
              1回
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => runGachaHandler(5)}>
              5回
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => runGachaHandler(10)}>
              10回
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => runGachaHandler(100)}>
              100回
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">
          集計結果（対象者：{targets.find(t => t.id === selectedTargetId)?.name || 'なし'}）
        </Typography>
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
                  <TableCell>{aggregatedResults[prize.id] || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">操作履歴</Typography>
        {gacha.operationHistory.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 1 }}>
            <Button variant="outlined" color="error" onClick={bulkUndoOperations}>
              一括取り消し
            </Button>
          </Box>
        )}
        {gacha.operationHistory.map(op => (
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
            <Button variant="outlined" color="error" onClick={() => undoOperation(op.id)}>
              取り消し
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
