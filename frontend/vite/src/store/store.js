import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../slicers/authslice';
import seasonReducer from '../slicers/seasonslice';

const store = configureStore({
    reducer :{
        auth : authReducer,
        season : seasonReducer
    }
});

export default store;
