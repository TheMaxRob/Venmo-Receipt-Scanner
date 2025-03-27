import React, { useEffect, useState } from "react";
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Friend } from "types";
import FriendCard from "./friendCard";
import { useDataContext } from "../DataContext"; // <-- Import the custom hook

type FriendsModalProps = {
  modalVisible: boolean;
  handleCloseModal: () => void; 
};

const FriendsModal: React.FC<FriendsModalProps> = ({
  modalVisible,
  handleCloseModal,
}) => {
  const { friends, setFriends } = useDataContext();

  const [allFriends, setAllFriends] = useState<Friend[]>([]);

  const [highlightedFriends, setHighlightedFriends] = useState<Friend[]>(friends);

  useEffect(() => {
    async function fetchFriends() {
      try {
        const response = await axios.get<{ friends: string[] }>(
          "http://192.168.1.176:5000/get-friends-list"
        );
        const fetchedUsernames = response.data.friends;
  
        // Build the uniqueFriends array
        const uniqueFriends: Friend[] = Array.from(
          new Map(
            fetchedUsernames.map((username: string) => [
              username,
              { username, items: [], amount: 0, isSelected: false } as Friend,
            ])
          ).values()
        );
  
        // Mark them as selected if they're in highlightedFriends
        const updatedFriends = uniqueFriends.map((f) => {
          const isInHighlighted = highlightedFriends.some(
            (selected) => selected.username === f.username
          );
          return { ...f, isSelected: isInHighlighted };
        });
  
        setAllFriends(updatedFriends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
  
    fetchFriends();
  }, []);
  
  // Toggle a friend in or out of "highlightedFriends"
  const handleSelectFriend = (friend: Friend) => {
    setHighlightedFriends((prev) => {
      const isAlreadySelected = prev.some(
        (selectedFriend) => selectedFriend.username === friend.username
      );
      // Toggle
      if (isAlreadySelected) {
        return prev.filter((f) => f.username !== friend.username);
      } else {
        return [...prev, { ...friend, isSelected: true }];
      }
    });

    // Also update allFriends for immediate visual feedback
    setAllFriends((prev) =>
      prev.map((f) =>
        f.username === friend.username
          ? { ...f, isSelected: !f.isSelected }
          : f
      )
    );
  };

  // Called when user taps "Save" or closes the modal
  const handleSave = () => {
    // Update context with the newly selected friends
    setFriends(highlightedFriends);
    
    // Then close the modal
    handleCloseModal();
  };
  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleSave}
        >
          <SafeAreaView style={styles.modalContainer}>
            {/* "Save" button */}
            <Pressable style={styles.closeButton} onPress={handleSave}>
              <Text style={styles.closeText}>Save</Text>
            </Pressable>

            {allFriends.length > 0 ? (
              allFriends.map((friend: Friend, index) => (
                <Pressable key={index} onPress={() => handleSelectFriend(friend)}>
                  <FriendCard friend={friend} size="large" />
                </Pressable>
              ))
            ) : (
              <Text>Loading Friends...</Text>
            )}
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default FriendsModal;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    backgroundColor: "blue",
    borderRadius: 5,
    marginBottom: 16,
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
  },
});
