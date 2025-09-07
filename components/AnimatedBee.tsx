import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const AnimatedBee: React.FC = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: 30,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: -10,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: 10,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -30,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 10,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: -10,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
    };

    const animation = createAnimation();
    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX },
            { translateY },
            { rotate: rotate.interpolate({
                inputRange: [-10, 10],
                outputRange: ['-10deg', '10deg'],
              }) 
            },
          ],
        },
      ]}
    >
      <View style={styles.bee}>
        <View style={styles.beeBody} />
        <View style={styles.beeStripe1} />
        <View style={styles.beeStripe2} />
        <View style={styles.beeWing1} />
        <View style={styles.beeWing2} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 30,
    marginBottom: 20,
  },
  bee: {
    width: 40,
    height: 30,
    position: 'relative',
  },
  beeBody: {
    width: 24,
    height: 16,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    position: 'absolute',
    top: 7,
    left: 8,
  },
  beeStripe1: {
    width: 20,
    height: 3,
    backgroundColor: '#8B4513',
    borderRadius: 1.5,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  beeStripe2: {
    width: 18,
    height: 3,
    backgroundColor: '#8B4513',
    borderRadius: 1.5,
    position: 'absolute',
    top: 16,
    left: 11,
  },
  beeWing1: {
    width: 12,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 6,
    position: 'absolute',
    top: 2,
    left: 5,
    transform: [{ rotate: '15deg' }],
  },
  beeWing2: {
    width: 12,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 6,
    position: 'absolute',
    top: 2,
    right: 5,
    transform: [{ rotate: '-15deg' }],
  },
});