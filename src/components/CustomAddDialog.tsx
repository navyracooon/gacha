'use client';

import { useForm, Controller } from 'react-hook-form';
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

type FormData = {
  prizeName: string;
  prizeWeight: string;
  prizeLimit: string;
  prizeCategoryId: string;
  startNumber: string;
  endNumber: string;
};

export const CustomAddDialog = (props: Props) => {
  const { isOpen, setIsOpen } = props;
  const { gachaList, currentGachaId, retrieveGacha, updateGacha } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];
  const gachaUtils = new GachaUtils(currentGacha);
  const totalWeight = gachaUtils.getTotalPrizeWeight();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      prizeName: '',
      prizeWeight: '',
      prizeLimit: '',
      prizeCategoryId: 'none',
      startNumber: '',
      endNumber: '',
    },
  });

  const watchPrizeWeight = watch('prizeWeight');
  const watchStartNumber = watch('startNumber');
  const watchEndNumber = watch('endNumber');

  let computedPrizeRelWeight = '';
  const parsedWeight = parseFloat(watchPrizeWeight);
  const parsedStartNumber = parseInt(watchStartNumber);
  const parsedEndNumber = parseInt(watchEndNumber);
  if (!isNaN(parsedWeight) && !isNaN(parsedStartNumber) && !isNaN(parsedEndNumber)) {
    const newTotalWeight = totalWeight + parsedWeight * (parsedEndNumber - parsedStartNumber + 1);
    const relWeight = newTotalWeight > 0 ? (parsedWeight / newTotalWeight) * 100 : 0;
    computedPrizeRelWeight = FormatUtils.toFixedWithoutZeros(relWeight, 4);
  }

  const onSubmit = (data: FormData) => {
    const parsedWeight = parseFloat(data.prizeWeight);
    const parsedLimit = !isNaN(parseInt(data.prizeLimit)) ? parseInt(data.prizeLimit) : undefined;
    const parsedStartNumber = parseInt(data.startNumber);
    const parsedEndNumber = parseInt(data.endNumber);
    if (parsedStartNumber > parsedEndNumber) {
      return;
    }
    const additionalPrizes: Prize[] = Array.from(
      { length: parsedEndNumber - parsedStartNumber + 1 },
      (_, i) => ({
        id: uuidv4(),
        name: `${data.prizeName}${parsedStartNumber + i}`,
        weight: parsedWeight,
        limit: parsedLimit,
        categoryId: data.prizeCategoryId,
      }),
    );
    updateGacha({
      ...currentGacha,
      prizes: [...currentGacha.prizes, ...additionalPrizes],
    });
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
      <DialogTitle>カスタム追加</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="景品名" fullWidth {...register('prizeName')} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="絶対確率 (%)"
                fullWidth
                {...register('prizeWeight', {
                  required: '絶対確率は必須です',
                  validate: value => !isNaN(parseFloat(value)) || '数値を入力してください',
                })}
                error={!!errors.prizeWeight}
                helperText={errors.prizeWeight?.message}
              />
              <TextField
                label="相対確率 (%)"
                fullWidth
                value={computedPrizeRelWeight}
                slotProps={{ input: { readOnly: true } }}
              />
            </Box>
            <TextField
              label="上限"
              fullWidth
              {...register('prizeLimit', {
                validate: value =>
                  value === '' || !isNaN(parseInt(value)) || '数値を入力してください',
              })}
              error={!!errors.prizeLimit}
              helperText={errors.prizeLimit?.message}
            />
            <Controller
              name="prizeCategoryId"
              control={control}
              rules={{ required: 'カテゴリは必須です' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.prizeCategoryId}>
                  <InputLabel id="prize-category-label">カテゴリ</InputLabel>
                  <Select labelId="prize-category-label" label="カテゴリ" {...field}>
                    {currentGacha.categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
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
                    if (isNaN(parsedValue)) {
                      return '数値を入力してください';
                    }
                    const parsedStart = parseInt(watchStartNumber);
                    if (!isNaN(parsedStart) && parsedStart > parsedValue) {
                      return '終了番号は開始番号以上でなければなりません';
                    }
                    if (parsedValue - parsedStart + 1 > 1000) {
                      return '一度に作成できるのは1000件までです';
                    }
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
          <Button variant="contained" type="submit">
            追加
          </Button>
          <Button
            variant="outlined"
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
