import { configureStore } from "@reduxjs/toolkit";
import customersReducer from "./customersSlice";
import contactsReducer from "./contactsSlice";
import accessRightsReducer from "./accessRightsSlice";

const store = configureStore({
  reducer: {
    customers: customersReducer,
    contacts: contactsReducer,
    accessRights: accessRightsReducer,
  },
});

export default store;
