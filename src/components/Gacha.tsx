'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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

type PrizeFormData = {
  prizeName: string;
  prizeWeight: string;
  prizeLimit: string;
  prizeCategoryId: string;
};

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

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<PrizeFormData>({
    defaultValues: {
      prizeName: '',
      prizeWeight: '',
      prizeLimit: '',
      prizeCategoryId: 'none',
    },
  });

  const watchPrizeWeight = watch('prizeWeight');
  const totalWeight = new GachaUtils(currentGacha).getTotalPrizeWeight();
  let computedPrizeRelWeight = '';
  const parsedWeight = parseFloat(watchPrizeWeight);
  if (!isNaN(parsedWeight)) {
    computedPrizeRelWeight =
      totalWeight + parsedWeight > 0
        ? FormatUtils.toFixedWithoutZeros((parsedWeight / (totalWeight + parsedWeight)) * 100, 4)
        : '0';
  }

  const onSubmitPrize = (data: PrizeFormData) => {
    const parsedWeight = parseFloat(data.prizeWeight);
    if (isNaN(parsedWeight)) return;
    const parsedLimit = !isNaN(parseInt(data.prizeLimit)) ? parseInt(data.prizeLimit) : undefined;
    const newPrize: Prize = {
      id: uuidv4(),
      name: data.prizeName,
      weight: parsedWeight,
      limit: parsedLimit,
      categoryId: data.prizeCategoryId,
    };
    createItemInField(currentGachaId, 'prizes', newPrize);
    reset();
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5">新しい景品の追加</Typography>
          <Box>
            <Button variant="outlined" onClick={() => setIsCategoryDialogOpen(true)} sx={{ mr: 1 }}>
              カテゴリ管理
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsCustomAddDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              カスタム追加
            </Button>
            <Button variant="outlined" onClick={() => setIsCustomDeleteDialogOpen(true)}>
              カスタム削除
            </Button>
          </Box>
        </Box>
        <Box sx={{ mb: 1, mt: 2 }}>
          <form
            onSubmit={handleSubmit(onSubmitPrize)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <TextField
              label="景品名"
              {...register('prizeName', { required: '必須' })}
              error={!!errors.prizeName}
              helperText={errors.prizeName?.message}
              sx={{ width: 152 }}
            />
            <TextField
              label="絶対確率 (%)"
              {...register('prizeWeight', {
                required: '必須',
                validate: value => !isNaN(parseFloat(value)) || '数値を入力',
              })}
              error={!!errors.prizeWeight}
              helperText={errors.prizeWeight?.message}
              sx={{ width: 136 }}
            />
            <TextField
              label="相対確率 (%)"
              value={computedPrizeRelWeight}
              slotProps={{ input: { readOnly: true } }}
              sx={{ width: 136 }}
            />
            <TextField
              label="上限"
              {...register('prizeLimit', {
                validate: value => value === '' || !isNaN(parseInt(value)) || '数値を入力',
              })}
              error={!!errors.prizeLimit}
              helperText={errors.prizeLimit?.message}
              sx={{ width: 120 }}
            />
            <Controller
              name="prizeCategoryId"
              control={control}
              rules={{ required: 'カテゴリは必須です' }}
              render={({ field }) => (
                <FormControl sx={{ width: 136 }} error={!!errors.prizeCategoryId}>
                  <InputLabel>カテゴリ</InputLabel>
                  <Select {...field} label="カテゴリ">
                    {currentGacha.categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Button variant="contained" type="submit" sx={{ height: 36, width: 136, mt: 1 }}>
              追加
            </Button>
          </form>
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          景品設定
        </Typography>
        <PrizeTable />
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          ガチャを回す
        </Typography>
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
      <TargetDialog isOpen={isTargetDialogOpen} setIsOpen={setIsTargetDialogOpen} />
      <CategoryDialog isOpen={isCategoryDialogOpen} setIsOpen={setIsCategoryDialogOpen} />
      <CustomAddDialog isOpen={isCustomAddDialogOpen} setIsOpen={setIsCustomAddDialogOpen} />
      <CustomDeleteDialog
        isOpen={isCustomDeleteDialogOpen}
        setIsOpen={setIsCustomDeleteDialogOpen}
      />
    </Box>
  );
};
