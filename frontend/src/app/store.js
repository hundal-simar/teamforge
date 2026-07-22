import { configureStore } from "@reduxjs/toolkit";

import workspaceReducer from "../features/workspace/workspaceSlice";

export const store= configureStore({
    reducer:{
        workspace: workspaceReducer,
    },
})