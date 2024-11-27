import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Friend } from "types";

type FriendCardProps = {
  friend: Friend;
  size?: "small" | "large"; 
};

const FriendCard = ({ friend, size = "large" }: FriendCardProps) => {
  const containerStyle =
    size === "small" ? styles.smallContainer : styles.largeContainer;
  const usernameStyle =
    size === "small" ? styles.smallUsernameText : styles.largeUsernameText;
  const moneyStyle =
    size === "small" ? styles.smallMoneyText : styles.largeMoneyText;

  return (
      <View
        style={friend.isSelected ? [containerStyle, styles.selected] : containerStyle}
      >
        <Text style={usernameStyle}>{friend.username}:</Text>
        <Text style={moneyStyle}> ${friend.amount} </Text>
      </View>
  );
};

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
  },
  selected: {
    backgroundColor: "lightblue",
  },
});

export default FriendCard;
