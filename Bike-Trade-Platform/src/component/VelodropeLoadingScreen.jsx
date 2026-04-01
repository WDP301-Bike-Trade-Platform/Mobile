import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Dimensions } from 'react-native';
import { Svg, Circle, Line, Path, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Create animated versions of SVG components
const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * VelodropeLoadingScreen - Premium loading screen with animated bicycle
 * Usage: <VelodropeLoadingScreen visible={loading} />
 */
export const VelodropeLoadingScreen = ({ visible = false }) => {
  const wheelRotation1 = useRef(new Animated.Value(0)).current;
  const wheelRotation2 = useRef(new Animated.Value(0)).current;
  const pulseScale1 = useRef(new Animated.Value(1)).current;
  const pulseScale2 = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Wheel Rotation Animation (0.8s loop)
    const wheelAnim = Animated.loop(
      Animated.timing(wheelRotation1, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    wheelAnim.start();

    // Second wheel starts at offset
    Animated.loop(
      Animated.timing(wheelRotation2, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse Animation
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale1, {
          toValue: 1.2,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale1, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.start();

    // Second pulse with delay
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale2, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale2, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress Bar Animation
    Animated.loop(
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    ).start();

    return () => {
      wheelAnim.stop();
    };
  }, [visible]);

  if (!visible) return null;

  const wheelRotationInterpolate1 = wheelRotation1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const wheelRotationInterpolate2 = wheelRotation2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['15%', '65%', '85%'],
  });

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#f6f8f9',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      {/* Subtle Background Circles */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.03,
        }}
      >
        <Svg width={width * 1.5} height={width * 1.5} viewBox="0 0 500 500">
          <Circle cx="250" cy="250" r="375" stroke="#0047AB" strokeWidth="1" fill="none" />
          <Circle cx="250" cy="250" r="250" stroke="#0047AB" strokeWidth="1" fill="none" />
          <Circle cx="250" cy="250" r="125" stroke="#0047AB" strokeWidth="1" fill="none" />
        </Svg>
      </View>

      {/* Center Content */}
      <View style={{ alignItems: 'center', gap: 48 }}>
        {/* Bicycle Icon with Animations */}
        <View style={{ alignItems: 'center', position: 'relative' }}>
          {/* Pulse Ring 1 */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              borderRadius: 80,
              borderWidth: 1,
              borderColor: 'rgba(0, 71, 171, 0.1)',
              transform: [{ scale: pulseScale1 }],
              opacity: 0.5,
            }}
          />

          {/* Pulse Ring 2 */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: 'rgba(0, 71, 171, 0.05)',
              transform: [{ scale: pulseScale2 }],
              opacity: 0.3,
            }}
          />

          {/* Main Icon Container */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#f1f3f4',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            {/* Bicycle SVG */}
            <Svg width="96" height="64" viewBox="0 0 100 60" style={{ overflow: 'visible' }}>
              {/* Frame */}
              <Path
                d="M30 45 L50 20 L75 20 M50 20 L40 35 M75 20 L80 45 M30 45 L15 20 L35 20"
                stroke="#0047AB"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Handlebar */}
              <Path
                d="M75 20 L78 12 L85 12"
                stroke="#0047AB"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Seat */}
              <Path
                d="M35 20 L28 20"
                stroke="#0047AB"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Rear Wheel (Animated) */}
              <G>
                <AnimatedG
                  style={{
                    transform: [{ rotate: wheelRotationInterpolate1 }],
                    transformOrigin: '30 45',
                  }}
                >
                  <Circle cx="30" cy="45" r="12" stroke="#0047AB" strokeWidth="2.5" fill="none" />
                  <Line x1="30" x2="30" y1="33" y2="57" stroke="#0047AB" strokeWidth="1.5" />
                  <Line x1="18" x2="42" y1="45" y2="45" stroke="#0047AB" strokeWidth="1.5" />
                </AnimatedG>
              </G>

              {/* Front Wheel (Animated) - Offset */}
              <G>
                <AnimatedG
                  style={{
                    transform: [{ rotate: wheelRotationInterpolate2 }],
                    transformOrigin: '80 45',
                  }}
                >
                  <Circle cx="80" cy="45" r="12" stroke="#0047AB" strokeWidth="2.5" fill="none" />
                  <Line x1="80" x2="80" y1="33" y2="57" stroke="#0047AB" strokeWidth="1.5" />
                  <Line x1="68" x2="92" y1="45" y2="45" stroke="#0047AB" strokeWidth="1.5" />
                </AnimatedG>
              </G>
            </Svg>
          </View>
        </View>

        {/* Typography & Progress */}
        <View style={{ alignItems: 'center', gap: 24, width: '100%', paddingHorizontal: 24 }}>
          {/* Branding */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: '#0047AB',
              letterSpacing: -1,
            }}
          >
            Bike Trade
          </Text>

          {/* Loading State Messaging */}
          <View style={{ alignItems: 'center', gap: 12, width: '100%' }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '500',
                color: '#2c4e69',
                letterSpacing: 3,
                textTransform: 'uppercase',
              }}
            >
              Đang tải...
            </Text>

            {/* Progress Bar */}
            <View
              style={{
                width: '100%',
                height: 4,
                backgroundColor: '#e5e7e8',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Animated.View
                style={{
                  height: '100%',
                  backgroundColor: '#0047AB',
                  borderRadius: 2,
                  width: progressBarWidth,
                }}
              >
                {/* Shimmer Effect */}
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    transform: [
                      {
                        translateX: Animated.multiply(progressWidth, 100),
                      },
                    ],
                  }}
                />
              </Animated.View>
            </View>
          </View>
        </View>
      </View>

      {/* Footer Tagline */}
      <Text
        style={{
          position: 'absolute',
          bottom: 24,
          fontSize: 10,
          letterSpacing: 2,
          color: 'rgba(0, 71, 171, 0.3)',
          textTransform: 'uppercase',
        }}
      >
        The Kinetic Atelier — Est. 2024
      </Text>
    </View>
  );
};

export default VelodropeLoadingScreen;
