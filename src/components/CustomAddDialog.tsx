'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

import { useGachaContext } from '../contexts/Gacha';
import { Prize } from '../types/prize';
import { FormatUtils } from '../utils/format';
import { GachaUtils } from '../utils/gacha';

type Props = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const CustomAddDialog = (props: Props) => {
  const { isOpen, setIsOpen } = props;

  const { gachaList, currentGachaId, retrieveGacha, updateGacha } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const [newCustomPrizeName, setNewCustomPrizeName] = useState<string>('');
  const [newCustomPrizeWeight, setNewCustomPrizeWeight] = useState<string>('');
  const [newCustomPrizeRelWeight, setNewCustomPrizeRelWeight] = useState<string>('');
  const [newCustomPrizeLimit, setNewCustomPrizeLimit] = useState<string>('');
  const [newCustomPrizeCategoryId, setNewCustomPrizeCategoryId] = useState<string>('none');
  const [newCustomPrizeStartNumber, setNewCustomPrizeStartNumber] = useState<string>('');
  const [newCustomPrizeEndNumber, setNewCustomPrizeEndNumber] = useState<string>('');

  const gachaUtils = new GachaUtils(currentGacha);
  const totalWeight = gachaUtils.getTotalPrizeWeight();

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
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth maxWidth="sm">
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
        <Button variant="outlined" onClick={() => setIsOpen(false)}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};
