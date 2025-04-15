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

import { useGachaContext } from '../contexts/Gacha';

type Props = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

type FormData = {
  prizeName: string;
  startNumber: string;
  endNumber: string;
};

export const CustomDeleteDialog = (props: Props) => {
  const { isOpen, setIsOpen } = props;
  const { gachaList, currentGachaId, retrieveGacha, updateGacha } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      prizeName: '',
      startNumber: '',
      endNumber: '',
    },
  });

  const onSubmit = (data: FormData) => {
    const parsedStartNumber = parseInt(data.startNumber);
    const parsedEndNumber = parseInt(data.endNumber);
    if (parsedStartNumber > parsedEndNumber) return;
    const targetPrizeNames = Array.from(
      { length: parsedEndNumber - parsedStartNumber + 1 },
      (_, i) => `${data.prizeName}${parsedStartNumber + i}`,
    );
    const newPrizes = currentGacha.prizes.filter(item => !targetPrizeNames.includes(item.name));
    updateGacha({ ...currentGacha, prizes: newPrizes });
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
      <DialogTitle>カスタム削除</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="景品名" fullWidth {...register('prizeName')} />
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <TextField
                label="開始番号"
                fullWidth
                {...register('startNumber', {
                  required: '開始番号は必須です',
                  validate: value => !isNaN(parseInt(value)) || '数値を入力してください',
                })}
                error={!!errors.startNumber}
                helperText={errors.startNumber?.message}
              />
              <TextField
                label="終了番号"
                fullWidth
                {...register('endNumber', {
                  required: '終了番号は必須です',
                  validate: value => {
                    const parsedValue = parseInt(value);
                    if (isNaN(parsedValue)) return '数値を入力してください';
                    const parsedStart = parseInt(watch('startNumber'));
                    if (!isNaN(parsedStart) && parsedStart > parsedValue)
                      return '終了番号は開始番号以上でなければなりません';
                    return true;
                  },
                })}
                error={!!errors.endNumber}
                helperText={errors.endNumber?.message}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" type="submit">
            削除
          </Button>
          <Button
            variant="text"
            onClick={() => {
              reset();
              setIsOpen(false);
            }}
          >
            閉じる
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
