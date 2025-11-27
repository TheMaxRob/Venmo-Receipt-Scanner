import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Item, Friend } from 'types';
import FriendsModal from './friendsModal';
import FriendCard from './friendCard';

export default function Home() {
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const { items } = useLocalSearchParams();
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Create an animated value for each item
  const itemPositions = useRef<{[key: number]: Animated.ValueXY}>(
    items ? JSON.parse(items as string).reduce((acc: any, _: any, index: number) => {
      acc[index] = new Animated.ValueXY();
      return acc;
    }, {}) : {}
  ).current;

  // Create pan responders for each item
  const itemPanResponders = useRef<{[key: number]: any}>(
    items ? JSON.parse(items as string).reduce((acc: any, _: any, index: number) => {
      acc[index] = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          setDraggingItem(index);
        },
        onPanResponderMove: Animated.event(
          [
            null,
            { 
              dx: itemPositions[index].x, 
              dy: itemPositions[index].y 
            }
          ],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: () => {
          // Reset position or perform any drop logic
          Animated.spring(itemPositions[index], {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
          }).start();
          setDraggingItem(null);
        }
      });
      return acc;
    }, {}) : {}
  ).current;

  const handleOpenModal = () => {
    setModalVisible(true);
  }

  const handleCloseModal = (highlightedFriends: Friend[]) => {
    setSelectedFriends(highlightedFriends);
    setModalVisible(false);
  }

  const parsedItems = items ? JSON.parse(items as string) : [];

  const handleReview = () => {
    router.push({
      pathname: '/review',
      params: { items: JSON.stringify(selectedFriends) },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.listsContainer}>
        {/* Items from Scanner */}
        <View style={styles.itemsContainer}>
          <TouchableOpacity style={styles.itemsButton}>
            <Text>Add Item +</Text>
          </TouchableOpacity>
          {parsedItems.map((item: Item, index: number) => (
            <Animated.View
              key={index}
              style={[
                styles.animatedItemContainer,
                { 
                  transform: [
                    { translateX: itemPositions[index].x },
                    { translateY: itemPositions[index].y }
                  ]
                }
              ]}
              {...itemPanResponders[index].panHandlers}
            >
              <Text style={styles.item}>
                {item.item}: ${item.cost.toFixed(2)}
              </Text>
            </Animated.View>
          ))}
        </View>
        
        <View style={styles.verticalLine}></View>
        
        {/* Friends List */}
        <View style={styles.friendsContainer}>
          <TouchableOpacity style={styles.friendsButton} onPress={handleOpenModal}>
            <Text>Add Friends +</Text>
          </TouchableOpacity>
          {selectedFriends.map((friend, index) => (
            <FriendCard key={index} friend={friend} size='small' />
          ))}
          {modalVisible && (
            <FriendsModal 
              modalVisible={modalVisible}
              handleCloseModal={handleCloseModal}
            /> 
          )}
        </View>
      </View>
      
      <TouchableOpacity style={styles.reviewButton} onPress={handleReview}>
        <Text>Review and Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    color: 'black',
    marginTop: 48,
  },
  listsContainer: {
    flexDirection: 'row',
  },
  itemsContainer: {
    backgroundColor: "rgba(0, 255, 0, 0.1)", 
  },
  item: {
    fontSize: 14,
    margin: 16,
    marginRight: 12,
    color: 'black',
    maxWidth: 160,
  },
  friendCard: {
    shadowColor: 'black',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    color: 'black',
  },
  friendsContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "rgba(0, 0, 255, 0.1)", 
    gap: 20,
  },
  friendsButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
  itemsButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: 'orange',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    color: 'black',
  },
  reviewButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 8,
    paddingVertical: 12,
    margin: 16,
    color: 'black',
    alignItems: 'center',
    borderRadius: 10,
  },
  verticalLine: {
    height: '100%',
    width: 1,
    backgroundColor: '#909090',
  },
  animatedItemContainer: {
    zIndex: 10,
  },

});
