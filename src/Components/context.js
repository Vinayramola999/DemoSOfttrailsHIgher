
import React, { createContext, useState } from 'react';

export const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [address, setAddress] = useState([]);
  const [emailForResetPassword, setEmailForResetPassword] = useState("");

  return (
    <MyContext.Provider value={{ address, setAddress, emailForResetPassword, setEmailForResetPassword }}>
      {children}
    </MyContext.Provider>
  );
};
