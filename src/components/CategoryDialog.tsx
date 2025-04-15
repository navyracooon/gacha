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
import { v4 as uuidv4 } from 'uuid';

import { useGachaContext } from '../contexts/Gacha';
import { Category } from '../types/category';

type Props = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const CategoryDialog = (props: Props) => {
  const { isOpen, setIsOpen } = props;

  const {
    gachaList,
    currentGachaId,
    retrieveGacha,
    createItemInField,
    updateItemInField,
    deleteItemInField,
  } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const [newCategoryName, setNewCategoryName] = useState<string>('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory: Category = { id: uuidv4(), name: newCategoryName.trim() };
    createItemInField(currentGachaId, 'categories', newCategory);
    setNewCategoryName('');
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth maxWidth="sm">
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
        <Button onClick={() => setIsOpen(false)}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};
