'use client';

import { useState } from 'react';
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

import { useGachaContext } from '../contexts/Gacha';
import { Prize, PrizeField } from '../types/prize';
import { Target } from '../types/target';
import { GachaUtils } from '../utils/gacha';

export const GachaView: React.FC = () => {
  const { gachaList, currentGachaId, retrieveGacha, updateGacha, createItemInField, retrieveItemInField, updateItemInField, deleteItemInField } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const [currentTargetId, setCurrentTargetId] = useState<string>(currentGacha.targets[0]?.id);
  const [targetModalOpen, setTargetModalOpen] = useState<boolean>(false);
  const [newTargetName, setNewTargetName] = useState<string>('');
  const [newPrizeName, setNewPrizeName] = useState<string>('');
  const [newPrizeWeight, setNewPrizeWeight] = useState<string>('');
  const [newPrizeRelWeight, setNewPrizeRelWeight] = useState<string>('');
  const [newPrizeLimit, setNewPrizeLimit] = useState<string>('');
  const [customGachaCount, setCustomGachaCount] = useState<string>('1');

  const gachaUtils = new GachaUtils(currentGacha);
  const overallAggregation = gachaUtils.getOverallAggregation();
  const currentTargetAggregation = gachaUtils.getTargetAggregation(currentTargetId);
  const totalWeight = gachaUtils.getTotalPrizeWeight();

  const handleAddPrize = () => {
    const parsedWeight = parseFloat(newPrizeWeight);
    if (!newPrizeName || isNaN(parsedWeight)) return;

    const parsedLimit = !isNaN(parseInt(newPrizeLimit)) ? parseInt(newPrizeLimit) : undefined;
    const newPrize: Prize = { id: uuidv4(), name: newPrizeName, weight: parsedWeight, limit: parsedLimit };
    createItemInField(currentGachaId, 'prizes', newPrize);
    setNewPrizeName('');
    setNewPrizeWeight('');
    setNewPrizeRelWeight('');
    setNewPrizeLimit('');
  };

  const handleNewPrizeWeightChange = (weight: string) => {
    setNewPrizeWeight(weight);
    const parsedWeight = parseFloat(weight);

    if (!isNaN(parsedWeight)) {
      const relWeight = totalWeight + parsedWeight > 0 ? (parsedWeight / (totalWeight + parsedWeight)) * 100 : 0;
      setNewPrizeRelWeight(relWeight.toFixed(2));
    } else {
      setNewPrizeRelWeight('');
    }
  };

  const handleUpdatePrize = (prizeId: string, key: PrizeField, value: string) => {
    let parsedValue;
    switch (key) {
      case 'name':
        parsedValue = value;
        break;
      case 'weight':
        if (value === '') {
          parsedValue = 0;
          break;
        }
        if (isNaN(parseFloat(value))) return;
        parsedValue = parseFloat(value);
        break;
      case 'limit':
        if (value === '') {
          parsedValue = undefined;
          break;
        }
        if (isNaN(parseInt(value))) return;
        parsedValue = parseInt(value);
        break;
    }

    const prevPrize = retrieveItemInField(currentGachaId, 'prizes', prizeId);
    if (prevPrize) {
      updateItemInField(currentGachaId, 'prizes', { ...prevPrize, [key]: parsedValue });
    }
  };

  const handleGachaPull = (count: number) => {
    const currentCounts: { [prizeId: string]: number } = {};
    currentGacha.prizes.forEach(prize => {
      currentCounts[prize.id] = overallAggregation[prize.id] || 0;
    });
    const results: { [prizeId: string]: number } = {};
    for (let i = 0; i < count; i++) {
      const candidates = currentGacha.prizes.filter(prize => {
        if (prize.limit !== undefined) {
          return currentCounts[prize.id] < prize.limit;
        }
        return true;
      });
      if (candidates.length === 0) break;
      const rand = Math.random() * totalWeight;
      let cumulative = 0;
      let drawn: Prize | null = null;
      for (const prize of candidates) {
        cumulative += prize.weight;
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

    const newHistory = {
      id: uuidv4(),
      count,
      results,
      timestamp: Date.now(),
      target: currentTargetId,
    };
    createItemInField(currentGachaId, 'operationHistory', newHistory);
  };

  const handleAddTarget = () => {
    if (!newTargetName.trim()) return;
    const newTarget: Target = { id: uuidv4(), name: newTargetName.trim() };
    createItemInField(currentGachaId, 'targets', newTarget);
    setCurrentTargetId(newTarget.id);
    setNewTargetName('');
  };

  const handleUpdateTargetName = (targetId: string, name: string) => {
    updateItemInField(currentGachaId, 'targets', { id: targetId, name: name });
    setCurrentTargetId(targetId);
  };

  const handleDeleteTarget = (targetId: string) => {
    if (targetId === currentTargetId) {
      if (currentGacha.targets.length === 1) {
        setCurrentTargetId('');
      } else if (currentGacha.targets.length > 1) {
        if (currentGacha.targets.at(-1)!.id === targetId) {
          setCurrentTargetId(currentGacha.targets.at(-2)!.id);
        } else {
          setCurrentTargetId(currentGacha.targets.at(-1)!.id);
        }
      }
    }

    deleteItemInField(currentGachaId, 'targets', targetId);
  };

  const handleTargetModalClose = () => {
    if (currentGacha.targets.length === 0) {
      const fallbackTarget = { id: uuidv4(), name: 'なし' };
      createItemInField(currentGachaId, 'targets', fallbackTarget);
      setCurrentTargetId(fallbackTarget.id);
    }
    setTargetModalOpen(false)
  };

  return (
    <Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          新しい景品の追加
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField label="景品名" value={newPrizeName} onChange={(e) => setNewPrizeName(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="絶対確率 (%)" value={newPrizeWeight} onChange={(e) => handleNewPrizeWeightChange(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="相対確率 (%)" value={newPrizeRelWeight} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="上限" value={newPrizeLimit} onChange={(e) => setNewPrizeLimit(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={handleAddPrize} fullWidth>
              追加
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>景品設定</Typography>
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
              {currentGacha.prizes.map(prize => (
                <TableRow key={prize.id}>
                  <TableCell>
                    <TextField
                      label="景品名"
                      value={prize.name}
                      onChange={(e) => handleUpdatePrize(prize.id, 'name', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={prize.weight}
                      onChange={(e) => handleUpdatePrize(prize.id, 'weight', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    {totalWeight > 0 ? ((prize.weight / totalWeight) * 100).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={prize.limit !== undefined ? prize.limit : ''}
                      onChange={(e) => handleUpdatePrize(prize.id, 'limit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" color="error" onClick={() => deleteItemInField(currentGachaId, 'prizes', prize.id)}>
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
              value={currentTargetId}
              label="対象者"
              onChange={(e) => setCurrentTargetId(e.target.value)}
            >
              {currentGacha.targets.map(target => (
                <MenuItem key={target.id} value={target.id}>{target.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => setTargetModalOpen(true)}>
            対象者管理
          </Button>
        </Box>
        <Dialog open={targetModalOpen} onClose={handleTargetModalClose} fullWidth maxWidth="sm">
          <DialogTitle>対象者管理</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 3 }}>
              {currentGacha.targets.map(target => (
                <Box key={target.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TextField
                    label="対象者名"
                    value={target.name}
                    onChange={(e) => handleUpdateTargetName(target.id, e.target.value)}
                    fullWidth
                  />
                  <Button variant="outlined" color="error" onClick={() => handleDeleteTarget(target.id)}>
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
              <Button variant="contained" onClick={handleAddTarget} sx={{ mt: 1 }}>
                追加
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleTargetModalClose}>閉じる</Button>
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
            <Button variant="contained" onClick={() => handleGachaPull(parseInt(customGachaCount))}>
              実行
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => handleGachaPull(1)}>
              1回
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => handleGachaPull(5)}>
              5回
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => handleGachaPull(10)}>
              10回
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => handleGachaPull(100)}>
              100回
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          集計結果（対象者：{retrieveItemInField(currentGachaId, 'targets', currentTargetId)?.name || 'なし'}）
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
              {currentGacha.prizes.map(prize => (
                <TableRow key={prize.id}>
                  <TableCell>{prize.name}</TableCell>
                  <TableCell>{prize.weight}</TableCell>
                  <TableCell>
                    {totalWeight > 0 ? ((prize.weight / totalWeight) * 100).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell>{currentTargetAggregation[prize.id] || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">操作履歴</Typography>
        {currentGacha.operationHistory.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 1 }}>
            <Button variant="outlined" color="error" onClick={() => updateGacha({ ...currentGacha, operationHistory: [] })}>
              一括取り消し
            </Button>
          </Box>
        )}
        {currentGacha.operationHistory
          .slice().sort((a, b) => b.timestamp - a.timestamp)
          .map(history => (
          <Box key={history.id} sx={{ border: '1px solid #ccc', p: 1, mb: 1, borderRadius: '4px' }}>
            <Typography>
              実行日時: {new Date(history.timestamp).toLocaleString()} - {history.count}回実行 -
              対象者: {retrieveItemInField(currentGachaId, 'targets', history.target)?.name || 'なし'}
            </Typography>
            {Object.keys(history.results).map(prizeId => {
              const prize = retrieveItemInField(currentGachaId, 'prizes', prizeId);
              return prize ? (
                <Typography key={prizeId}>
                  {prize.name}: {history.results[prizeId]}回
                </Typography>
              ) : null;
            })}
            <Button variant="outlined" color="error" onClick={() => deleteItemInField(currentGachaId, 'operationHistory', history.id)}>
              取り消し
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
