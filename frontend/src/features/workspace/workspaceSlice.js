import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import { getWorkspace, getWorkspaceById, getWorkspaceMembers, getWorkspaceMemeberById, deleteWorkspace, createWorkspace } from "./workspaceApi";

export const fetchWorkspaces= createAsyncThunk(
    "workspace/fetchWorkspace",
    async(_ , thunkAPI)=>{
     try {
      return await getWorkspace();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message
      );
    }
    }
)

export const fetchWorkspaceById =
  createAsyncThunk(
    "workspace/fetchWorkspaceById",
    async (workspaceId, thunkAPI) => {
      try {
        return await getWorkspaceById(
          workspaceId
        );
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message
        );
      }
    }
  );

export const fetchWorkspaceMembers =
  createAsyncThunk(
    "workspace/fetchWorkspaceMembers",
    async (workspaceId, thunkAPI) => {
      try {
        return await getWorkspaceMembers(
          workspaceId
        );
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message
        );
      }
    }
  );

export const addWorkspace =
  createAsyncThunk(
    "workspace/addWorkspace",
    async (data, thunkAPI) => {
      try {
        return await createWorkspace(data);
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message
        );
      }
    }
  );

export const removeWorkspace =
  createAsyncThunk(
    "workspace/removeWorkspace",
    async (workspaceId, thunkAPI) => {
      try {
        await deleteWorkspace(
          workspaceId
        );

        return workspaceId;
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message
        );
      }
    }
  );

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  members: [],
  loading: false,
  error: null,
};

const workspaceSlice = createSlice({
  name: "workspace",

  initialState,

  reducers: {
    setCurrentWorkspace: (
      state,
      action
    ) => {
      state.currentWorkspace =
        action.payload;
    },
  },

  extraReducers: (builder) => {

    builder

      .addCase(
        fetchWorkspaces.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        fetchWorkspaces.fulfilled,
        (state, action) => {
          state.loading = false;

          state.workspaces =
            action.payload;

          if (
            action.payload.length > 0 &&
            !state.currentWorkspace
          ) {
            state.currentWorkspace =
              action.payload[0];
          }
        }
      )

      .addCase(
        fetchWorkspaces.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
        }
      )

      .addCase(
        fetchWorkspaceById.fulfilled,
        (state, action) => {
          state.currentWorkspace =
            action.payload;
        }
      )

      .addCase(
        fetchWorkspaceMembers.fulfilled,
        (state, action) => {
          state.members =
            action.payload;
        }
      )

      .addCase(
        addWorkspace.fulfilled,
        (state, action) => {

          state.workspaces.push(
            action.payload
          );

          state.currentWorkspace =
            action.payload;
        }
      )

      .addCase(
        removeWorkspace.fulfilled,
        (state, action) => {

          state.workspaces =
            state.workspaces.filter(
              (workspace) =>
                workspace._id !==
                action.payload
            );
        }
      );
  },
});

export const {
  setCurrentWorkspace,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;