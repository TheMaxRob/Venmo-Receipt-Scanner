import React, { useEffect, useState } from "react";
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import axios, { all } from "axios";
import { Friend } from "types";
import FriendCard from "./friendCard";
import { Item } from "types";

type FriendsModalProps = {
  modalVisible: boolean;
  handleCloseModal: (highlightedFriends: Friend[]) => void;
};

const FriendsModal: React.FC<FriendsModalProps> = ({
  modalVisible,
  handleCloseModal,
}) => {
  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [highlightedFriends, setHighlightedFriends] = useState<Friend[]>([]);

  useEffect(() => {
    async function fetchFriends() {
      console.log("fetchFriends called");
      try {
        console.log("fetching friends...");
        const response = await axios.get("http://192.168.1.176:5000/get-friends-list");
        console.log("response received from server");
        const friends = response.data.friends;
        console.log("Friends fetched from Venmo:", friends);
        
        friends.forEach((friend: string) => {
          const friendObject: Friend = {
            username: friend,
            items: [],
            amount: 0,
            isSelected: false,
          }
          setAllFriends((prev) => [
            ...prev,
            friendObject
          ]);
        });
        console.log("allFriends Array:", allFriends);
        console.log("highlightedFriends array:", highlightedFriends);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Axios Error:', error.message);
          console.error('Error Code:', error.code);
          console.error('Error Config:', error.config);
        } else {
          console.error('Unknown Error:', error);
        }
      }
    }
    fetchFriends();
  }, [highlightedFriends]);

  const handleSelectFriend = (friend: Friend) => {
    console.log("friend passed to handleSelectFriend:", friend);
    friend.isSelected = !friend.isSelected;
    setHighlightedFriends((prev) =>
      prev.includes(friend)
        ? prev.filter((thisFriend) => thisFriend !== friend)
        : [...prev,  friend]
    );
    console.log("new highlightedFriends:", highlightedFriends);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible} 
        onRequestClose={() => handleCloseModal(highlightedFriends)} 
      >
        <SafeAreaView style={styles.modalContainer}>
          <Pressable style={styles.closeButton} onPress={() => handleCloseModal(highlightedFriends)}>
            <Text style={styles.closeText}>Save</Text>
          </Pressable>
          {allFriends.length > 0 ? (
            allFriends.map((friend: Friend, index) => (
              <Pressable key={index} onPress={() => handleSelectFriend(friend)}>
                <FriendCard friend={friend} size="large"/> 
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
  usernameDisplay: {
    color: 'black',
  }
});

export default FriendsModal;
