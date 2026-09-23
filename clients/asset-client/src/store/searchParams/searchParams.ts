import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SearchParams = {
  AgencyCODE: string;
};

const initialState: SearchParams = {
  AgencyCODE: "",
};

const searchParamsSlice = createSlice({
  name: "AgencyCODE",
  initialState: initialState,
  reducers: {
    reset: () => initialState,
    setAgencyCode: (state, action: PayloadAction<string | "">) => {
      state.AgencyCODE = action.payload;
    },
  },
});

export const { setAgencyCode, reset } = searchParamsSlice.actions;

export default searchParamsSlice.reducer;
