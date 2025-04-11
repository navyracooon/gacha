'use client';

import { PropsWithChildren, createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Gacha, GachaListFields } from '../types/gacha';

type GachaContextType = {
  gachaList: Gacha[];
  currentGachaId: string;
  setCurrentGachaId: (id: string) => void;
  createGacha: (name?: string) => Gacha;
  retrieveGacha: (id: string) => Gacha | undefined;
  updateGacha: (updated: Gacha) => void;
  deleteGacha: (id: string) => void;
  createItemInField: <K extends GachaListFields>(
    gachaId: string,
    field: K,
    item: Gacha[K][number],
  ) => void;
  retrieveItemInField: <K extends GachaListFields>(
    gachaId: string,
    field: K,
    itemId: string,
  ) => Gacha[K][number] | undefined;
  updateItemInField: <K extends GachaListFields>(
    gachaId: string,
    field: K,
    item: Gacha[K][number],
  ) => void;
  deleteItemInField: <K extends GachaListFields>(gachaId: string, field: K, itemId: string) => void;
};

const GachaContext = createContext<GachaContextType | undefined>(undefined);

export const GachaProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [gachaList, setGachaList] = useState<Gacha[]>([]);
  const [currentGachaId, setCurrentGachaId] = useState<string>('');

  useEffect(() => {
    const storedGachaList = localStorage.getItem('gacha_list');
    const storedCurrentGachaId = localStorage.getItem('current_gacha_id');
    if (storedGachaList) {
      const parsedGachaList: Gacha[] = JSON.parse(storedGachaList);
      setGachaList(parsedGachaList);
      if (
        storedCurrentGachaId &&
        parsedGachaList.find(gacha => gacha.id === storedCurrentGachaId)
      ) {
        setCurrentGachaId(storedCurrentGachaId);
      } else if (parsedGachaList.length > 0) {
        setCurrentGachaId(parsedGachaList[0].id);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gacha_list', JSON.stringify(gachaList));
  }, [gachaList]);

  useEffect(() => {
    localStorage.setItem('current_gacha_id', currentGachaId);
  }, [currentGachaId]);

  const createGacha = (name?: string): Gacha => {
    const formattedName = name?.trim() || `ガチャの種類 ${gachaList.length + 1}`;
    const newGacha: Gacha = {
      id: uuidv4(),
      name: formattedName,
      targets: [{ id: uuidv4(), name: 'なし' }],
      categories: [{ id: 'none', name: 'なし' }],
      prizes: [],
      operationHistory: [],
    };
    setGachaList(prev => [...prev, newGacha]);
    return newGacha;
  };

  const retrieveGacha = (id: string) => {
    return gachaList.find(gacha => gacha.id === id);
  };

  const updateGacha = (updated: Gacha) => {
    setGachaList(prev => prev.map(gacha => (gacha.id === updated.id ? updated : gacha)));
  };

  const deleteGacha = (id: string) => {
    setGachaList(prev => prev.filter(gacha => gacha.id !== id));
  };

  const createItemInField = <K extends GachaListFields>(
    gachaId: string,
    field: K,
    item: Gacha[K][number],
  ) => {
    const gacha = retrieveGacha(gachaId);
    if (!gacha) return;

    const updated: Gacha = {
      ...gacha,
      [field]: [...gacha[field], item],
    };
    updateGacha(updated);
  };

  const retrieveItemInField = <K extends GachaListFields>(
    gachaId: string,
    field: K,
    itemId: string,
  ): Gacha[K][number] | undefined => {
    const gacha = retrieveGacha(gachaId);
    if (!gacha) return undefined;

    return gacha[field].find(item => item.id === itemId);
  };

  const updateItemInField = <K extends GachaListFields>(
    gachaId: string,
    field: K,
    item: Gacha[K][number],
  ) => {
    const gacha = retrieveGacha(gachaId);
    if (!gacha) return;

    const updated: Gacha = {
      ...gacha,
      [field]: gacha[field].map(existing => (existing.id === item.id ? item : existing)),
    };
    updateGacha(updated);
  };

  const deleteItemInField = <K extends GachaListFields>(
    gachaId: string,
    field: K,
    itemId: string,
  ) => {
    const gacha = retrieveGacha(gachaId);
    if (!gacha) return;

    const updated: Gacha = {
      ...gacha,
      [field]: gacha[field].filter(item => item.id !== itemId),
    };
    updateGacha(updated);
  };

  return (
    <GachaContext.Provider
      value={{
        gachaList,
        currentGachaId,
        setCurrentGachaId,
        createGacha,
        retrieveGacha,
        updateGacha,
        deleteGacha,
        createItemInField,
        retrieveItemInField,
        updateItemInField,
        deleteItemInField,
      }}
    >
      {children}
    </GachaContext.Provider>
  );
};

export const useGachaContext = () => {
  const context = useContext(GachaContext);
  if (!context) {
    throw new Error('useGacha must be used within a GachaProvider');
  }
  return context;
};
