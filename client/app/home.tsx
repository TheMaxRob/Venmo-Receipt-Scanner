import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Item, Friend } from 'types';
import FriendsModal from './components/friendsModal';
import FriendCard from './components/friendCard';
import ItemsModal from './itemsModal';
import { useDataContext } from './DataContext';

export default function Home() {
  const { items, setItems, friends, setFriends } = useDataContext();

  const [displayedItems, setDisplayedItems] = useState<Item[]>(items);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>(friends);

  // Manage which item the user has "selected" to assign
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Modals
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [itemsModalVisible, setItemsModalVisible] = useState(false);


  // When user taps an item in displayedItems
  const handleSelectItem = (item: Item) => {
    // Set the tapped item as 'selectedItem'
    if (item === selectedItem) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };


  const handleFriendPress = (friend: Friend) => {
    if (!selectedItem) return; // no item is selected

    // Remove that item from displayedItems
    setDisplayedItems((prev) => prev.filter((it) => it !== selectedItem));

    // Add that item to the friend’s items array
    setSelectedFriends((prev) => {
      return prev.map((f) => {
        if (f.username === friend.username) {
          // Ensure the friend's 'items' array is defined
          const updatedItems = f.items ? [...f.items, selectedItem] : [selectedItem];
          const updatedPrice = selectedItem.cost + f.amount;
          return { ...f, items: updatedItems, amount: updatedPrice };
        }
        return f;
      });
    });

    // Clear the selectedItem
    setSelectedItem(null);
  };


  // Modals
  const handleOpenFriendsModal = () => setFriendsModalVisible(true);
  const handleOpenItemsModal = () => setItemsModalVisible(true);

  const handleCloseFriendsModal = (highlightedFriends: Friend[]) => {
    const updated = highlightedFriends.map((f) => ({
      ...f,
      items: f.items ?? [], 
    }));

    setSelectedFriends(updated);
    setFriendsModalVisible(false);
  };

  const handleCloseItemsModal = (newItems: Item[]) => {
    setDisplayedItems(newItems);
    setItemsModalVisible(false);
  };



  const handleReview = () => {
    setItems(displayedItems);
    setFriends(selectedFriends);
    router.push("/review");
  };



  return (
    <View style={styles.container}>
      <View style={styles.listsContainer}>
        {/* Items from Scanner */}
        <View style={styles.itemsContainer}>
          <TouchableOpacity
            style={styles.itemsButton}
            onPress={handleOpenItemsModal}
          >
            <Text>Add Item +</Text>
          </TouchableOpacity>

          {displayedItems.map((item, index) => {
            const isSelected = selectedItem === item;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.itemTouchable,
                  isSelected && styles.selectedItemBackground,
                ]}
                onPress={() => handleSelectItem(item)}
              >
                <Text style={styles.itemText}>
                  {item.item}
                </Text>
                <Text>
                  ${item.cost.toFixed(2)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalLine} />

        {/* Friends List */}
        <View style={styles.friendsContainer}>
          <TouchableOpacity
            style={styles.friendsButton}
            onPress={handleOpenFriendsModal}
          >
            <Text>Add Friends +</Text>
          </TouchableOpacity>

          <View style={styles.friendCardsContainer}>
            {selectedFriends.map((friend, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleFriendPress(friend)}
                >
                  <FriendCard friend={friend} size="small" />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Friends Modal */}
          {friendsModalVisible && (
            <FriendsModal
              modalVisible={friendsModalVisible}
              handleCloseModal={() => setFriendsModalVisible(false)}
            />
          )}

          {/* Items Modal */}
          {itemsModalVisible && (
            <ItemsModal
              modalVisible={itemsModalVisible}
              handleCloseModal={() => setItemsModalVisible(false)}
            />
          )}
        </View>
      </View>

      {/* Review Button */}
      <TouchableOpacity style={styles.reviewButton} onPress={handleReview}>
        <Text>Review and Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 48,
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  listsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  itemsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  itemTouchable: {
    margin: 8,
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  itemText: {
    fontSize: 14,
    color: 'black',
  },
  selectedItemBackground: {
    backgroundColor: '#B3D9FF',
  },
  verticalLine: {
    width: 1,
    backgroundColor: '#909090',
    marginHorizontal: 8,
  },
  friendsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 255, 0.1)',
    paddingHorizontal: 8,
  },
  friendsButton: {
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: 'blue',
    marginVertical: 8,
  },
  itemsButton: {
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: 'orange',
    marginVertical: 8,
  },
  reviewButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 8,
    paddingVertical: 12,
    margin: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  friendCardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  }
});

