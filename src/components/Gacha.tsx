'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

import { CustomSortIcon } from '../components/CustomSortIcon';
import { useGachaContext } from '../contexts/Gacha';
import { Category } from '../types/category';
import { Prize, PrizeField } from '../types/prize';
import { Target } from '../types/target';
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
    updateItemInField,
    deleteItemInField,
  } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const [newPrizeName, setNewPrizeName] = useState<string>('');
  const [newPrizeWeight, setNewPrizeWeight] = useState<string>('');
  const [newPrizeRelWeight, setNewPrizeRelWeight] = useState<string>('');
  const [newPrizeLimit, setNewPrizeLimit] = useState<string>('');
  const [newPrizeCategoryId, setNewPrizeCategoryId] = useState<string>('none');

  const [customGachaCount, setCustomGachaCount] = useState<string>('1');

  const [currentTargetId, setCurrentTargetId] = useState<string>(currentGacha.targets[0]?.id);
  const [newTargetName, setNewTargetName] = useState<string>('');
  const [targetModalOpen, setTargetModalOpen] = useState<boolean>(false);

  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [categoryModalOpen, setCategoryModalOpen] = useState<boolean>(false);

  const [orderBy, setOrderBy] = useState<'name' | 'categoryId' | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [isEditing, setIsEditing] = useState(false);

  const [isZeroVisible, setIsZeroVisible] = useState(false);

  const [newCustomPrizeName, setNewCustomPrizeName] = useState<string>('');
  const [newCustomPrizeWeight, setNewCustomPrizeWeight] = useState<string>('');
  const [newCustomPrizeRelWeight, setNewCustomPrizeRelWeight] = useState<string>('');
  const [newCustomPrizeLimit, setNewCustomPrizeLimit] = useState<string>('');
  const [newCustomPrizeCategoryId, setNewCustomPrizeCategoryId] = useState<string>('none');
  const [newCustomPrizeStartNumber, setNewCustomPrizeStartNumber] = useState<string>('');
  const [newCustomPrizeEndNumber, setNewCustomPrizeEndNumber] = useState<string>('');
  const [customAddDialogOpen, setCustomAddDialogOpen] = useState<boolean>(false);

  const [newCustomDeletePrizeName, setNewCustomDeletePrizeName] = useState<string>('');
  const [newCustomDeletePrizeStartNumber, setNewCustomDeletePrizeStartNumber] =
    useState<string>('');
  const [newCustomDeletePrizeEndNumber, setNewCustomDeletePrizeEndNumber] = useState<string>('');
  const [customDeleteDialogOpen, setCustomDeleteDialogOpen] = useState<boolean>(false);

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

  const handleNewCustomPrizeWeightChange = (weight: string) => {
    setNewCustomPrizeWeight(weight);
    const parsedWeight = parseFloat(weight);
    const parsedStartNumber = parseInt(newCustomPrizeStartNumber);
    const parsedEndNumber = parseInt(newCustomPrizeEndNumber);
    if (isNaN(parsedWeight) || isNaN(parsedStartNumber) || isNaN(parsedEndNumber)) {
      setNewCustomPrizeRelWeight('');
    } else {
      const newTotalWeight = totalWeight + parsedWeight * (parsedEndNumber - parsedStartNumber + 1);
      const relWeight = newTotalWeight > 0 ? (parsedWeight / newTotalWeight) * 100 : 0;
      setNewCustomPrizeRelWeight(FormatUtils.toFixedWithoutZeros(relWeight, 4));
    }
  };

  const handleCustomAddPrize = () => {
    const parsedWeight = parseFloat(newCustomPrizeWeight);
    const parsedLimit = !isNaN(parseInt(newCustomPrizeLimit))
      ? parseInt(newCustomPrizeLimit)
      : undefined;
    const parsedStartNumber = parseInt(newCustomPrizeStartNumber);
    const parsedEndNumber = parseInt(newCustomPrizeEndNumber);
    if (
      isNaN(parsedWeight) ||
      isNaN(parsedStartNumber) ||
      isNaN(parsedEndNumber) ||
      parsedStartNumber > parsedEndNumber
    )
      return;

    const additionalPrizes: Prize[] = Array.from(
      { length: parsedEndNumber - parsedStartNumber + 1 },
      (_, i): Prize => ({
        id: uuidv4(),
        name: `${newCustomPrizeName}${parsedStartNumber + i}`,
        weight: parsedWeight,
        limit: parsedLimit,
        categoryId: newCustomPrizeCategoryId,
      }),
    );
    updateGacha({ ...currentGacha, prizes: [...currentGacha.prizes, ...additionalPrizes] });

    setNewCustomPrizeName('');
    setNewCustomPrizeWeight('');
    setNewCustomPrizeRelWeight('');
    setNewCustomPrizeLimit('');
    setNewCustomPrizeCategoryId('none');
    setNewCustomPrizeStartNumber('');
    setNewCustomPrizeEndNumber('');
    setCustomAddDialogOpen(false);
  };

  const handleCustomDeletePrize = () => {
    const parsedStartNumber = parseInt(newCustomDeletePrizeStartNumber);
    const parsedEndNumber = parseInt(newCustomDeletePrizeEndNumber);
    if (isNaN(parsedStartNumber) || isNaN(parsedEndNumber) || parsedStartNumber > parsedEndNumber)
      return;

    const targetPrizeNames = Array.from(
      { length: parsedEndNumber - parsedStartNumber + 1 },
      (_, i) => `${newCustomDeletePrizeName}${parsedStartNumber + i}`,
    );
    const newPrizes = currentGacha.prizes.filter(item => !targetPrizeNames.includes(item.name));
    updateGacha({ ...currentGacha, prizes: newPrizes });

    setNewCustomDeletePrizeName('');
    setNewCustomDeletePrizeStartNumber('');
    setNewCustomDeletePrizeEndNumber('');
    setCustomDeleteDialogOpen(false);
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
      case 'categoryId':
        parsedValue = value;
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
    setTargetModalOpen(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory: Category = { id: uuidv4(), name: newCategoryName.trim() };
    createItemInField(currentGachaId, 'categories', newCategory);
    setNewCategoryName('');
  };

  const handleRequestSort = (property: 'name' | 'categoryId') => {
    if (orderBy !== property) {
      setOrder('asc');
      setOrderBy(property);
    } else if (orderBy === property && order === 'asc') {
      setOrder('desc');
    } else if (orderBy === property && order === 'desc') {
      setOrderBy(null);
      setOrder('asc');
    }
  };

  const sortedPrizes = useMemo(() => {
    if (isEditing) return currentGacha.prizes;
    if (!orderBy) return currentGacha.prizes;
    return [...currentGacha.prizes].sort((a, b) => {
      if (orderBy === 'name') {
        return (
          a.name.localeCompare(b.name, 'ja', { sensitivity: 'base', numeric: true }) *
          (order === 'asc' ? 1 : -1)
        );
      }
      if (orderBy === 'categoryId') {
        if (a.categoryId === 'none' && b.categoryId !== 'none') {
          return order === 'asc' ? 1 : -1;
        } else if (b.categoryId === 'none' && a.categoryId !== 'none') {
          return order === 'asc' ? -1 : 1;
        }
        const categoryA =
          retrieveItemInField(currentGachaId, 'categories', a.categoryId)?.name || '';
        const categoryB =
          retrieveItemInField(currentGachaId, 'categories', b.categoryId)?.name || '';
        const categoryComparison =
          categoryA.localeCompare(categoryB, 'ja', { sensitivity: 'base', numeric: true }) *
          (order === 'asc' ? 1 : -1);
        if (categoryComparison !== 0) {
          return categoryComparison;
        }
        return a.name.localeCompare(b.name, 'ja', { sensitivity: 'base', numeric: true });
      }
      return 0;
    });
  }, [currentGacha.prizes, orderBy, order, isEditing, currentGachaId, retrieveItemInField]);

  return (
    <Box>
      <Box sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">新しい景品の追加</Typography>
          <Box>
            <Button variant="outlined" onClick={() => setCategoryModalOpen(true)} sx={{ mr: 2 }}>
              カテゴリ管理
            </Button>
            <Button variant="outlined" onClick={() => setCustomAddDialogOpen(true)} sx={{ mr: 2 }}>
              カスタム追加
            </Button>
            <Button variant="outlined" onClick={() => setCustomDeleteDialogOpen(true)}>
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '25%' }}>
                  <TableSortLabel
                    active={!isEditing && orderBy === 'name'}
                    direction={!isEditing && orderBy === 'name' ? order : 'asc'}
                    IconComponent={() => (
                      <CustomSortIcon active={!isEditing && orderBy === 'name'} direction={order} />
                    )}
                    onClick={() => handleRequestSort('name')}
                  >
                    景品名
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '16%' }}>絶対確率 (%)</TableCell>
                <TableCell sx={{ width: '14%' }}>相対確率 (%)</TableCell>
                <TableCell sx={{ width: '15%' }}>上限</TableCell>
                <TableCell sx={{ width: '20%' }}>
                  <TableSortLabel
                    active={!isEditing && orderBy === 'categoryId'}
                    direction={!isEditing && orderBy === 'categoryId' ? order : 'asc'}
                    IconComponent={() => (
                      <CustomSortIcon
                        active={!isEditing && orderBy === 'categoryId'}
                        direction={order}
                      />
                    )}
                    onClick={() => handleRequestSort('categoryId')}
                  >
                    カテゴリ
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '10%' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPrizes.map(prize => (
                <TableRow key={prize.id}>
                  <TableCell>
                    <TextField
                      label="景品名"
                      value={prize.name}
                      onFocus={() => setIsEditing(true)}
                      onBlur={() => setIsEditing(false)}
                      onChange={e => handleUpdatePrize(prize.id, 'name', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="絶対確率"
                      type="number"
                      value={prize.weight}
                      onFocus={() => setIsEditing(true)}
                      onBlur={() => setIsEditing(false)}
                      onChange={e => handleUpdatePrize(prize.id, 'weight', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    {totalWeight > 0
                      ? FormatUtils.toFixedWithoutZeros((prize.weight / totalWeight) * 100, 4)
                      : '0.00'}
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="上限"
                      type="number"
                      value={prize.limit !== undefined ? prize.limit : ''}
                      onFocus={() => setIsEditing(true)}
                      onBlur={() => setIsEditing(false)}
                      onChange={e => handleUpdatePrize(prize.id, 'limit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <InputLabel>カテゴリ</InputLabel>
                      <Select
                        label="カテゴリ"
                        value={prize.categoryId}
                        onChange={e => handleUpdatePrize(prize.id, 'categoryId', e.target.value)}
                      >
                        {currentGacha.categories.map(category => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => deleteItemInField(currentGachaId, 'prizes', prize.id)}
                    >
                      削除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
        <Button variant="outlined" onClick={() => setTargetModalOpen(true)}>
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
                  onChange={e => handleUpdateTargetName(target.id, e.target.value)}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteTarget(target.id)}
                >
                  削除
                </Button>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 3 }}>
            <TextField
              label="新規対象者名"
              value={newTargetName}
              onChange={e => setNewTargetName(e.target.value)}
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
      <Dialog
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>カテゴリ管理</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 3 }}>
            {currentGacha.categories.map(category => (
              <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  label="カテゴリ名"
                  value={category.name}
                  onChange={e =>
                    updateItemInField(currentGachaId, 'categories', {
                      id: category.id,
                      name: e.target.value,
                    })
                  }
                  slotProps={{ input: { readOnly: category.id !== 'none' ? false : true } }}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => deleteItemInField(currentGachaId, 'categories', category.id)}
                  sx={{ visibility: category.id !== 'none' ? 'visible' : 'hidden' }}
                >
                  削除
                </Button>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 3 }}>
            <TextField
              label="新規カテゴリ名"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleAddCategory} sx={{ mt: 1 }}>
              追加
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryModalOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={customAddDialogOpen}
        onClose={() => setCustomAddDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>カスタム追加</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="景品名"
              value={newCustomPrizeName}
              onChange={e => setNewCustomPrizeName(e.target.value)}
              fullWidth
            />
            <TextField
              label="絶対確率 (%)"
              value={newCustomPrizeWeight}
              onChange={e => handleNewCustomPrizeWeightChange(e.target.value)}
              fullWidth
            />
            <TextField
              label="相対確率 (%)"
              value={newCustomPrizeRelWeight}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
            <TextField
              label="上限"
              value={newCustomPrizeLimit}
              onChange={e => setNewCustomPrizeLimit(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                label="カテゴリ"
                value={newCustomPrizeCategoryId}
                onChange={e => setNewCustomPrizeCategoryId(e.target.value)}
              >
                {currentGacha.categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="開始番号"
              value={newCustomPrizeStartNumber}
              onChange={e => setNewCustomPrizeStartNumber(e.target.value)}
              fullWidth
            />
            <TextField
              label="終了番号"
              value={newCustomPrizeEndNumber}
              onChange={e => setNewCustomPrizeEndNumber(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCustomAddPrize}>
            追加
          </Button>
          <Button variant="outlined" onClick={() => setCustomAddDialogOpen(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={customDeleteDialogOpen}
        onClose={() => setCustomDeleteDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>カスタム削除</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="景品名"
              value={newCustomDeletePrizeName}
              onChange={e => setNewCustomDeletePrizeName(e.target.value)}
              fullWidth
            />
            <TextField
              label="開始番号"
              value={newCustomDeletePrizeStartNumber}
              onChange={e => setNewCustomDeletePrizeStartNumber(e.target.value)}
              fullWidth
            />
            <TextField
              label="終了番号"
              value={newCustomDeletePrizeEndNumber}
              onChange={e => setNewCustomDeletePrizeEndNumber(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCustomDeletePrize}>
            削除
          </Button>
          <Button variant="outlined" onClick={() => setCustomDeleteDialogOpen(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
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
                .filter(prize => isZeroVisible || currentTargetAggregation[prize.id] !== 0)
                .map(prize => (
                  <TableRow key={prize.id}>
                    <TableCell>{prize.name}</TableCell>
                    <TableCell>{prize.weight}</TableCell>
                    <TableCell>
                      {totalWeight > 0
                        ? FormatUtils.toFixedWithoutZeros((prize.weight / totalWeight) * 100, 4)
                        : '0.00'}
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
            <Box
              key={history.id}
              sx={{ border: '1px solid #ccc', p: 1, mb: 1, borderRadius: '4px' }}
            >
              <Typography>
                実行日時: {new Date(history.timestamp).toLocaleString()} - {history.count}回実行 -
                対象者:{' '}
                {retrieveItemInField(currentGachaId, 'targets', history.target)?.name || 'なし'}
              </Typography>
              {currentGacha.prizes.map(prize => {
                const count = history.results[prize.id];
                return count !== undefined ? (
                  <Typography key={prize.id}>
                    {prize.name}: {count}回
                  </Typography>
                ) : null;
              })}
              <Button
                variant="outlined"
                color="error"
                onClick={() => deleteItemInField(currentGachaId, 'operationHistory', history.id)}
              >
                取り消し
              </Button>
            </Box>
          ))}
      </Box>
    </Box>
  );
};
