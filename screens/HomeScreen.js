import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import agent from '../util';
import LoginScreen from "./LoginScreen";


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
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : userDetails ? (
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Animated.View style={styles.profileCard} entering={FadeInDown.delay(400).duration(1000).springify()} className="w-full">
                        <Image source={require('../assets/images/profile.jpeg')} style={styles.profileImage} />
                        <Text style={styles.profileName}>Hello, {(userDetails.email).split('@')[0]}!</Text>
                    </Animated.View>

                    <Animated.View style={styles.statsContainer} entering={FadeInDown.delay(600).duration(1000).springify()} className="w-full">
                        <Text style={styles.subtitle}>Statistics</Text>
                        <Animated.View style={styles.statItem} entering={FadeInDown.delay(700).duration(1000).springify()} className="w-full">
                            <Icon name="gamepad" size={20} color="#5cacee" style={styles.icon} />
                            <Text style={styles.statText}>Currently playing: {statistics.currentlyGamesPlaying}</Text>
                        </Animated.View>

                        <Animated.View style={styles.statItem} entering={FadeInDown.delay(750).duration(1000).springify()} className="w-full">
                            <Icon name="bar-chart" size={20} color="#000" style={styles.icon} />
                            <Text style={styles.statText}>Games played: {statistics.gamesPlayed}</Text>
                        </Animated.View>

                        <Animated.View style={styles.statItem} entering={FadeInDown.delay(800).duration(1000).springify()} className="w-full">
                            <Icon name="trophy" size={20} color="green" style={styles.icon} />
                            <Text style={styles.statText}>Games won: {statistics.gamesWon}</Text>
                        </Animated.View>

                        <Animated.View style={styles.statItem} entering={FadeInDown.delay(850).duration(1000).springify()} className="w-full">
                            <Icon name="times-circle" size={20} color="red" style={styles.icon} />
                            <Text style={styles.statText}>Games lost: {statistics.gamesLost}</Text>
                        </Animated.View>

                        <Animated.View style={styles.statItem} entering={FadeInDown.delay(900).duration(1000).springify()} className="w-full">
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
        backgroundColor: '#f0f0f0',
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
    profileCard: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 50,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statsContainer: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'left',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
    },
    statText: {
        fontSize: 16,
    },
});
