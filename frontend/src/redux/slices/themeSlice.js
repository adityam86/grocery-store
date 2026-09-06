import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../utils/localStorage';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    current: storage.getTheme(),
  },
  reducers: {
    setTheme(state, action) {
      state.current = action.payload;
      storage.setTheme(action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export const selectTheme = (state) => state.theme.current;
export default themeSlice.reducer;
