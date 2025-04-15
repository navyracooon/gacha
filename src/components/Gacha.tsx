'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

import { AggregationTable } from './AggregationTable';
import { CategoryDialog } from './CategoryDialog';
import { CustomAddDialog } from './CustomAddDialog';
import { CustomDeleteDialog } from './CustomDeleteDialog';
import { OperationHistoryBox } from './OperationHistoryBox';
import { PrizeTable } from './PrizeTable';
import { TargetDialog } from './TargetDialog';
import { useGachaContext } from '../contexts/Gacha';
import { Prize } from '../types/prize';
import { FormatUtils } from '../utils/format';
import { GachaUtils } from '../utils/gacha';

export const GachaView: React.FC = () => {
  const {
    gachaList,
    currentGachaId,
    retrieveGacha,
    updateGacha,
    createItemInField,
    retrieveItemInField,
  } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const [newPrizeName, setNewPrizeName] = useState<string>('');
  const [newPrizeWeight, setNewPrizeWeight] = useState<string>('');
  const [newPrizeRelWeight, setNewPrizeRelWeight] = useState<string>('');
  const [newPrizeLimit, setNewPrizeLimit] = useState<string>('');
  const [newPrizeCategoryId, setNewPrizeCategoryId] = useState<string>('none');

  const [customGachaCount, setCustomGachaCount] = useState<string>('1');

  const [currentTargetId, setCurrentTargetId] = useState<string>(currentGacha.targets[0]?.id);

  const [isZeroVisible, setIsZeroVisible] = useState(false);

  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState<boolean>(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState<boolean>(false);
  const [isCustomAddDialogOpen, setIsCustomAddDialogOpen] = useState<boolean>(false);
  const [isCustomDeleteDialogOpen, setIsCustomDeleteDialogOpen] = useState<boolean>(false);

  const gachaUtils = new GachaUtils(currentGacha);
  const overallAggregation = gachaUtils.getOverallAggregation();
  const currentTargetAggregation = gachaUtils.getTargetAggregation(currentTargetId);
  const totalWeight = gachaUtils.getTotalPrizeWeight();

  const handleAddPrize = () => {
    const parsedWeight = parseFloat(newPrizeWeight);
    if (!newPrizeName || isNaN(parsedWeight)) return;
    const parsedLimit = !isNaN(parseInt(newPrizeLimit)) ? parseInt(newPrizeLimit) : undefined;
    const newPrize: Prize = {
      id: uuidv4(),
      name: newPrizeName,
      weight: parsedWeight,
      limit: parsedLimit,
      categoryId: newPrizeCategoryId,
    };
    createItemInField(currentGachaId, 'prizes', newPrize);
    setNewPrizeName('');
    setNewPrizeWeight('');
    setNewPrizeRelWeight('');
    setNewPrizeLimit('');
    setNewPrizeCategoryId('none');
  };

  const handleNewPrizeWeightChange = (weight: string) => {
    setNewPrizeWeight(weight);
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight)) {
      setNewPrizeRelWeight('');
      return;
    }
    const relWeight =
      totalWeight + parsedWeight > 0 ? (parsedWeight / (totalWeight + parsedWeight)) * 100 : 0;
    setNewPrizeRelWeight(FormatUtils.toFixedWithoutZeros(relWeight, 4));
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

  return (
    <Box>
      <Box sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">新しい景品の追加</Typography>
          <Box>
            <Button variant="outlined" onClick={() => setIsCategoryDialogOpen(true)} sx={{ mr: 2 }}>
              カテゴリ管理
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsCustomAddDialogOpen(true)}
              sx={{ mr: 2 }}
            >
              カスタム追加
            </Button>
            <Button variant="outlined" onClick={() => setIsCustomDeleteDialogOpen(true)}>
              カスタム削除
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            mb: 1,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 2,
            mt: 2,
          }}
        >
          <TextField
            label="景品名"
            value={newPrizeName}
            onChange={e => setNewPrizeName(e.target.value)}
            fullWidth
          />
          <TextField
            label="絶対確率 (%)"
            value={newPrizeWeight}
            onChange={e => handleNewPrizeWeightChange(e.target.value)}
            fullWidth
          />
          <TextField
            label="相対確率 (%)"
            value={newPrizeRelWeight}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
          />
          <TextField
            label="上限"
            value={newPrizeLimit}
            onChange={e => setNewPrizeLimit(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={newPrizeCategoryId}
              label="カテゴリ"
              onChange={e => setNewPrizeCategoryId(e.target.value)}
            >
              {currentGacha.categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleAddPrize}>
            追加
          </Button>
        </Box>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          景品設定
        </Typography>
        <PrizeTable />
      </Box>
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>対象者</InputLabel>
          <Select
            value={currentTargetId}
            label="対象者"
            onChange={e => setCurrentTargetId(e.target.value)}
          >
            {currentGacha.targets.map(target => (
              <MenuItem key={target.id} value={target.id}>
                {target.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={() => setIsTargetDialogOpen(true)}>
          対象者管理
        </Button>
      </Box>
      <TargetDialog isOpen={isTargetDialogOpen} setIsOpen={setIsTargetDialogOpen} />
      <CategoryDialog isOpen={isCategoryDialogOpen} setIsOpen={setIsCategoryDialogOpen} />
      <CustomAddDialog isOpen={isCustomAddDialogOpen} setIsOpen={setIsCustomAddDialogOpen} />
      <CustomDeleteDialog
        isOpen={isCustomDeleteDialogOpen}
        setIsOpen={setIsCustomDeleteDialogOpen}
      />
      <Box sx={{ my: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          ガチャを回す
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 2 }}>
          <TextField
            label="回数指定"
            type="number"
            value={customGachaCount}
            onChange={e => setCustomGachaCount(e.target.value)}
            onBlur={e => {
              if (e.target.value.trim() === '') {
                setCustomGachaCount('1');
              }
            }}
          />
          <Button variant="contained" onClick={() => handleGachaPull(parseInt(customGachaCount))}>
            実行
          </Button>
          <Button variant="contained" onClick={() => handleGachaPull(1)}>
            1回
          </Button>
          <Button variant="contained" onClick={() => handleGachaPull(5)}>
            5回
          </Button>
          <Button variant="contained" onClick={() => handleGachaPull(10)}>
            10回
          </Button>
          <Button variant="contained" onClick={() => handleGachaPull(100)}>
            100回
          </Button>
        </Box>
      </Box>
      <Box sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5">
            集計結果（対象者：
            {retrieveItemInField(currentGachaId, 'targets', currentTargetId)?.name || 'なし'}）
          </Typography>
          <Tooltip title="個数が0の景品を非表示にする" placement="top">
            <IconButton onClick={() => setIsZeroVisible(!isZeroVisible)}>
              {isZeroVisible ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Tooltip>
        </Box>
        <AggregationTable aggregation={currentTargetAggregation} isZeroVisible={isZeroVisible} />
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">操作履歴</Typography>
        {currentGacha.operationHistory.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 1 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => updateGacha({ ...currentGacha, operationHistory: [] })}
            >
              一括取り消し
            </Button>
          </Box>
        )}
        {currentGacha.operationHistory
          .slice()
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(history => (
            <OperationHistoryBox key={history.id} operationHistory={history} />
          ))}
      </Box>
    </Box>
  );
};
