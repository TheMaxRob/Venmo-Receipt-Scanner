import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Camera from './app/camera';

export default function App() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
