import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  histories: {}, // Format: { problemId: [ { role: 'user', text: '...' }, ... ] }
};

const chataiSlice = createSlice({
  name: 'chatai',
  initialState,
  reducers: {
    updateChatHistory: (state, action) => {
      const { problemId, history } = action.payload;
      state.histories[problemId] = history;
    },
    clearChatHistory: (state, action) => {
      const { problemId } = action.payload;
      delete state.histories[problemId];
    }
  }
});

export const { updateChatHistory, clearChatHistory } = chataiSlice.actions;
export default chataiSlice.reducer;
