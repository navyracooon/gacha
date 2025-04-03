import { PropsWithChildren } from 'react';

import { GachaProvider } from './Gacha';

export const RootProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <GachaProvider>
      {children}
    </GachaProvider>
  );
};
