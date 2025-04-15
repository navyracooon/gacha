'use client';

import React, { useState, useMemo, forwardRef } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  TableContainerProps,
} from '@mui/material';
import { TableVirtuoso } from 'react-virtuoso';
import { CustomSortIcon } from './CustomSortIcon';
import { useGachaContext } from '../contexts/Gacha';
import { PrizeField } from '../types/prize';
import { FormatUtils } from '../utils/format';
import { GachaUtils } from '../utils/gacha';

const Scroller = forwardRef<HTMLDivElement, TableContainerProps>((props, ref) => (
  <TableContainer component={Paper} ref={ref} {...props} />
));
Scroller.displayName = 'Scroller';

const TableComponent: React.FC<React.ComponentProps<typeof Table>> = props => <Table {...props} />;
TableComponent.displayName = 'TableComponent';

const TableHeadComponent: React.FC<React.ComponentProps<typeof TableHead>> = props => (
  <TableHead {...props} />
);
TableHeadComponent.displayName = 'TableHeadComponent';

const TableRowComponent: React.FC<React.ComponentProps<typeof TableRow>> = props => (
  <TableRow {...props} />
);
TableRowComponent.displayName = 'TableRowComponent';

const TableBodyForwarded = forwardRef<
  HTMLTableSectionElement,
  React.ComponentProps<typeof TableBody>
>((props, ref) => <TableBody {...props} ref={ref} />);
TableBodyForwarded.displayName = 'TableBodyForwarded';

export const PrizeTable = () => {
  const {
    gachaList,
    currentGachaId,
    retrieveGacha,
    retrieveItemInField,
    updateItemInField,
    deleteItemInField,
  } = useGachaContext();
  const currentGacha = retrieveGacha(currentGachaId) || gachaList[0];

  const [orderBy, setOrderBy] = useState<'name' | 'categoryId' | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [isEditing, setIsEditing] = useState(false);

  const gachaUtils = new GachaUtils(currentGacha);
  const totalWeight = gachaUtils.getTotalPrizeWeight();

  const tableHeight = currentGacha.prizes.length > 6 ? 640 : 60 + currentGacha.prizes.length * 89;

  const sortedPrizes = useMemo(() => {
    if (isEditing) return currentGacha.prizes;
    if (!orderBy) return currentGacha.prizes;
    return [...currentGacha.prizes].sort((a, b) => {
      if (orderBy === 'name') {
        return (
          a.name.localeCompare(b.name, 'ja', { sensitivity: 'base', numeric: true }) *
          (order === 'asc' ? 1 : -1)
        );
      }
      if (orderBy === 'categoryId') {
        if (a.categoryId === 'none' && b.categoryId !== 'none') {
          return order === 'asc' ? 1 : -1;
        } else if (b.categoryId === 'none' && a.categoryId !== 'none') {
          return order === 'asc' ? -1 : 1;
        }
        const categoryA =
          retrieveItemInField(currentGachaId, 'categories', a.categoryId)?.name || '';
        const categoryB =
          retrieveItemInField(currentGachaId, 'categories', b.categoryId)?.name || '';
        const categoryComparison =
          categoryA.localeCompare(categoryB, 'ja', { sensitivity: 'base', numeric: true }) *
          (order === 'asc' ? 1 : -1);
        if (categoryComparison !== 0) {
          return categoryComparison;
        }
        return a.name.localeCompare(b.name, 'ja', { sensitivity: 'base', numeric: true });
      }
      return 0;
    });
  }, [currentGacha.prizes, orderBy, order, isEditing, currentGachaId, retrieveItemInField]);

  const handleUpdatePrize = (prizeId: string, key: PrizeField, value: string) => {
    let parsedValue;
    switch (key) {
      case 'name':
        parsedValue = value;
        break;
      case 'weight':
        if (value === '') {
          parsedValue = 0;
          break;
        }
        if (isNaN(parseFloat(value))) return;
        parsedValue = parseFloat(value);
        break;
      case 'limit':
        if (value === '') {
          parsedValue = undefined;
          break;
        }
        if (isNaN(parseInt(value))) return;
        parsedValue = parseInt(value);
        break;
      case 'categoryId':
        parsedValue = value;
        break;
    }
    const prevPrize = retrieveItemInField(currentGachaId, 'prizes', prizeId);
    if (prevPrize) {
      updateItemInField(currentGachaId, 'prizes', { ...prevPrize, [key]: parsedValue });
    }
  };

  const handleRequestSort = (property: 'name' | 'categoryId') => {
    if (orderBy !== property) {
      setOrder('asc');
      setOrderBy(property);
    } else if (orderBy === property && order === 'asc') {
      setOrder('desc');
    } else if (orderBy === property && order === 'desc') {
      setOrderBy(null);
      setOrder('asc');
    }
  };

  const VirtuosoTableComponents = {
    Scroller,
    Table: TableComponent,
    TableHead: TableHeadComponent,
    TableRow: TableRowComponent,
    TableBody: TableBodyForwarded,
  };

  return (
    <TableVirtuoso
      style={{ height: tableHeight }}
      data={sortedPrizes}
      components={VirtuosoTableComponents}
      fixedHeaderContent={() => (
        <TableRow
          sx={{
            height: 60,
            position: 'sticky',
            top: 0,
            zIndex: 2,
            backgroundColor: '#fff',
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
          }}
        >
          <TableCell sx={{ width: '25%', backgroundColor: '#fff' }}>
            <TableSortLabel
              active={!isEditing && orderBy === 'name'}
              direction={!isEditing && orderBy === 'name' ? order : 'asc'}
              IconComponent={() => (
                <CustomSortIcon active={!isEditing && orderBy === 'name'} direction={order} />
              )}
              onClick={() => handleRequestSort('name')}
            >
              景品名
            </TableSortLabel>
          </TableCell>
          <TableCell sx={{ width: '16%', backgroundColor: '#fff' }}>絶対確率 (%)</TableCell>
          <TableCell sx={{ width: '14%', backgroundColor: '#fff' }}>相対確率 (%)</TableCell>
          <TableCell sx={{ width: '15%', backgroundColor: '#fff' }}>上限</TableCell>
          <TableCell sx={{ width: '20%', backgroundColor: '#fff' }}>
            <TableSortLabel
              active={!isEditing && orderBy === 'categoryId'}
              direction={!isEditing && orderBy === 'categoryId' ? order : 'asc'}
              IconComponent={() => (
                <CustomSortIcon active={!isEditing && orderBy === 'categoryId'} direction={order} />
              )}
              onClick={() => handleRequestSort('categoryId')}
            >
              カテゴリ
            </TableSortLabel>
          </TableCell>
          <TableCell sx={{ width: '10%', backgroundColor: '#fff' }}>操作</TableCell>
        </TableRow>
      )}
      itemContent={(_, prize) => [
        <TableCell key="name">
          <TextField
            label="景品名"
            value={prize.name}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onChange={e => handleUpdatePrize(prize.id, 'name', e.target.value)}
          />
        </TableCell>,
        <TableCell key="abs-prob">
          <TextField
            label="絶対確率"
            type="number"
            value={prize.weight}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onChange={e => handleUpdatePrize(prize.id, 'weight', e.target.value)}
          />
        </TableCell>,
        <TableCell key="rel-prob">
          {totalWeight > 0
            ? FormatUtils.toFixedWithoutZeros((prize.weight / totalWeight) * 100, 4)
            : '0.00'}
        </TableCell>,
        <TableCell key="limit">
          <TextField
            label="上限"
            type="number"
            value={prize.limit !== undefined ? prize.limit : ''}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onChange={e => handleUpdatePrize(prize.id, 'limit', e.target.value)}
          />
        </TableCell>,
        <TableCell key="category">
          <FormControl fullWidth>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              label="カテゴリ"
              value={prize.categoryId}
              onChange={e => handleUpdatePrize(prize.id, 'categoryId', e.target.value)}
            >
              {currentGacha.categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>,
        <TableCell key="action">
          <Button
            variant="outlined"
            color="error"
            onClick={() => deleteItemInField(currentGachaId, 'prizes', prize.id)}
          >
            削除
          </Button>
        </TableCell>,
      ]}
    />
  );
};
