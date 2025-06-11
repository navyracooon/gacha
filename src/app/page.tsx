'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Confetti from 'react-dom-confetti';
import { Campaign } from '@mui/icons-material';

import { GachaView } from '../components/Gacha';
import { ResultsView } from '../components/Results';
import { useGachaContext } from '../contexts/Gacha';

const Page = () => {
  const {
    gachaList,
    currentGachaId,
    setCurrentGachaId,
    createGacha,
    retrieveGacha,
    updateGacha,
    deleteGacha,
  } = useGachaContext();
  const [newGachaName, setNewGachaName] = useState<string>('');
  const [addGachaModalOpen, setAddGachaModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'gacha' | 'results'>('gacha');
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  const handleAddGacha = () => {
    const newGacha = createGacha(newGachaName);
    setCurrentGachaId(newGacha.id);
    setNewGachaName('');
  };

  const handleDeleteGacha = () => {
    if (gachaList.length === 1) {
      setCurrentGachaId('');
    } else if (gachaList.length > 1) {
      if (gachaList.at(-1)!.id === currentGachaId) {
        setCurrentGachaId(gachaList.at(-2)!.id);
      } else {
        setCurrentGachaId(gachaList.at(-1)!.id);
      }
    }

    deleteGacha(currentGachaId);
  };

  const handleAddGachaModal = () => {
    handleAddGacha();
    setAddGachaModalOpen(false);
  };

  const handleConfettiButton = () => {
    setIsConfettiActive(true);
    setTimeout(() => setIsConfettiActive(false), 3000);
  };

  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  if (gachaList.length === 0) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 2 }}>
          <Typography variant="h4">ガチャシミュレーター</Typography>
        </Box>
        <Box sx={{ my: 2 }}>
          <Typography variant="body1">
            ガチャが存在しません。新しいガチャを追加してください。
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: '60%' }}>
              <TextField
                label="ガチャの種類名"
                value={newGachaName}
                onChange={e => setNewGachaName(e.target.value)}
                fullWidth
              />
            </Box>
            <Box sx={{ width: '30%' }}>
              <Button variant="contained" onClick={handleAddGacha} fullWidth>
                追加
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4">ガチャシミュレーター</Typography>
        <IconButton onClick={handleConfettiButton}>
          <Campaign color="warning" />
        </IconButton>
        <Confetti
          active={isConfettiActive}
          config={{
            angle: 0,
            spread: 360,
            startVelocity: 70,
            elementCount: 300,
            dragFriction: 0.12,
            duration: 3000,
            stagger: 3,
            width: '10px',
            height: '10px',
            colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
          }}
        />
      </Box>
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>ガチャの種類選択</InputLabel>
          <Select
            value={currentGachaId}
            label="ガチャの種類選択"
            onChange={e => setCurrentGachaId(e.target.value)}
          >
            {gachaList.map(gacha => (
              <MenuItem key={gacha.id} value={gacha.id}>
                {gacha.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }}>
          <TextField
            label="ガチャの種類名編集"
            value={currentGacha.name}
            onChange={e => updateGacha({ ...currentGacha, name: e.target.value })}
            fullWidth
          />
        </Box>
        <Button variant="contained" onClick={() => setAddGachaModalOpen(true)}>
          追加
        </Button>
        <Button variant="contained" color="error" onClick={handleDeleteGacha}>
          削除
        </Button>
      </Box>
      <Dialog
        open={addGachaModalOpen}
        onClose={() => setAddGachaModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>新しいガチャの種類の追加</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 2 }}
            label="ガチャの種類名"
            value={newGachaName}
            onChange={e => setNewGachaName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddGachaModal}>追加</Button>
          <Button onClick={() => setAddGachaModalOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Button
          variant={viewMode === 'gacha' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('gacha')}
        >
          ガチャ
        </Button>
        <Button
          variant={viewMode === 'results' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('results')}
        >
          全体結果
        </Button>
      </Box>
      {viewMode === 'gacha' ? <GachaView /> : <ResultsView />}
    </Container>
  );
};

export default Page;
