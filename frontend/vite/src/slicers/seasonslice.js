import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";

const getErrorMessage = (err) => {
    return (
        err.response?.data?.message || 
        err.response?.data ||          
        err.message ||                
        'Some error has occurred'
    );
};

export  const getcurrentseason = createAsyncThunk(
    'seasons/getcurrentseason',

    async(_ , {rejectWithValue})=>{
        try{
            const response = await axiosClient.get('/seasons/getcurrentseason');
            return response.data;
        }catch(err)
        {
            return rejectWithValue(getErrorMessage(err));
        }
    }
)

const seasonslicer = createSlice({
    name : 'season',
    initialState : {data : null, loading: true, error: null},
    reducers : {},
    extraReducers : (builder)=>{
        builder
        .addCase(getcurrentseason.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(getcurrentseason.fulfilled , (state,action)=>{
            state.loading = false;
            state.data = action.payload.season;
        })
        .addCase(getcurrentseason.rejected, (state,action)=>{
            state.loading = false;
            state.error = action.payload.error;
            state.data = null;
        })
    }
})

export default seasonslicer.reducer;