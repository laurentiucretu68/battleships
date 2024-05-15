import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from "react-native";

axios.defaults.baseURL = 'https://malamute-enabled-yak.ngrok-free.app'
axios.defaults.withCredentials = true

axios.interceptors.request.use(async config => {
    const token = await AsyncStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

axios.interceptors.response.use(
    response => response,
    async error => {
        return Promise.reject(error);
    }
);


const responseBody = (response) => response.data

const requests = {
    get: (url, params) => axios.get(url, {params}).then(responseBody),
    post: (url, body)=> axios.post(url, body).then(responseBody),
    patch: (url, body) => axios.patch(url, body).then(responseBody),
}

const Account = {
    login: async (email, password, onSuccess) => {
        const response = await requests.post('/auth/login', {email, password});
        if (response && response.accessToken) {
            await AsyncStorage.setItem('accessToken', response.accessToken);
            if (onSuccess) {
                onSuccess(response.accessToken);
            }
        }
        return response;
    },
    register: async (email, password) => {
        return await requests.post('/auth/register', {email, password});
    },
    currentUser: () => Promise.resolve(requests.get('/user/details/me'))
};

const Game = {
    getAllGames: () => requests.get('/game'),
    createGame: () => requests.post('/game', {}),
    getGameDetails: (id) => requests.get(`/game/${id}`),
    joinGame: (id, config) => requests.post(`/game/join/${id}`, {config}),
    sendMapConfiguration: (id, map) => requests.patch(`/game/${id}`, {map}),
    sendStrike: (id, strike) => requests.patch(`/game/${id}/strike`, {strike}),
};

const agent = {
    Account,
    Game
};

export default agent;