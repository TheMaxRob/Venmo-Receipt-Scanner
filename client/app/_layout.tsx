import { Slot, Stack } from "expo-router";
import Camera from "./components/camera";
import { DataProvider } from "./DataContext";

export default function RootLayout() {
  console.log("RootLayout is wrapping Slot with DataProvider");
  return (
   <DataProvider>
    <Slot />
   </DataProvider> 
  );
}
