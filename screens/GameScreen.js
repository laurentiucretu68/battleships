import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ScrollView, Image, TextInput } from 'react-native';
import agent from '../util';
import { debounce } from 'lodash';

const { width } = Dimensions.get('window');

export default function GameScreen({ route, navigation }) {
    const { gameId } = route.params;
    const [gameDetails, setGameDetails] = useState(null);
    const [ships, setShips] = useState([]);
    const [playerType, setPlayerType] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlane, setSelectedPlane] = useState(null);
    const [planePosition, setPlanePosition] = useState({ x: 'A', y: 1, vertical: false });
    const [shipCounts, setShipCounts] = useState({ '2': 4, '3': 3, '4': 2, '6': 1 });
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    useEffect(() => {
        fetchGameDetails(gameId, true);
        const debouncedFetch = debounce(() => fetchGameDetails(gameId, false), 2000);
        const intervalId = setInterval(debouncedFetch, 2000);
        return () => {
            clearInterval(intervalId);
            debouncedFetch.cancel();
        };
    }, [gameId]);

    useEffect(() => {
        checkAllShipsPlaced();
    }, [shipCounts]);

    const fetchGameDetails = (id, showLoading = true) => {
        agent.Game.getGameDetails(id)
            .then(response => {
                console.log(response);
                setGameDetails(response);
                setPlayerType(response.player1.id === response.playerToMoveId ? 'player1' : 'player2');
                if (showLoading) setIsLoading(false);
            })
            .catch(error => {
                if (showLoading) setIsLoading(false);
                console.error(error.response.data.message);
            });
    };

    const sendMapConfiguration = async (shipsConfig) => {
        try {
            await agent.Game.sendMapConfiguration(gameId, { ships: shipsConfig });
            Alert.alert('Success', 'Map configuration sent successfully');
        } catch (error) {
            console.error(error.response.data.message);
            Alert.alert('Error', error.response.data.message);
        }
    };

    const checkCollision = (newShip, existingShips) => {
        const newShipPositions = [];
        if (newShip.direction === 'HORIZONTAL') {
            for (let i = 0; i < newShip.size; i++) {
                newShipPositions.push({ x: newShip.x, y: newShip.y + i });
            }
        } else {
            for (let i = 0; i < newShip.size; i++) {
                newShipPositions.push({ x: String.fromCharCode(newShip.x.charCodeAt(0) + i), y: newShip.y });
            }
        }

        for (let ship of existingShips) {
            const shipPositions = [];
            if (ship.direction === 'HORIZONTAL') {
                for (let i = 0; i < ship.size; i++) {
                    shipPositions.push({ x: ship.x, y: ship.y + i });
                }
            } else {
                for (let i = 0; i < ship.size; i++) {
                    shipPositions.push({ x: String.fromCharCode(ship.x.charCodeAt(0) + i), y: ship.y });
                }
            }
            for (let pos of newShipPositions) {
                if (shipPositions.some(sp => sp.x === pos.x && sp.y === pos.y)) {
                    return true;
                }
            }
        }
        return false;
    };

    const handlePlacePlane = () => {
        if (!gameDetails.player2) {
            Alert.alert('Waiting', 'You cannot place ships until the second player joins.');
            return;
        }

        if (selectedPlane && planePosition) {
            const newShip = {
                x: planePosition.x,
                y: planePosition.y,
                size: selectedPlane === 'plane1' ? 2 : selectedPlane === 'plane2' ? 3 : selectedPlane === 'plane3' ? 4 : 6,
                direction: planePosition.vertical ? 'VERTICAL' : 'HORIZONTAL'
            };

            if (checkCollision(newShip, ships)) {
                Alert.alert('Error', 'Invalid configuration, the new ship intersects with another ship.');
                return;
            }

            setShips((prevShips) => {
                const updatedShips = [...prevShips, newShip];
                updateShipCount(newShip.size.toString());
                return updatedShips;
            });
            setSelectedPlane(null);
            setPlanePosition({ x: 'A', y: 1, vertical: false });
        }
    };

    const updateShipCount = (size) => {
        setShipCounts(prevCounts => {
            const updatedCounts = { ...prevCounts };
            updatedCounts[size] -= 1;
            return updatedCounts;
        });
    };

    const checkAllShipsPlaced = () => {
        const allShipsPlaced = Object.values(shipCounts).every(count => count === 0);
        setIsSubmitEnabled(allShipsPlaced);
    };

    const handlePlaneSelect = (planeType) => {
        setSelectedPlane(planeType);
    };

    const renderGrid = () => {
        const grid = [];
        for (let i = 0; i < 10; i++) {
            const row = [];
            for (let j = 0; j < 10; j++) {
                const cell = { x: String.fromCharCode(65 + i), y: j + 1 };
                const ship = ships.find(ship => {
                    if (ship.direction === 'HORIZONTAL') {
                        return ship.x === cell.x && ship.y <= cell.y && cell.y < ship.y + ship.size;
                    } else {
                        return ship.y === cell.y && ship.x.charCodeAt(0) <= cell.x.charCodeAt(0) && cell.x.charCodeAt(0) < ship.x.charCodeAt(0) + ship.size;
                    }
                });
                row.push(
                    <View
                        key={`${i}-${j}`}
                        style={[
                            styles.cell,
                            ship && (ship.size === 2 ? styles.plane1Cell : ship.size === 3 ? styles.plane2Cell : ship.size === 4 ? styles.plane3Cell : styles.plane4Cell),
                        ]}
                    >
                        <Text style={styles.cellText}>{String.fromCharCode(65 + i)}{j + 1}</Text>
                    </View>
                );
            }
            grid.push(<View key={i} style={styles.row}>{row}</View>);
        }
        return grid;
    };

    const handleSubmit = () => {
        sendMapConfiguration(ships);
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text>Loading...</Text>
                    </View>
                ) : (
                    <>
                        <View style={[styles.gridContainer, { marginTop: 40 }]}>
                            {renderGrid()}
                        </View>
                        <View style={styles.planesContainer}>
                            <TouchableOpacity onPress={() => handlePlaneSelect('plane1')} style={styles.planeButton}>
                                <Image source={require('../assets/images/plane1.webp')} style={styles.planeImage} />
                                <Text style={styles.planeText}>2</Text>
                                <View style={styles.plane1Color}></View>
                                <Text>{shipCounts['2']} left</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handlePlaneSelect('plane2')} style={styles.planeButton}>
                                <Image source={require('../assets/images/plane2.webp')} style={styles.planeImage} />
                                <Text style={styles.planeText}>3</Text>
                                <View style={styles.plane2Color}></View>
                                <Text>{shipCounts['3']} left</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handlePlaneSelect('plane3')} style={styles.planeButton}>
                                <Image source={require('../assets/images/plane3.png')} style={styles.planeImage} />
                                <Text style={styles.planeText}>4</Text>
                                <View style={styles.plane3Color}></View>
                                <Text>{shipCounts['4']} left</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handlePlaneSelect('plane4')} style={styles.planeButton}>
                                <Image source={require('../assets/images/plane4.png')} style={styles.planeImage} />
                                <Text style={styles.planeText}>6</Text>
                                <View style={styles.plane4Color}></View>
                                <Text>{shipCounts['6']} left</Text>
                            </TouchableOpacity>
                        </View>
                        {selectedPlane && (
                            <View style={styles.planePlacementContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="X"
                                    value={planePosition.x}
                                    onChangeText={(text) => setPlanePosition({ ...planePosition, x: text.toUpperCase() })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Y"
                                    keyboardType="numeric"
                                    value={planePosition.y.toString()}
                                    onChangeText={(text) => setPlanePosition({ ...planePosition, y: parseInt(text) })}
                                />
                                <TouchableOpacity
                                    style={styles.verticalToggle}
                                    onPress={() => setPlanePosition({ ...planePosition, vertical: !planePosition.vertical })}
                                >
                                    <Text>{planePosition.vertical ? 'Horizontal' : 'Vertical'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.placeButton} onPress={handlePlacePlane}>
                                    <Text style={styles.placeButtonText}>Place</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Text style={styles.backButtonText}>Back to Games</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.submitButton, { backgroundColor: isSubmitEnabled ? '#007bff' : '#ccc' }]} onPress={handleSubmit} disabled={!isSubmitEnabled}>
                                <Text style={styles.submitButtonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                        {gameDetails && (
                            <View style={styles.detailsContainer}>
                                <Text style={styles.detailText}>Game ID: {gameDetails.id}</Text>
                                <Text style={styles.detailText}>Status: {gameDetails.status}</Text>
                                <Text style={styles.detailText}>Player 1: {gameDetails.player1?.email}</Text>
                                <Text style={styles.detailText}>Player 2: {gameDetails.player2 ? gameDetails.player2.email : 'Waiting for player'}</Text>
                                <Text style={styles.detailText}>Player to Move: {gameDetails.playerToMoveId === gameDetails.player1Id ? gameDetails.player1?.email : gameDetails.player2?.email || 'N/A'}</Text>
                            </View>
                        )}
                    </>
                )}
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
    planesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    planeButton: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    planeImage: {
        width: 50,
        height: 50,
    },
    planeText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    plane1Color: {
        width: 20,
        height: 20,
        backgroundColor: '#007bff',
        marginTop: 5,
    },
    plane2Color: {
        width: 20,
        height: 20,
        backgroundColor: '#28a745',
        marginTop: 5,
    },
    plane3Color: {
        width: 20,
        height: 20,
        backgroundColor: '#6f42c1',
        marginTop: 5,
    },
    plane4Color: {
        width: 20,
        height: 20,
        backgroundColor: '#ff6347',
        marginTop: 5,
    },
    planePlacementContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
        width: 50,
        textAlign: 'center',
    },
    verticalToggle: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginHorizontal: 5,
    },
    placeButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    placeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
    plane1Cell: {
        backgroundColor: '#007bff',
    },
    plane2Cell: {
        backgroundColor: '#28a745',
    },
    plane3Cell: {
        backgroundColor: '#6f42c1',
    },
    plane4Cell: {
        backgroundColor: '#ff6347',
    },
    cellText: {
        fontSize: 12,
        color: '#495057',
    },
    actionsContainer: {
        width: width * 0.9,
        marginBottom: 20,
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
    submitButton: {
        backgroundColor: '#007bff',
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        alignItems: 'center',
    },
    submitButtonText: {
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
