"use client"// Because we're inside a server component

import React, { createContext, useState, useContext } from 'react';
import {AWSClient} from "@/utils/apiClients";
// Create the context
const AppContext = createContext(null);
// Create a provider component
export const AppProvider = ({ children } : {children: any}) => {
    // const [awsClient, setAwsClient] = useState(new AWSClient('us-east-1'));
    const [provider, setProvider] = useState({});
    const [category, setCategory] = useState(null);
// Define any functions or values you want to provide
    const value = {
        provider,
        setProvider,
        category,
        setCategory
    };
// Define any functions or values you want to provide
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
// Export the context
export const useAppContext= () => useContext(AppContext)