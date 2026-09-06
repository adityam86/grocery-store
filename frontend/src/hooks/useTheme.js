import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme, selectTheme } from '../redux/slices/themeSlice';
import { THEMES } from '../constants/themes';

export const useTheme = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(selectTheme);
  const themeObj = THEMES[currentTheme] || THEMES.saffron;

  useEffect(() => {
    const body = document.body;
    if (currentTheme === 'midnight') {
      body.classList.add('bg-neutral-950', 'text-neutral-100');
      body.classList.remove('bg-neutral-50', 'text-neutral-800');
    } else {
      body.classList.remove('bg-neutral-950', 'text-neutral-100');
      body.classList.add('bg-neutral-50', 'text-neutral-800');
    }
  }, [currentTheme]);

  return {
    currentTheme,
    themeObj,
    setTheme: (theme) => dispatch(setTheme(theme)),
    isDark: currentTheme === 'midnight',
  };
};
