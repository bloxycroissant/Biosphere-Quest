import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const ASTRO_IMG = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const STELLA_IMG = require("../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");

const FUN_FACTS = [
  "💡 Plants drink water through their roots like a giant straw!",
  "🌟 Stars twinkling at night are actually burning balls of gas millions of miles away!",
  "🐝 Bees do a funny waggle dance to tell friends where the best flowers are!",
  "🪐 Jupiter is so massive that all other planets in our solar system could fit inside it!",
  "🌱 Seeds can sleep underground for months before waking up as little green sprouts!",
  "⚡ Lightning is hotter than the surface of the sun!",
];

interface ChildFriendlyLoaderProps {
  message?: string;
}

export default function ChildFriendlyLoader({
  message = "Loading your exciting adventure...",
}: ChildFriendlyLoaderProps): React.JSX.Element {
  const bounceAstro = useRef(new Animated.Value(0)).current;
  const bounceStella = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const starTwinkle = useRef(new Animated.Value(0.2)).current;
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    // Mascot Bouncing Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAstro, {
          toValue: -15,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAstro, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceStella, {
          toValue: -15,
          duration: 650,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounceStella, {
          toValue: 0,
          duration: 650,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Pulsing Logo/Card
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.04,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Infinite Loading Bar Progress
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    ).start();

    // Twinkling Stars
    Animated.loop(
      Animated.sequence([
        Animated.timing(starTwinkle, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(starTwinkle, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Rotate Fun Facts every 4 seconds
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 4000);

    return () => clearInterval(factInterval);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Floating Sparkles & Stars background elements */}
      <Animated.Text
        style={[
          styles.floatingStar,
          { top: 80, left: 40, opacity: starTwinkle },
        ]}
      >
        ⭐
      </Animated.Text>
      <Animated.Text
        style={[
          styles.floatingStar,
          { top: 120, right: 50, opacity: starTwinkle },
        ]}
      >
        ✨
      </Animated.Text>
      <Animated.Text
        style={[
          styles.floatingStar,
          { bottom: 150, left: 60, opacity: starTwinkle },
        ]}
      >
        🌟
      </Animated.Text>

      {/* Mascot Pair */}
      <View style={styles.mascotRow}>
        <Animated.Image
          source={ASTRO_IMG}
          style={[styles.mascot, { transform: [{ translateY: bounceAstro }] }]}
          resizeMode="contain"
        />
        <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
          <Text style={styles.rocketEmoji}>🚀</Text>
        </Animated.View>
        <Animated.Image
          source={STELLA_IMG}
          style={[styles.mascot, { transform: [{ translateY: bounceStella }] }]}
          resizeMode="contain"
        />
      </View>

      {/* Title & Status Message */}
      <Text style={styles.title}>Biosphere Quest</Text>
      <Text style={styles.message}>{message}</Text>

      {/* Child-Friendly Animated Progress Bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressFill, { width: progressWidth }]}
        />
      </View>

      {/* Rotating Fun Science Fact Card */}
      <View style={styles.factCard}>
        <Text style={styles.factHeader}>🧠 DID YOU KNOW?</Text>
        <Text style={styles.factText}>{FUN_FACTS[factIndex]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0b0f29",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 999,
  },
  floatingStar: {
    position: "absolute",
    fontSize: 24,
  },
  mascotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  mascot: {
    width: 80,
    height: 100,
  },
  rocketEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1,
    marginBottom: 6,
    textShadowColor: "#6366f1",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  message: {
    fontSize: 14,
    fontWeight: "700",
    color: "#cbd5e1",
    marginBottom: 28,
    textAlign: "center",
  },
  progressTrack: {
    width: Math.min(width * 0.75, 300),
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1.5,
    borderColor: "#818cf8",
    overflow: "hidden",
    marginBottom: 32,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 7,
  },
  factCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "rgba(21, 27, 74, 0.9)",
    borderWidth: 1.5,
    borderColor: "#c084fc",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#c084fc",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  factHeader: {
    fontSize: 11,
    fontWeight: "900",
    color: "#c084fc",
    letterSpacing: 1,
    marginBottom: 6,
  },
  factText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 18,
  },
});
