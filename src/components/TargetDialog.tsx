'use client';

import { useState } from 'react';
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
import { Target } from '../types/target';

type Props = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

type FormData = {
  newTargetName: string;
};

export const TargetDialog = (props: Props) => {
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

  const [currentTargetId, setCurrentTargetId] = useState<string>(currentGacha.targets[0]?.id || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { newTargetName: '' } });

  const onSubmit = (data: FormData) => {
    const trimmed = data.newTargetName.trim();
    if (trimmed) {
      const newTarget: Target = { id: uuidv4(), name: trimmed };
      createItemInField(currentGachaId, 'targets', newTarget);
      setCurrentTargetId(newTarget.id);
    }
    reset();
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
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={handleTargetModalClose} fullWidth maxWidth="sm">
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="新規対象者名"
              fullWidth
              {...register('newTargetName', { required: '新規対象者名を入力してください' })}
              error={!!errors.newTargetName}
              helperText={errors.newTargetName?.message}
            />
            <Button variant="contained" type="submit" sx={{ mt: 1 }}>
              追加
            </Button>
          </form>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleTargetModalClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};
