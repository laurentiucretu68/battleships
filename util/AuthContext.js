import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(undefined, undefined);

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [isLogged, setIsLogged] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('accessToken').then(token => {
            setIsLogged(!!token);
        });
    }, []);

    const logout = async () => {
        await AsyncStorage.removeItem('accessToken');
        setIsLogged(false);
    };

    const login = async (token) => {
        await AsyncStorage.setItem('accessToken', token);
        setIsLogged(true);
    };

    return (
        <AuthContext.Provider value={{ isLogged, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
