import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, FlatList, Modal, Dimensions, Alert, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import agent from '../util';
import LoginScreen from "./LoginScreen";
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function PlayScreen() {
    const [userDetails, setUserDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [games, setGames] = useState([]);
    const [isCreatingGame, setIsCreatingGame] = useState(false);
    const [page, setPage] = useState(1);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [createGameModalVisible, setCreateGameModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        agent.Account.currentUser()
            .then(response => {
                setUserDetails(response.user);
                setIsLoading(false);
                fetchGames(1, 10);
            })
            .catch(error => {
                setIsLoading(false);
            });
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchGames(1, 10);
        }, [])
    );

    const fetchGames = (page, limit) => {
        setIsFetchingMore(true);
        agent.Game.getAllGames({ page, limit })
            .then(response => {
                const availableGames = response.games.filter(game => game.player2Id === null);
                if (page === 1) {
                    setGames(availableGames);
                } else {
                    setGames(prevGames => [...prevGames, ...availableGames]);
                }
                setIsFetchingMore(false);
            })
            .catch(error => {
                setIsFetchingMore(false);
                console.error(error);
            });
    };

    const createGame = () => {
        setIsCreatingGame(true);
        agent.Game.createGame()
            .then(response => {
                setIsCreatingGame(false);
                setCreateGameModalVisible(false);
                setGames(prevGames => [response, ...prevGames.filter(game => game.player2Id === null)]);
                navigation.navigate('GameScreen', { gameId: response.id });
            })
            .catch(error => {
                setIsCreatingGame(false);
                Alert.alert('Error', `Failed to create game ${error.response.data.message}`);
                console.error(error);
            });
    };

    const loadMoreGames = () => {
        if (!isFetchingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchGames(nextPage, 10);
        }
    };

    const selectGame = (game) => {
        setSelectedGame(game);
        setModalVisible(true);
    };

    const joinGame = (game) => {
        if (game.player1?.id === userDetails.id) {
            setModalVisible(false);
            navigation.navigate('GameScreen', { gameId: game.id });
        } else {
            agent.Game.joinGame(game.id)
                .then(response => {
                    setModalVisible(false);
                    navigation.navigate('GameScreen', { gameId: game.id });
                })
                .catch(error => {
                    Alert.alert('Error', `Failed to join game: ${error.response.data.message}`);
                });
        }
    };

    const handleSearch = (text) => {
        setSearchTerm(text.toLowerCase());
    };

    const filteredGames = games.filter(game => {
        const player1Email = game.player1?.email.toLowerCase() || '';
        const player2Email = game.player2?.email.toLowerCase() || '';
        return player1Email.includes(searchTerm) || player2Email.includes(searchTerm);
    });

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {modalVisible && (
                <BlurView intensity={50} style={styles.absolute} />
            )}
            {userDetails ? (
                <>
                    <FlatList
                        ListHeaderComponent={
                            <>
                                <TouchableOpacity style={styles.createButton} onPress={() => setCreateGameModalVisible(true)} disabled={isCreatingGame}>
                                    <Text style={styles.createButtonText}>Create New Game</Text>
                                </TouchableOpacity>
                                <Text style={styles.title}>Available Games</Text>
                                <TextInput
                                    style={styles.searchBox}
                                    placeholder="Search by player email"
                                    value={searchTerm}
                                    onChangeText={handleSearch}
                                />
                            </>
                        }
                        data={filteredGames}
                        keyExtractor={item => item?.id ?? Math.random().toString()}
                        renderItem={({ item }) => (
                            item ? (
                                <TouchableOpacity style={styles.gameItem} onPress={() => selectGame(item)}>
                                    <Text style={styles.gameId}>Game ID: {item.id}</Text>
                                    <Text style={styles.gameStatus}>Status: {item.status}</Text>
                                    <Text style={styles.playerInfo}>Player 1: {item.player1?.email}</Text>
                                    <Text style={styles.playerInfo}>Player 2: Waiting for player</Text>
                                </TouchableOpacity>
                            ) : null
                        )}
                        contentContainerStyle={styles.contentContainer}
                        ListFooterComponent={
                            <View style={styles.footer}>
                                {isFetchingMore ? (
                                    <ActivityIndicator size="large" color="#0000ff" />
                                ) : (
                                    <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreGames}>
                                        <Text style={styles.loadMoreButtonText}>Load More</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                    />
                    {selectedGame && (
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={modalVisible}
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalTitle}>Game Details</Text>
                                    <Text style={styles.modalText}>Game ID: {selectedGame.id}</Text>
                                    <Text style={styles.modalText}>Status: {selectedGame.status}</Text>
                                    <Text style={styles.modalText}>Player 1: {selectedGame.player1?.email}</Text>
                                    <Text style={styles.modalText}>Player 2: Waiting for player</Text>
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={styles.closeButton}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <Text style={styles.textStyle}>Close</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.joinButton}
                                            onPress={() => joinGame(selectedGame)}
                                        >
                                            <Text style={styles.textStyle}>Join Game</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    )}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={createGameModalVisible}
                        onRequestClose={() => setCreateGameModalVisible(false)}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalTitle}>Create New Game</Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.createButtonModal}
                                        onPress={createGame}
                                        disabled={isCreatingGame}
                                    >
                                        <Text style={styles.textStyle}>Create</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setCreateGameModalVisible(false)}
                                    >
                                        <Text style={styles.textStyle}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </>
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
    createButton: {
        backgroundColor: '#007bff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        width: width * 0.9,
        alignSelf: 'center',
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
        color: '#343a40',
        alignSelf: 'center',
    },
    searchBox: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        borderColor: '#ddd',
        borderWidth: 1,
        width: width * 0.9,
        marginBottom: 20,
        alignSelf: 'center',
    },
    gameItem: {
        width: width * 0.9,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        alignItems: 'flex-start',
        alignSelf: 'center',
    },
    gameId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#495057',
    },
    gameStatus: {
        fontSize: 14,
        color: '#6c757d',
        marginVertical: 5,
    },
    playerInfo: {
        fontSize: 14,
        color: '#6c757d',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: width * 0.9,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#343a40',
    },
    modalText: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 16,
        color: '#495057',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 20,
    },
    createButtonModal: {
        backgroundColor: '#007bff',
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginHorizontal: 5,
        alignItems: 'center',
        width: 100,
    },
    closeButton: {
        backgroundColor: '#dc3545',
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginHorizontal: 5,
        alignItems: 'center',
        width: 100,
    },
    joinButton: {
        backgroundColor: '#28a745',
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginHorizontal: 5,
        alignItems: 'center',
        width: 100,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1,
    },
    footer: {
        paddingVertical: 20,
    },
    loadMoreButton: {
        backgroundColor: '#007bff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        width: width * 0.9,
        alignSelf: 'center',
    },
    loadMoreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
