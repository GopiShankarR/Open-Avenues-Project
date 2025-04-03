import {createSlice} from '@reduxjs/toolkit';

const allCharactersSlice = createSlice({
    name: 'allCharacters',
    initialState: {
        users: {},
    },
    reducers: {
        update(state, action) {
            const updatedUserList = action.payload;       
            state.users = updatedUserList;
        },
    }
});

export const { update } = allCharactersSlice.actions;

export default allCharactersSlice.reducer;