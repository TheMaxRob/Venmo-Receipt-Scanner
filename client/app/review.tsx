import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Friend, Item } from 'types';
import axios from 'axios';

interface PaymentRequestItem {
  assigned_to: string;
  cost: number;
  item: string;
}

export default function Review() {
  const { items } = useLocalSearchParams();
  const selectedFriends: Friend[] = items ? JSON.parse(items as string) : [];

  const handlePayments = async () => {
    try {
      const assignedItems: PaymentRequestItem[] = [];
      selectedFriends.forEach((friend) => {
        friend.items?.forEach((item) => {
          assignedItems.push({
            assigned_to: friend.username,
            cost: item.cost,
            item: item.item
          });
        });
      });
  
      const response = await axios.post(
        'http://192.168.1.176:5000/request-payments', 
        {
          assigned_items: assignedItems,
        }
      );
  
      console.log("pPayment request response:", response.data);
    } catch (error) {
      console.error("Error requesting payments", error);
    }
  }

  return (
    <ScrollView style={styles.container}>
      {selectedFriends.map((friend, friendIndex) => {
        const total = friend.items?.reduce((acc, item) => acc + (item.cost ?? 0), 0) ?? 0;
        return (
          <View key={friendIndex} style={styles.friendSection}>
            <Text style={styles.friendName}>{friend.username}</Text>

            {friend.items?.map((item, itemIndex) => (
              <Text key={itemIndex} style={styles.itemLine}>
                {item.item}: ${item.cost.toFixed(2)}
              </Text>
            ))}

            <Text style={styles.totalLine}>
              Total: <Text style={styles.bold}>${total.toFixed(2)}</Text>
            </Text>
          </View>
        );
      })}
      <Pressable style={styles.confirmButton} onPress={handlePayments}>
        <Text>Request Payments</Text>
      </Pressable>
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    paddingTop: 40, 
  },
  friendSection: {
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: '#F6F6F6',
    padding: 12,
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  itemLine: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  totalLine: {
    marginTop: 8,
    fontSize: 16,
    color: '#000',
  },
  bold: {
    fontWeight: 'bold',
  },
  confirmButton: {
    fontWeight: 'bold',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: 'red',
    maxWidth: 250,
  }
});
