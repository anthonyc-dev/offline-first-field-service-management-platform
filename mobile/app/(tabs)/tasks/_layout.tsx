import { Stack } from "expo-router";
import "../../../styles/global.css";

export default function TasksLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Tasks", headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Task Details", headerShown: false }}
      />
    </Stack>
  );
}
