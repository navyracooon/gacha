'use client';

import { useForm } from 'react-hook-form';
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

type FormData = {
  newCategoryName: string;
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { newCategoryName: '' },
  });

  const onSubmit = (data: FormData) => {
    const trimmed = data.newCategoryName.trim();
    if (trimmed) {
      const newCategory: Category = { id: uuidv4(), name: trimmed };
      createItemInField(currentGachaId, 'categories', newCategory);
    }
    reset();
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
                slotProps={{ input: { readOnly: category.id === 'none' } }}
                fullWidth
              />
              <Button
                variant="outlined"
                color="error"
                onClick={() => deleteItemInField(currentGachaId, 'categories', category.id)}
                sx={{ visibility: category.id === 'none' ? 'hidden' : 'visible' }}
              >
                削除
              </Button>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="新規カテゴリ名"
              fullWidth
              {...register('newCategoryName', { required: 'カテゴリ名を入力してください' })}
              error={!!errors.newCategoryName}
              helperText={errors.newCategoryName?.message}
            />
            <Button variant="contained" type="submit" sx={{ mt: 1 }}>
              追加
            </Button>
          </form>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};
