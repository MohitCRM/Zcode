import { createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axiosClient from '../utils/axiosClient';
const getErrorMessage = (err) => {
    return (
        err.response?.data?.message || 
        err.response?.data ||          
        err.message ||                
        'Some error has occurred'
    );
};

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userdata , {rejectWithValue })=>{
        try {
            const response = await axiosClient.post('/user/register',userdata);
            return response.data.user;
        }catch (err)
        {
            return rejectWithValue(getErrorMessage(err));
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials,{rejectWithValue})=>{
        try {
            const response = await axiosClient.post('/user/login',credentials);
            return response.data.user;
        }catch(err)
        {
            return rejectWithValue(getErrorMessage(err));
        }
    }
);

export const checkauth = createAsyncThunk(
    'auth/checkauth',
    async (_,{rejectWithValue})=>{
        try{
            const {data} = await axiosClient.get('/user/checkauth');
            return data.user;
        }catch(err){
            return rejectWithValue(getErrorMessage(err));
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_,{rejectWithValue}) =>{
        try{
            await axiosClient.post('/user/logout');
            return null;
        }
        catch (error){
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const authslicer = createSlice({
    name : 'auth',
    initialState : {user : {}, loading:false,error : null, isauth : false},
    reducers : {},
    extraReducers : (builder)=>{
        builder
        .addCase(registerUser.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(registerUser.fulfilled , (state,action)=>{
            state.loading = false;
            state.isauth = !!action.payload;
            state.user = action.payload;
        })
        .addCase(registerUser.rejected, (state,action)=>{
            state.loading = false;
            state.error = action.payload;
            state.isauth = false;
            state.user = null;
        })

        //login cases
         .addCase(loginUser.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(loginUser.fulfilled , (state,action)=>{
            state.loading = false;
            state.isauth = !!action.payload;
            state.user = action.payload;
        })
        .addCase(loginUser.rejected, (state,action)=>{
            state.loading = false;
            state.error = action.payload || 'Some error has occured';
            state.isauth = false;
            state.user = null;
        })

        //checkauth cases
         .addCase(checkauth.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(checkauth.fulfilled , (state,action)=>{
            state.loading = false;
            state.isauth = !!action.payload;
            state.user = action.payload;
        })
        .addCase(checkauth.rejected, (state,action)=>{
            state.loading = false;
            state.error = action.payload || 'Some error has occured';
            state.isauth = false;
            state.user = null;
        })

        //logout cases
        .addCase(logoutUser.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(logoutUser.fulfilled , (state,action)=>{
            state.loading = false;
            state.isauth = false;
            state.error = null;
            state.user = {};
        })
        .addCase(logoutUser.rejected, (state,action)=>{
            state.loading = false;
            state.error = action.payload || 'Some error has occured';
            state.isauth = false;
            state.user = null;
        })
    }
})

export default authslicer.reducer;