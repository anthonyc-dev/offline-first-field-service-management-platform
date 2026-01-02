import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';

interface TaskCardProps {
  title: string;
  description?: string;
  status?: string;
}

export function TaskCard({ title, description, status }: TaskCardProps) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      {description && <ThemedText>{description}</ThemedText>}
      {status && <ThemedText type="link">{status}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
});

