import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Splitter() {
  const { items } = useLocalSearchParams();

  const parsedItems = items ? JSON.parse(items as string) : [];

  type Item = {
    item: string;
    cost: number;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Splitter Screen</Text>
      {parsedItems.map((item: Item, index: number) => (
        <Text key={index} style={styles.item}>
          {item.item}: ${item.cost.toFixed(2)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    fontSize: 18,
    marginBottom: 8,
  },
});
