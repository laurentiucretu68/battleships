import * as React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import PlayScreen from './PlayScreen';
import {Alert, Image} from 'react-native';
import {useAuth} from "../util/AuthContext";

const Drawer = createDrawerNavigator();

function MainMenu() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout(); // Use the logout function from AuthContext
        } catch (error) {
            Alert.alert("Logout Failed", "An error occurred while trying to log out.");
        }
    };

    return (
        <Drawer.Navigator initialRouteName="Home"
                          screenOptions={{
                              drawerStyle: {
                                  backgroundColor: '#f0f0f0',
                                  width: 240,
                              },
                              drawerActiveTintColor: '#007bff',
                              drawerInactiveTintColor: '#686868',
                          }}>
            <Drawer.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    drawerIcon: ({focused, size}) => (
                        <Image
                            source={require('../assets/images/home.png')}
                            style={[{
                                height: size,
                                width: size
                            }, focused ? {tintColor: '#5cacee'} : {tintColor: '#b0c4de'}]}
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="Play"
                component={PlayScreen}
                options={{
                    drawerIcon: ({focused, size}) => (
                        <Image
                            source={require('../assets/images/game.png')}
                            style={[{
                                height: size,
                                width: size
                            }, focused ? {tintColor: '#5cacee'} : {tintColor: '#b0c4de'}]}
                        />
                    ),
                }}
            />
            <Drawer.Screen name={'Logout'} component={HomeScreen} options={{
                drawerIcon: ({focused, size}) => (
                    <Image
                        source={require('../assets/images/logout.png')}
                        style={[{height: size, width: size}, focused ? {tintColor: '#5cacee'} : {tintColor: '#b0c4de'}]}
                    />
                ),
            }} listeners={{
                focus: async () => {
                    // Execute logout when this drawer item is focused
                    await handleLogout()
                },
            }}/>
        </Drawer.Navigator>
    );
}

export default MainMenu;
