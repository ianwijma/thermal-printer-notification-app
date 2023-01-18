import { StatusBar } from "expo-status-bar";
import AppIndex from "./app/index";
import { SafeAreaView } from "react-native";

export default function App () {
  return (
    <SafeAreaView style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <AppIndex />
      <StatusBar style="auto" />
    </SafeAreaView>
  )
}
