import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  codes: {}, // Format: { problemId: { language: "code string" } }
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    updateCode: (state, action) => {
      const { problemId, language, code } = action.payload;
      if (!state.codes[problemId]) {
        state.codes[problemId] = {};
      }
      state.codes[problemId][language] = code;
    },
    clearCode: (state, action) => {
      const { problemId } = action.payload;
      delete state.codes[problemId];
    }
  }
});

export const { updateCode, clearCode } = editorSlice.actions;
export default editorSlice.reducer;
