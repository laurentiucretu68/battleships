import React from 'react';
import { AuthProvider } from './util/AuthContext';
import AuthNavigation from './util/AuthNavigation';

import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAsyncStorage = async () => {
    try {
        await AsyncStorage.clear();
    } catch (e) {
        console.log('Failed to clear the async storage.', e);
    }
}

function App() {
    return (
        <AuthProvider>
            <AuthNavigation />
        </AuthProvider>
    );
}

export default App;