import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
// import vehicleslice from "../vehicleslice/vehicleslice";
// import userslice from "../userslice/userslice";
// import commentSlice from "../commentslice/commentslice";
// import bookingslice from "../booking/bookingslice";
// import conversationSlice from "../conversation/conversationSlice";
// import messageSlice from "../message/messageSlice";
import authSlice from "../slice/authSlice";
import adminSlice from "../slice/adminSlice";
// import chartSlice from "../charts/chartSlice";
// import feedBackSlice from "../contact/feedBackSlice";
const persistConfig = {
  key: "root",
  storage: storage,
};

// Apply persist configuration only to the login slice
const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authSlice),
  admin: adminSlice,
  //   user: userslice,
  //   vehicle: vehicleslice,
  //   comment: commentSlice,
  //   booking: bookingslice,
  //   connvo: conversationSlice,
  //   message: messageSlice,
  //   chart: chartSlice,
  //   feedBack: feedBackSlice,
});

const store = configureStore({
  reducer: rootReducer,
});


export { store };
