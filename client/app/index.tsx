import Camera from "./camera";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        //justifyContent: "center",
        //alignItems: "center",
      }}
    >
      <Camera />
    </View>
  );
}
