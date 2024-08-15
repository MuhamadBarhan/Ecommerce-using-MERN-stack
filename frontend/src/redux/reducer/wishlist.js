import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {baseUrl} from '../../url'

export const wishSlice = createSlice({
    name:'wishlist',
    initialState:{
        list:[],
    },
    reducers:{
        setWishItems: (state, { payload }) => {
            state.list = payload;
        },
        addItemWishList:(state,{payload})=>{
            state.list=[...state.list,payload]
        },
        removeItemWishList: (state, { payload }) => {
            const index = state.list.findIndex(product => product.id === payload.id);
            state.list = [
                ...state.list.slice(0, index),
                ...state.list.slice(index + 1),
            ];
        },
    }
});


export const {setWishItems, addItemWishList , removeItemWishList}=wishSlice.actions;

// Thunk action to save wishlist state to the backend
export const saveWishlistToBackendThunk = () => async (dispatch, getState) => {
    const { wish } = getState();
    if (wish.list.length > 0) {
        try {
            const response = await axios.post(`${baseUrl}/savewishlist`, wish.list, {
                headers: {
                    Accept: '*/*',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log('Wishlist saved to backend:', response.data);
        } catch (error) {
            console.error('Error saving wishlist to backend:', error);
        }
    }

};

export default wishSlice.reducer;