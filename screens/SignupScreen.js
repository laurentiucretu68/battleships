import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView
} from "react-native";
import agent from '../util/index.js';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import {useState} from "react";

export default function SignupScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [isValidPassword, setIsValidPassword] = useState(true);

    const validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const validatePassword = (password) => {
        const re = /^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return re.test(password);
    }

    const handleEmailChange = (text) => {
        setEmail(text);
        setIsValidEmail(validateEmail(text));
    }

    const handlePasswordChange = (text) => {
        setPassword(text);
        setIsValidPassword(validatePassword(text));
    }

    const handleRegister = async () => {
        if (isValidEmail && isValidPassword) {
            try {
                await agent.Account.register(email, password);
                Alert.alert('Success', 'Account created successfully. Redirecting to login page...');
                navigation.navigate('Login');
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    Alert.alert('Error', 'This email is already in use. Please use a different email.');
                } else {
                    Alert.alert('Error', 'There was an error creating your account. Please try again!');
                }
            }
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="bg-top h-full w-full">
                        <StatusBar style="light"/>

                        <View className="flex justify-start items-center pt-20">
                            <Animated.Image
                                entering={FadeInDown.delay(100).duration(1000).springify()}
                                source={require('../assets/images/logo.jpeg')}
                                style={{ width: 200, height: 100, resizeMode: 'contain' }}
                                className="mb-2"
                            />
                        </View>

                        <View className="h-full w-full flex justify-start pt-5">
                            <View className="flex items-center pb-5">
                                <Animated.Text entering={FadeInUp.delay(100).duration(1000).springify()}
                                               className="text-black font-bold tracking-wider text-5xl">
                                    Sign Up
                                </Animated.Text>
                            </View>

                            <View className="flex items-center mx-4 space-y-4">
                                <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}
                                               className="bg-black/5 p-5 rounded-2xl w-full">
                                    <TextInput placeholderTextColor={'gray'}
                                               placeholder="Email"
                                               value={email}
                                               onChangeText={handleEmailChange}
                                               autoCapitalize='none'
                                               style={{color: isValidEmail ? 'gray' : 'red'}}/>
                                </Animated.View>
                                {!isValidEmail && <Text style={{color: 'red'}}>Email is not valid.</Text>}

                                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}
                                               className="bg-black/5 p-5 rounded-2xl w-full">
                                    <TextInput placeholderTextColor={'gray'}
                                               placeholder="Password"
                                               secureTextEntry
                                               value={password}
                                               onChangeText={handlePasswordChange}
                                               autoCapitalize='none'
                                               style={{color: isValidPassword ? 'gray' : 'red'}}/>
                                </Animated.View>
                                {!isValidPassword && <Text style={{color: 'red'}}>Password is not valid. It should contain at least 8 characters, one uppercase, one lowercase, and one special character.</Text>}

                                <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} className="w-full">
                                    <TouchableOpacity onPress={handleRegister} className="w-full bg-sky-400 p-3 rounded-2xl mb-3">
                                        <Text className="text-xl text-white text-center font-bold">
                                            Sign Up
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                <View className="flex-row justify-center">
                                    <Text>Already have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.push('Login')}>
                                        <Text className="text-sky-600">Login</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}
