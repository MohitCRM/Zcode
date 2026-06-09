import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../slicers/authslice';

const store = configureStore({
    reducer :{
        auth : authReducer
    }
});

export default store;
