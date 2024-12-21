import { Item } from "types";
import { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";

const ItemCard = forwardRef<View, { item: Item, size: string }>(({ item, size }, ref) => {
    const containerStyle =
      size === "small" ? styles.smallContainer : styles.largeContainer;
    const usernameStyle =
      size === "small" ? styles.smallUsernameText : styles.largeUsernameText;
    const moneyStyle =
      size === "small" ? styles.smallMoneyText : styles.largeMoneyText;
  
    return (
        <View
          style={containerStyle}
          ref={ref}
        >
          <Text style={usernameStyle}>{item.item}:</Text>
          <Text style={moneyStyle}> ${item.cost} </Text>
        </View>
    );
  });
  
  const styles = StyleSheet.create({
    smallContainer: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: 5,
      shadowColor: "black",
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.1,
    },
    largeContainer: {
      flexDirection: "row",
      padding: 12,
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 16,
      backgroundColor: "white",
      borderRadius: 10,
      shadowColor: "black",
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 0.3,
    },
    smallUsernameText: {
      fontSize: 12,
      fontWeight: "bold",
    },
    largeUsernameText: {
      fontSize: 20,
      fontWeight: "bold",
    },
    smallMoneyText: {
      fontSize: 12,
      fontStyle: "italic",
    },
    largeMoneyText: {
      fontSize: 16,
      fontStyle: "italic",
    }
  });
  
  export default ItemCard;
  