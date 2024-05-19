import React from 'react';
import {useAuth} from './AuthContext';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignupScreen from "../screens/SignupScreen";
import MainMenu from "../screens/MainMenu";
import PlayScreen from "../screens/PlayScreen";
import LoginScreen from "../screens/LoginScreen";
import GameScreen from "../screens/GameScreen";

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
    const {isLogged} = useAuth();

    return (
        <NavigationContainer key={isLogged ? "logged_in" : "logged_out"}>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                {isLogged ? (
                    <>
                        <Stack.Screen name="MainMenu" component={MainMenu}/>
                        <Stack.Screen name="Play" component={PlayScreen}/>
                        <Stack.Screen name="GameScreen" component={GameScreen}/>
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen}/>
                        <Stack.Screen name="SignUp" component={SignupScreen}/>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AuthNavigation;
