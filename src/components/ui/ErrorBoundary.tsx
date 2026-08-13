import { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Something went wrong
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {error?.message || 'An unexpected error occurred'}
      </Text>
      <Button mode="contained" onPress={onReset} style={styles.button}>
        Try Again
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  button: {
    borderRadius: 20,
  },
});
