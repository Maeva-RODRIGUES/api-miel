import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';

interface HoneyDropAnimationProps {
  score: number;
}

export const HoneyDropAnimation: React.FC<HoneyDropAnimationProps> = ({ score }) => {
  const drop1 = useRef(new Animated.Value(0)).current;
  const drop2 = useRef(new Animated.Value(0)).current;
  const drop3 = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    
    const dropCount = score >= 80 ? 3 : score >= 50 ? 2 : 1;
    
    Animated.stagger(300, [
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(drop1, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      dropCount >= 2 ? Animated.timing(drop2, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }) : Animated.delay(0),
      dropCount >= 3 ? Animated.timing(drop3, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }) : Animated.delay(0),
    ]).start();
  }, [score]);

  const getDropColor = (score: number) => {
    if (score >= 80) return '#FFD700';
    if (score >= 50) return '#FFA500';
    return '#FF6347';
  };

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.View
        style={[
          styles.drop,
          { 
            backgroundColor: getDropColor(score),
            transform: [{ scale: drop1 }],
            left: '20%',
          },
        ]}
      />
      {score >= 50 && (
        <Animated.View
          style={[
            styles.drop,
            { 
              backgroundColor: getDropColor(score),
              transform: [{ scale: drop2 }],
              right: '20%',
              top: 30,
            },
          ]}
        />
      )}
      {score >= 80 && (
        <Animated.View
          style={[
            styles.drop,
            { 
              backgroundColor: getDropColor(score),
              transform: [{ scale: drop3 }],
              left: '50%',
              top: 60,
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    pointerEvents: 'none',
  },
  drop: {
    position: 'absolute',
    width: 12,
    height: 24,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});