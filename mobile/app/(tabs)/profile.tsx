import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      {/* Add profile/settings here */}
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-3xl text-blue-500">Welcome to Nativewind!</Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
