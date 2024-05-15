import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions, Alert, ScrollView } from 'react-native';
import agent from '../util';

const { width } = Dimensions.get('window');

export default function GameScreen({ route, navigation }) {
    const { gameId } = route.params;
    const [gameDetails, setGameDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCells, setSelectedCells] = useState([]);
    const [ships, setShips] = useState([]);
    const [isStrikeMode, setIsStrikeMode] = useState(false);

    useEffect(() => {
        fetchGameDetails(gameId);
    }, [gameId]);

    const fetchGameDetails = (id) => {
        setIsLoading(true);
        agent.Game.getGameDetails(id)
            .then(response => {
                setGameDetails(response);
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
                console.error(error);
            });
    };

    const handleCellPress = (row, col) => {
        const cell = { x: String.fromCharCode(65 + row), y: col + 1 };
        if (isStrikeMode) {
            handleSendStrike(cell);
        } else {
            setSelectedCells((prevSelectedCells) => {
                // Adaugă sau elimină celula din lista de celule selectate
                const cellExists = prevSelectedCells.some(
                    (selectedCell) => selectedCell.x === cell.x && selectedCell.y === cell.y
                );
                if (cellExists) {
                    return prevSelectedCells.filter(
                        (selectedCell) => selectedCell.x !== cell.x || selectedCell.y !== cell.y
                    );
                } else {
                    return [...prevSelectedCells, cell];
                }
            });
        }
    };

    const handlePlaceShip = () => {
        if (selectedCells.length > 0) {
            const newShips = selectedCells.map((cell) => ({
                ...cell,
                size: 2,
                direction: 'HORIZONTAL',
            }));
            setShips((prevShips) => [...prevShips, ...newShips]);
            setSelectedCells([]);
        }
    };

    const handleSendConfiguration = () => {
        console.log({ ships })
        agent.Game.sendMapConfiguration(gameId, { ships })
            .then(response => {
                Alert.alert('Success', 'Configuration sent successfully');
            })
            .catch(error => {
                console.log(error)
                Alert.alert('Error', 'Failed to send configuration');
                console.error(error);
            });
    };

    const handleSendStrike = (cell) => {
        agent.Game.sendStrike(gameId, cell)
            .then(response => {
                Alert.alert('Success', 'Strike sent successfully');
                fetchGameDetails(gameId);
            })
            .catch(error => {
                Alert.alert('Error', 'Failed to send strike');
                console.error(error);
            });
    };

    const renderGrid = () => {
        const grid = [];
        for (let i = 0; i < 10; i++) {
            const row = [];
            for (let j = 0; j < 10; j++) {
                const cell = { x: String.fromCharCode(65 + i), y: j + 1 };
                const isSelected = selectedCells.some(
                    (selectedCell) => selectedCell.x === cell.x && selectedCell.y === cell.y
                );
                const isShip = ships.some(
                    (ship) => ship.x === cell.x && ship.y === cell.y
                );
                row.push(
                    <TouchableOpacity
                        key={`${i}-${j}`}
                        style={[
                            styles.cell,
                            isSelected && styles.selectedCell,
                            isShip && styles.shipCell,
                        ]}
                        onPress={() => handleCellPress(i, j)}
                    >
                        <Text style={styles.cellText}>{String.fromCharCode(65 + i)}{j + 1}</Text>
                    </TouchableOpacity>
                );
            }
            grid.push(<View key={i} style={styles.row}>{row}</View>);
        }
        return grid;
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={[styles.gridContainer, { marginTop: 40 }]}>
                    {renderGrid()}
                </View>
                <View style={[styles.actionsContainer]}>
                    <TouchableOpacity style={styles.actionButton} onPress={handlePlaceShip}>
                        <Text style={styles.actionButtonText}>Place Ships</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleSendConfiguration}>
                        <Text style={styles.actionButtonText}>Send Configuration</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => setIsStrikeMode(true)}>
                        <Text style={styles.actionButtonText}>Start Strike</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Back to Games</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.detailsContainer]}>
                    <Text style={styles.detailText}>Game ID: {gameDetails.id}</Text>
                    <Text style={styles.detailText}>Status: {gameDetails.status}</Text>
                    <Text style={styles.detailText}>Player 1: {gameDetails.player1?.email}</Text>
                    <Text style={styles.detailText}>Player 2: {gameDetails.player2 ? gameDetails.player2.email : 'Waiting for player'}</Text>
                    <Text style={styles.detailText}>Player to Move: {gameDetails.playerToMoveId === gameDetails.player1Id ? gameDetails.player1?.email : gameDetails.player2?.email || 'N/A'}</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        width: width * 0.9,
        aspectRatio: 1,
        backgroundColor: '#e9ecef',
        borderRadius: 10,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: (width * 0.9 - 20) / 10,
        height: (width * 0.9 - 20) / 10,
        backgroundColor: '#fff',
        borderColor: '#dee2e6',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedCell: {
        backgroundColor: '#a5d6a7',
    },
    shipCell: {
        backgroundColor: '#1e88e5',
    },
    cellText: {
        fontSize: 12,
        color: '#495057',
    },
    actionsContainer: {
        width: width * 0.9,
        marginBottom: 20,
    },
    actionButton: {
        backgroundColor: '#28a745',
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: '#007bff',
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    detailsContainer: {
        width: width * 0.9,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#343a40',
        alignSelf: 'center',
    },
    detailText: {
        fontSize: 16,
        color: '#495057',
        marginBottom: 10,
    },
});
