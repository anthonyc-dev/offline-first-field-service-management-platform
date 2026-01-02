import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Task Details</ThemedText>
      <ThemedText>Task ID: {id}</ThemedText>
      {/* Add task detail view here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
