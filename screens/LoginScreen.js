import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView, Alert
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import {useState} from "react";
import { useAuth } from '../util/AuthContext';
import agent from "../util";



export default function LoginScreen() {
    const { login } = useAuth();
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(true);

    const validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const handleEmailChange = (text) => {
        setEmail(text);
        setIsValidEmail(validateEmail(text));
    }

    const handlePasswordChange = (text) => {
        setPassword(text);
    }

    const handleLogin = async () => {
        if (isValidEmail) {
            try {
                const response = await agent.Account.login(email, password, login);
                if (!response || !response.accessToken) {
                    Alert.alert('Error', 'There was an error logging in. Please try again!');
                }
            } catch (error) {
                Alert.alert('Error', 'There was an error logging in. Please try again!');
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
                                    Login
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
                                               autoCapitalize='none'
                                               onChangeText={handlePasswordChange}/>
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} className="w-full">
                                    <TouchableOpacity onPress={handleLogin} className="w-full bg-sky-400 p-3 rounded-2xl mb-3">
                                        <Text className="text-xl text-white text-center font-bold">
                                            Login
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                <View className="flex-row justify-center">
                                    <Text className="text-black">Don't have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.push('SignUp')}>
                                        <Text className="text-sky-600">Sign Up</Text>
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
