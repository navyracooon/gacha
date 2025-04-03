import { SwapVert, ArrowDownward } from '@mui/icons-material';

export const CustomSortIcon = (props: { active?: boolean; direction?: 'asc' | 'desc' }) => {
  const { active, direction } = props;
  let style = {};
  if (active) {
    style = { transform: direction === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)' };
    return <ArrowDownward fontSize="small" style={style} />;
  } else {
    style = { opacity: 0.5 };
    return <SwapVert fontSize="small" style={style} />;
  }
};

