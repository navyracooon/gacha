'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

import { useGachaContext } from '../contexts/Gacha';

type Props = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const CustomDeleteDialog = (props: Props) => {
  const { isOpen, setIsOpen } = props;

  const { gachaList, currentGachaId, retrieveGacha, updateGacha } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const [newCustomDeletePrizeName, setNewCustomDeletePrizeName] = useState<string>('');
  const [newCustomDeletePrizeStartNumber, setNewCustomDeletePrizeStartNumber] =
    useState<string>('');
  const [newCustomDeletePrizeEndNumber, setNewCustomDeletePrizeEndNumber] = useState<string>('');

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
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth maxWidth="sm">
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
        <Button variant="outlined" onClick={() => setIsOpen(false)}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};
