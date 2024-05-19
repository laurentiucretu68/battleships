import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Animated, { FadeInDown } from 'react-native-reanimated';
import agent from '../util';
import LoginScreen from "./LoginScreen";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const [userDetails, setUserDetails] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        agent.Account.currentUser()
            .then(response => {
                setUserDetails(response.user);
                setStatistics({
                    currentlyGamesPlaying: response.currentlyGamesPlaying,
                    gamesPlayed: response.gamesPlayed,
                    gamesWon: response.gamesWon,
                    gamesLost: response.gamesLost,
                });
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {userDetails ? (
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Animated.View style={styles.card} entering={FadeInDown.delay(400).duration(1000).springify()}>
                        <Image source={require('../assets/images/profile.jpeg')} style={styles.profileImage} />
                        <Text style={styles.profileName}>Hello, {(userDetails.email).split('@')[0]}!</Text>
                    </Animated.View>

                    <Animated.View style={styles.card2} entering={FadeInDown.delay(600).duration(1000).springify()}>
                        <Text style={styles.subtitle}>Statistics</Text>
                        <Animated.View style={styles.statItem} entering={FadeInDown.delay(700).duration(1000).springify()}>
                            <Icon name="gamepad" size={20} color="#5cacee" style={styles.icon} />
                            <Text style={styles.statText}>Currently playing: {statistics.currentlyGamesPlaying}</Text>
                        </Animated.View>

                        <Animated.View style={styles.statItem} entering={FadeInDown.delay(750).duration(1000).springify()}>
                            <Icon name="bar-chart" size={20} color="#000" style={styles.icon} />
                            <Text style={styles.statText}>Games played: {statistics.gamesPlayed}</Text>
                        </Animated.View>

                        <Animated.View style={styles.statItem} entering={FadeInDown.delay(800).duration(1000).springify()}>
                            <Icon name="trophy" size={20} color="green" style={styles.icon} />
                            <Text style={styles.statText}>Games won: {statistics.gamesWon}</Text>
                        </Animated.View>

                        <Animated.View style={styles.statItem} entering={FadeInDown.delay(850).duration(1000).springify()}>
                            <Icon name="times-circle" size={20} color="red" style={styles.icon} />
                            <Text style={styles.statText}>Games lost: {statistics.gamesLost}</Text>
                        </Animated.View>

                        <Animated.View style={styles.statItem} entering={FadeInDown.delay(900).duration(1000).springify()}>
                            <Icon name="percent" size={20} color="#000" style={styles.icon} />
                            <Text style={styles.statText}>Win rate: {statistics.gamesPlayed ? (statistics.gamesWon / statistics.gamesPlayed * 100).toFixed(2) : 0}%</Text>
                        </Animated.View>
                    </Animated.View>
                </ScrollView>
            ) : (
                <LoginScreen />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 20,
        alignItems: 'center',
    },
    card: {
        width: width * 0.9,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        alignItems: 'center',
    },
    card2: {
        width: width * 0.9,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 50,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#343a40',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#343a40',
        textAlign: 'left'
    },
    statItem: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
    },
    statText: {
        fontSize: 16,
        color: '#495057',
    },
});
