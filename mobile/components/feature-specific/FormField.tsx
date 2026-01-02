import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput style={styles.input} {...inputProps} />
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  error: {
    color: 'red',
    marginTop: 4,
  },
});

