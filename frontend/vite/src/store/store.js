import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../slicers/authslice';
import seasonReducer from '../slicers/seasonslice';
import chataiReducer from '../slicers/chataiSlice';
import editorReducer from '../slicers/editorSlice';

const store = configureStore({
    reducer :{
        auth : authReducer,
        season : seasonReducer,
        chatai : chataiReducer,
        editor : editorReducer
    }
});

export default store;
