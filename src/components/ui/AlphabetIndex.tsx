import { memo, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Text, GestureResponderEvent, PanResponder } from 'react-native';
import { useTheme } from 'react-native-paper';

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface AlphabetIndexProps {
  onLetterPress: (letter: string) => void;
}

export const AlphabetIndex = memo(function AlphabetIndex({ onLetterPress }: AlphabetIndexProps) {
  const theme = useTheme();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent.locationY),
      onPanResponderMove: (evt) => handleTouch(evt.nativeEvent.locationY),
    })
  ).current;

  const handleTouch = useCallback((y: number) => {
    const itemHeight = 14;
    const index = Math.floor(y / itemHeight);
    if (index >= 0 && index < ALPHABET.length) {
      onLetterPress(ALPHABET[index]);
    }
  }, [onLetterPress]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {ALPHABET.map((letter) => (
        <Pressable
          key={letter}
          onPress={() => onLetterPress(letter)}
          style={styles.letterButton}
        >
          <Text
            style={[
              styles.letter,
              { color: theme.colors.primary },
            ]}
          >
            {letter}
          </Text>
        </Pressable>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  letterButton: {
    width: 20,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 10,
    fontWeight: '600',
  },
});
