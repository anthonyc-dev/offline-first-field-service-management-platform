import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { StyleSheet } from "react-native";

export default function TasksScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tasks</ThemedText>
      {/* Add task list here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
