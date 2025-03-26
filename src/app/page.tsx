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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { v4 as uuidv4 } from 'uuid';

type Prize = {
  id: string;
  name: string;
  abs: number;
  limit?: number;
};

type Operation = {
  id: string;
  count: number;
  results: { [prizeId: string]: number };
  timestamp: number;
  target?: string;
};

type GachaType = {
  id: string;
  name: string;
  prizes: Prize[];
  operationHistory: Operation[];
};

type Target = {
  id: string;
  name: string;
};

const Page = () => {
  const [gachaTypes, setGachaTypes] = useState<GachaType[]>([]);
  const [selectedGachaTypeId, setSelectedGachaTypeId] = useState<string>('');
  const [newGachaTypeAddName, setNewGachaTypeAddName] = useState<string>('');
  const [newGachaTypeModalOpen, setNewGachaTypeModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'individual' | 'overall'>('individual');

  // 対象者管理の状態（個別画面・全体画面で共有）
  const [targets, setTargets] = useState<Target[]>([{ id: 'none', name: 'なし' }]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('none');
  const [targetModalOpen, setTargetModalOpen] = useState<boolean>(false);
  const [newTargetName, setNewTargetName] = useState<string>('');

  useEffect(() => {
    const storedTypes = localStorage.getItem('gacha_types');
    const storedSelectedId = localStorage.getItem('selectedGachaTypeId');
    if (storedTypes) {
      const parsed: GachaType[] = JSON.parse(storedTypes);
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

  const updateGachaType = (updated: GachaType) => {
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
    const newType: GachaType = { id: uuidv4(), name, prizes: [], operationHistory: [] };
    setGachaTypes([...gachaTypes, newType]);
    setSelectedGachaTypeId(newType.id);
    setNewGachaTypeAddName('');
  };

  const handleAddGachaTypeModal = () => {
    const name = newGachaTypeAddName.trim() || 'ガチャの種類' + (gachaTypes.length + 1);
    const newType: GachaType = { id: uuidv4(), name, prizes: [], operationHistory: [] };
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
            ガチャの種類が存在しません。新しいガチャの種類を追加してください。
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
      {/* タイトル */}
      <Box sx={{ my: 2 }}>
        <Typography variant="h4">ガチャシミュレーター</Typography>
      </Box>
      {/* ガチャの種類管理 */}
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
      {/* 個別／全体の切替ボタン */}
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Button variant={viewMode === 'individual' ? 'contained' : 'outlined'} onClick={() => setViewMode('individual')}>
          個別ガチャ
        </Button>
        <Button variant={viewMode === 'overall' ? 'contained' : 'outlined'} onClick={() => setViewMode('overall')}>
          全体結果
        </Button>
      </Box>
      {viewMode === 'individual' ? (
        <IndividualView
          gachaType={selectedGachaType}
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
        <OverallView gachaType={selectedGachaType} targets={targets} />
      )}
    </Container>
  );
};

interface IndividualViewProps {
  gachaType: GachaType;
  updateGachaType: (gt: GachaType) => void;
  targets: Target[];
  setTargets: React.Dispatch<React.SetStateAction<Target[]>>;
  selectedTargetId: string;
  setSelectedTargetId: React.Dispatch<React.SetStateAction<string>>;
  targetModalOpen: boolean;
  setTargetModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newTargetName: string;
  setNewTargetName: React.Dispatch<React.SetStateAction<string>>;
}

const IndividualView: React.FC<IndividualViewProps> = ({
  gachaType,
  updateGachaType,
  targets,
  setTargets,
  selectedTargetId,
  setSelectedTargetId,
  targetModalOpen,
  setTargetModalOpen,
  newTargetName,
  setNewTargetName
}) => {
  // 全体の操作履歴から各景品の出現数を算出（全対象者で共有）
  const globalCounts: { [prizeId: string]: number } = {};
  gachaType.prizes.forEach(prize => {
    globalCounts[prize.id] = 0;
  });
  gachaType.operationHistory.forEach(op => {
    for (const pid in op.results) {
      globalCounts[pid] = (globalCounts[pid] || 0) + op.results[pid];
    }
  });

  // 選択中対象者の操作履歴のみを集計
  const aggregatedResults = gachaType.prizes.reduce((acc, prize) => {
    acc[prize.id] = 0;
    return acc;
  }, {} as { [prizeId: string]: number });
  gachaType.operationHistory
    .filter(op => op.target === selectedTargetId)
    .forEach(op => {
      for (const pid in op.results) {
        aggregatedResults[pid] = (aggregatedResults[pid] || 0) + op.results[pid];
      }
    });

  const totalAbs = gachaType.prizes.reduce((sum, p) => sum + p.abs, 0);

  const [newPrizeName, setNewPrizeName] = useState<string>('');
  const [newPrizeAbs, setNewPrizeAbs] = useState<string>('');
  const [newPrizeLimit, setNewPrizeLimit] = useState<string>('');
  const [newPrizeRel, setNewPrizeRel] = useState<string>('');
  const [customGachaCount, setCustomGachaCount] = useState<string>('1');

  const addTarget = () => {
    if (!newTargetName.trim()) return;
    const newTarget: Target = { id: uuidv4(), name: newTargetName.trim() };
    const newTargets = [...targets, newTarget];
    setTargets(newTargets);
    setSelectedTargetId(newTargets[0].id);
    setNewTargetName('');
  };

  const updateTarget = (id: string, name: string) => {
    setTargets(targets.map(t => (t.id === id ? { ...t, name } : t)));
  };

  const deleteTarget = (id: string) => {
    const newTargets = targets.filter(t => t.id !== id);
    setTargets(newTargets);
    if (newTargets.length > 0) {
      setSelectedTargetId(newTargets[0].id);
    } else {
      setSelectedTargetId('');
    }
  };

  const handleCloseTargetModal = () => {
    if (targets.length === 0) {
      setTargets([{ id: 'none', name: 'なし' }]);
      setSelectedTargetId('none');
    }
    setTargetModalOpen(false);
  };

  const handleNewPrizeAbsChange = (value: string) => {
    setNewPrizeAbs(value);
    const absVal = parseFloat(value);
    if (!isNaN(absVal)) {
      const rel = totalAbs + absVal > 0 ? (absVal / (totalAbs + absVal)) * 100 : 0;
      setNewPrizeRel(rel.toFixed(2));
    } else {
      setNewPrizeRel('');
    }
  };

  const addPrize = () => {
    if (!newPrizeName || !newPrizeAbs) return;
    const absVal = parseFloat(newPrizeAbs);
    if (isNaN(absVal)) return;
    let limitVal: number | undefined = undefined;
    if (newPrizeLimit.trim() !== '') {
      limitVal = parseInt(newPrizeLimit);
      if (isNaN(limitVal)) limitVal = undefined;
    }
    const newPrize: Prize = { id: uuidv4(), name: newPrizeName, abs: absVal, limit: limitVal };
    updateGachaType({ ...gachaType, prizes: [...gachaType.prizes, newPrize] });
    setNewPrizeName('');
    setNewPrizeAbs('');
    setNewPrizeLimit('');
    setNewPrizeRel('');
  };

  const updatePrize = (pid: string, newAbs: number) => {
    const updatedPrizes = gachaType.prizes.map(prize =>
      prize.id === pid ? { ...prize, abs: newAbs } : prize
    );
    updateGachaType({ ...gachaType, prizes: updatedPrizes });
  };

  const deletePrize = (pid: string) => {
    const updatedPrizes = gachaType.prizes.filter(prize => prize.id !== pid);
    updateGachaType({ ...gachaType, prizes: updatedPrizes });
  };

  const runGachaHandler = (count: number) => {
    const currentCounts: { [pid: string]: number } = {};
    gachaType.prizes.forEach(prize => {
      currentCounts[prize.id] = globalCounts[prize.id] || 0;
    });
    const results: { [pid: string]: number } = {};
    for (let i = 0; i < count; i++) {
      const candidates = gachaType.prizes.filter(prize => {
        if (prize.limit !== undefined) {
          return currentCounts[prize.id] < prize.limit;
        }
        return true;
      });
      if (candidates.length === 0) break;
      const totalWeight = candidates.reduce((sum, prize) => sum + prize.abs, 0);
      const rand = Math.random() * totalWeight;
      let cumulative = 0;
      let drawn: Prize | null = null;
      for (const prize of candidates) {
        cumulative += prize.abs;
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
    const newOp = {
      id: uuidv4(),
      count,
      results,
      timestamp: Date.now(),
      target: selectedTargetId
    };
    updateGachaType({ ...gachaType, operationHistory: [newOp, ...gachaType.operationHistory] });
  };

  const undoOperation = (opId: string) => {
    const updatedOps = gachaType.operationHistory.filter(op => op.id !== opId);
    updateGachaType({ ...gachaType, operationHistory: updatedOps });
  };

  return (
    <Box>
      {/* 景品追加フォーム */}
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">新しい景品の追加</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField label="景品名" value={newPrizeName} onChange={(e) => setNewPrizeName(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="絶対確率 (%)" value={newPrizeAbs} onChange={(e) => handleNewPrizeAbsChange(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="相対確率 (%)" value={newPrizeRel} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="上限" value={newPrizeLimit} onChange={(e) => setNewPrizeLimit(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={addPrize} fullWidth>
              追加
            </Button>
          </Grid>
        </Grid>
      </Box>
      {/* 景品設定テーブル */}
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">景品設定</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>景品名</TableCell>
                <TableCell>絶対確率 (%)</TableCell>
                <TableCell>相対確率 (%)</TableCell>
                <TableCell>上限</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gachaType.prizes.map(prize => (
                <TableRow key={prize.id}>
                  <TableCell>{prize.name}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={prize.abs}
                      onChange={(e) => updatePrize(prize.id, parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    {totalAbs > 0
                      ? ((prize.abs / totalAbs) * 100).toFixed(2)
                      : '0.00'}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={prize.limit !== undefined ? prize.limit : ''}
                      onChange={(e) => {
                        const newLimit = e.target.value === '' ? undefined : parseInt(e.target.value);
                        const updatedPrizes = gachaType.prizes.map(p =>
                          p.id === prize.id ? { ...p, limit: newLimit } : p
                        );
                        updateGachaType({ ...gachaType, prizes: updatedPrizes });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" color="error" onClick={() => deletePrize(prize.id)}>
                      削除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* ガチャ実行 */}
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">ガチャを回す</Typography>
        <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>対象者</InputLabel>
            <Select
              value={selectedTargetId}
              label="対象者"
              onChange={(e) => setSelectedTargetId(e.target.value)}
            >
              {targets.map(t => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => setTargetModalOpen(true)}>
            対象者管理
          </Button>
        </Box>
        <Dialog open={targetModalOpen} onClose={handleCloseTargetModal} fullWidth maxWidth="sm">
          <DialogTitle>対象者管理</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 3 }}>
              {targets.map(t => (
                <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TextField
                    label="対象者名"
                    value={t.name}
                    onChange={(e) => updateTarget(t.id, e.target.value)}
                    fullWidth
                  />
                  <Button variant="outlined" color="error" onClick={() => deleteTarget(t.id)}>
                    削除
                  </Button>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 3 }}>
              <TextField
                label="新規対象者名"
                value={newTargetName}
                onChange={(e) => setNewTargetName(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={addTarget} sx={{ mt: 1 }}>
                追加
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTargetModal}>閉じる</Button>
          </DialogActions>
        </Dialog>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TextField
              label="回数指定"
              type="number"
              value={customGachaCount}
              onChange={(e) => setCustomGachaCount(e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim() === '') {
                  setCustomGachaCount('1');
                }
              }}
            />
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => runGachaHandler(parseInt(customGachaCount))}>
              実行
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => runGachaHandler(1)}>
              1回
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => runGachaHandler(5)}>
              5回
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => runGachaHandler(10)}>
              10回
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => runGachaHandler(100)}>
              100回
            </Button>
          </Grid>
        </Grid>
      </Box>
      {/* 個別結果：集計結果 */}
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">
          集計結果（対象者：{targets.find(t => t.id === selectedTargetId)?.name || 'なし'}）
        </Typography>
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
              {gachaType.prizes.map(prize => (
                <TableRow key={prize.id}>
                  <TableCell>{prize.name}</TableCell>
                  <TableCell>{prize.abs}</TableCell>
                  <TableCell>
                    {totalAbs > 0 ? ((prize.abs / totalAbs) * 100).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell>{aggregatedResults[prize.id] || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* 操作履歴（個別対象者共通） */}
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">操作履歴</Typography>
        {gachaType.operationHistory.map(op => (
          <Box key={op.id} sx={{ border: '1px solid #ccc', p: 1, mb: 1 }}>
            <Typography>
              実行日時: {new Date(op.timestamp).toLocaleString()} - {op.count}回実行 - 対象者:{" "}
              {(() => {
                const t = targets.find(t => t.id === op.target);
                return t ? t.name : 'なし';
              })()}
            </Typography>
            {Object.keys(op.results).map(prizeId => {
              const prize = gachaType.prizes.find(p => p.id === prizeId);
              return prize ? (
                <Typography key={prizeId}>
                  {prize.name}: {op.results[prizeId]}回
                </Typography>
              ) : null;
            })}
            <Button variant="outlined" color="error" onClick={() => undoOperation(op.id)}>
              取り消し
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface OverallViewProps {
  gachaType: GachaType;
  targets: Target[];
}

const OverallView: React.FC<OverallViewProps> = ({ gachaType, targets }) => {
  // 全体の集計結果を算出
  const overallAgg: { [prizeId: string]: number } = {};
  gachaType.prizes.forEach(prize => {
    overallAgg[prize.id] = 0;
  });
  gachaType.operationHistory.forEach(op => {
    for (const pid in op.results) {
      overallAgg[pid] = (overallAgg[pid] || 0) + op.results[pid];
    }
  });
  const totalAbs = gachaType.prizes.reduce((sum, p) => sum + p.abs, 0);

  // 全体の操作履歴（降順）
  const overallOps = [...gachaType.operationHistory].sort((a, b) => b.timestamp - a.timestamp);

  // 各対象者ごとの操作履歴をグループ化
  const opsByTarget: { [key: string]: Operation[] } = {};
  targets.forEach(target => {
    opsByTarget[target.id] = [];
  });
  gachaType.operationHistory.forEach(op => {
    const key = op.target || 'none';
    if (!opsByTarget[key]) {
      opsByTarget[key] = [];
    }
    opsByTarget[key].push(op);
  });

  return (
    <Box>
      <Typography variant="h5">全体の結果</Typography>
      {/* 全体の集計結果 */}
      <Typography variant="subtitle1">全体の集計結果</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
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
            {gachaType.prizes.map(prize => (
              <TableRow key={prize.id}>
                <TableCell>{prize.name}</TableCell>
                <TableCell>{prize.abs}</TableCell>
                <TableCell>
                  {totalAbs > 0 ? ((prize.abs / totalAbs) * 100).toFixed(2) : '0.00'}
                </TableCell>
                <TableCell>{overallAgg[prize.id] || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 全体の操作履歴（Accordion、デフォルト閉） */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">全体の操作履歴</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {overallOps.map(op => (
            <Box key={op.id} sx={{ border: '1px solid #ccc', p: 1, mb: 1 }}>
              <Typography>
                実行日時: {new Date(op.timestamp).toLocaleString()} - {op.count}回実行 - 対象者:{" "}
                {(() => {
                  const t = targets.find(t => t.id === op.target);
                  return t ? t.name : 'なし';
                })()}
              </Typography>
              {Object.keys(op.results).map(prizeId => {
                const prize = gachaType.prizes.find(p => p.id === prizeId);
                return prize ? (
                  <Typography key={prizeId}>
                    {prize.name}: {op.results[prizeId]}回
                  </Typography>
                ) : null;
              })}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* 各対象者ごとの結果 */}
      <Typography variant="h5" sx={{ mt: 2 }}>各対象者の結果</Typography>
      {targets.map(target => {
        const agg: { [prizeId: string]: number } = {};
        gachaType.prizes.forEach(prize => {
          agg[prize.id] = 0;
        });
        const targetOps = (opsByTarget[target.id] || []).sort((a, b) => b.timestamp - a.timestamp);
        targetOps.forEach(op => {
          for (const pid in op.results) {
            agg[pid] = (agg[pid] || 0) + op.results[pid];
          }
        });
        return (
          <Accordion key={target.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{target.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1">集計結果</Typography>
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
                    {gachaType.prizes.map(prize => (
                      <TableRow key={prize.id}>
                        <TableCell>{prize.name}</TableCell>
                        <TableCell>{prize.abs}</TableCell>
                        <TableCell>
                          {totalAbs > 0 ? ((prize.abs / totalAbs) * 100).toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell>{agg[prize.id] || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* 各対象者ごとの操作履歴を折りたたむ */}
              <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">操作履歴</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {targetOps.map(op => (
                    <Box key={op.id} sx={{ border: '1px solid #ccc', p: 1, mb: 1 }}>
                      <Typography>
                        実行日時: {new Date(op.timestamp).toLocaleString()} - {op.count}回実行 - 対象者:{" "}
                        {(() => {
                          const t = targets.find(t => t.id === op.target);
                          return t ? t.name : 'なし';
                        })()}
                      </Typography>
                      {Object.keys(op.results).map(prizeId => {
                        const prize = gachaType.prizes.find(p => p.id === prizeId);
                        return prize ? (
                          <Typography key={prizeId}>
                            {prize.name}: {op.results[prizeId]}回
                          </Typography>
                        ) : null;
                      })}
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default Page;
