'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

import { GachaView } from "../components/Gacha";
import { ResultsView } from "../components/Results";
import { Gacha } from "../types/gacha";
import { Target } from "../types/target";


const Page = () => {
  const [gachaTypes, setGachaTypes] = useState<Gacha[]>([]);
  const [selectedGachaTypeId, setSelectedGachaTypeId] = useState<string>('');
  const [newGachaTypeAddName, setNewGachaTypeAddName] = useState<string>('');
  const [newGachaTypeModalOpen, setNewGachaTypeModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'gacha' | 'results'>('gacha');

  const [targets, setTargets] = useState<Target[]>([{ id: 'none', name: 'なし' }]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('none');
  const [targetModalOpen, setTargetModalOpen] = useState<boolean>(false);
  const [newTargetName, setNewTargetName] = useState<string>('');

  useEffect(() => {
    const storedTypes = localStorage.getItem('gacha_types');
    const storedSelectedId = localStorage.getItem('selectedGachaTypeId');
    if (storedTypes) {
      const parsed: Gacha[] = JSON.parse(storedTypes);
      setGachaTypes(parsed);
      if (storedSelectedId && parsed.find(gt => gt.id === storedSelectedId)) {
        setSelectedGachaTypeId(storedSelectedId);
      } else if (parsed.length > 0) {
        setSelectedGachaTypeId(parsed[0].id);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gacha_types', JSON.stringify(gachaTypes));
  }, [gachaTypes]);

  useEffect(() => {
    localStorage.setItem('selectedGachaTypeId', selectedGachaTypeId);
  }, [selectedGachaTypeId]);

  useEffect(() => {
    const storedTargets = localStorage.getItem('targets');
    if (storedTargets) {
      setTargets(JSON.parse(storedTargets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('targets', JSON.stringify(targets));
  }, [targets]);

  const updateGachaType = (updated: Gacha) => {
    setGachaTypes(gachaTypes.map(gt => (gt.id === updated.id ? updated : gt)));
  };

  const deleteGachaType = () => {
    const updated = gachaTypes.filter(gt => gt.id !== selectedGachaTypeId);
    setGachaTypes(updated);
    if (updated.length > 0) {
      setSelectedGachaTypeId(updated[0].id);
    } else {
      setSelectedGachaTypeId('');
    }
  };

  const addGachaType = () => {
    const name = newGachaTypeAddName.trim() || 'ガチャの種類' + (gachaTypes.length + 1);
    const newType: Gacha = { id: uuidv4(), name, prizes: [], operationHistory: [] };
    setGachaTypes([...gachaTypes, newType]);
    setSelectedGachaTypeId(newType.id);
    setNewGachaTypeAddName('');
  };

  const handleAddGachaTypeModal = () => {
    const name = newGachaTypeAddName.trim() || 'ガチャの種類' + (gachaTypes.length + 1);
    const newType: Gacha = { id: uuidv4(), name, prizes: [], operationHistory: [] };
    setGachaTypes([...gachaTypes, newType]);
    setSelectedGachaTypeId(newType.id);
    setNewGachaTypeAddName('');
    setNewGachaTypeModalOpen(false);
  };

  const selectedGachaType =
    gachaTypes.find(gt => gt.id === selectedGachaTypeId) || { id: '', name: '', prizes: [], operationHistory: [] };

  if (gachaTypes.length === 0) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 2 }}>
          <Typography variant="h4">ガチャシミュレーター</Typography>
        </Box>
        <Box sx={{ my: 2 }}>
          <Typography variant="body1">
            ガチャが存在しません。新しいガチャを追加してください。
          </Typography>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="ガチャの種類名"
                value={newGachaTypeAddName}
                onChange={(e) => setNewGachaTypeAddName(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="contained" onClick={addGachaType} fullWidth>
                追加
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 2 }}>
        <Typography variant="h4">ガチャシミュレーター</Typography>
      </Box>
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>ガチャの種類選択</InputLabel>
          <Select
            value={selectedGachaTypeId}
            label="ガチャの種類選択"
            onChange={(e) => setSelectedGachaTypeId(e.target.value)}
          >
            {gachaTypes.map(gt => (
              <MenuItem key={gt.id} value={gt.id}>
                {gt.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }}>
          <TextField
            label="ガチャの種類名編集"
            value={selectedGachaType.name}
            onChange={(e) => updateGachaType({ ...selectedGachaType, name: e.target.value })}
            fullWidth
          />
        </Box>
        <Button variant="contained" onClick={() => setNewGachaTypeModalOpen(true)}>
          追加
        </Button>
        <Button variant="contained" color="error" onClick={deleteGachaType}>
          削除
        </Button>
      </Box>
      <Dialog open={newGachaTypeModalOpen} onClose={() => setNewGachaTypeModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>新しいガチャの種類の追加</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 2 }}
            label="ガチャの種類名"
            value={newGachaTypeAddName}
            onChange={(e) => setNewGachaTypeAddName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddGachaTypeModal}>追加</Button>
          <Button onClick={() => setNewGachaTypeModalOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Button variant={viewMode === 'gacha' ? 'contained' : 'outlined'} onClick={() => setViewMode('gacha')}>
          ガチャ
        </Button>
        <Button variant={viewMode === 'results' ? 'contained' : 'outlined'} onClick={() => setViewMode('results')}>
          全体結果
        </Button>
      </Box>
      {viewMode === 'gacha' ? (
        <GachaView
          gacha={selectedGachaType}
          updateGachaType={updateGachaType}
          targets={targets}
          setTargets={setTargets}
          selectedTargetId={selectedTargetId}
          setSelectedTargetId={setSelectedTargetId}
          targetModalOpen={targetModalOpen}
          setTargetModalOpen={setTargetModalOpen}
          newTargetName={newTargetName}
          setNewTargetName={setNewTargetName}
        />
      ) : (
        <ResultsView gacha={selectedGachaType} targets={targets} />
      )}
    </Container>
  );
};

export default Page;
