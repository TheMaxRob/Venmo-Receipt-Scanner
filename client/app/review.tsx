import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Friend, Item } from 'types';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDataContext } from './DataContext';

interface PaymentRequestItem {
  assigned_to: string;
  cost: number;
  item: string;
}

export default function Review() {

  const { friends, items } = useDataContext();
  
  const router = useRouter();


  const handleBackButtonPress = () => {
    router.push("/home");
  }

  const handlePayments = async () => {
    try {
      const assignedItems: PaymentRequestItem[] = [];
      friends.forEach((friend) => {
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
  
      console.log("Payment request response:", response.data);
    } catch (error) {
      console.error("Error requesting payments", error);
    }
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{ flex: 1 }}>
      <Pressable style={styles.backButton} onPress={handleBackButtonPress}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <ScrollView style={styles.container}>
        {friends.map((friend, friendIndex) => {
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
          <Text style={styles.confirmButtonText}>Request Payments</Text>
        </Pressable>
      </ScrollView>
    </View>
    </SafeAreaView>
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
    backgroundColor: '#007BFF', 
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center', 
    marginTop: 20,
    elevation: 3, 
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FF5A5F', 
    padding: 10,
    borderRadius: 20,
    elevation: 3,
    zIndex: 10,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    zIndex: 10
  },
});
