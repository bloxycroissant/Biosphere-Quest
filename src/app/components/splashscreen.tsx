import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const TEASER_TIPS = [
  "🎮 Unlock 7 Interactive Science Minigames!",
  "📓 Collect Badges in Your Digital Notebook!",
  "🌍 Explore Earth's Biomes with Astro & Stella!",
  "🏆 Beat Timed Quizzes & Level Up!",
  "✨ Built for Grades 1–6 • MATATAG Ready!",
];

export default function SplashScreen(): React.JSX.Element {
  // Continuous Looping Animation Values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const reverseOrbitAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const twinkleAnim = useRef(new Animated.Value(0.3)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const teaserFade = useRef(new Animated.Value(1)).current;

  const [teaserIndex, setTeaserIndex] = useState<number>(0);

  useEffect(() => {
    // 1. Gentle Bouncy Float for Mascots
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -14,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 2. Smooth 360° Cosmic Orbit
    Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // 3. Counter-Rotating Biome Ring
    Animated.loop(
      Animated.timing(reverseOrbitAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // 4. Playful Heartbeat Pulse for Title & Glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.07,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 5. Twinkling Stardust Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0.25,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 6. Looping Bouncy Loader Shimmer
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 7. Teaser Text Cycle Loop
    const teaserInterval = setInterval(() => {
      Animated.timing(teaserFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setTeaserIndex((prev) => (prev + 1) % TEASER_TIPS.length);
        Animated.timing(teaserFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }, 1600);

    return () => clearInterval(teaserInterval);
  }, []);

  const spinClockwise = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spinCounterClockwise = reverseOrbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  const loaderTranslate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-90, 90],
  });

  return (
    <View style={styles.container}>
      {/* Twinkling Kid-Friendly Cosmic & Nature Stickers */}
      <Animated.Text
        style={[styles.sticker, styles.pos1, { opacity: twinkleAnim }]}
      >
        ✨
      </Animated.Text>
      <Animated.Text
        style={[styles.sticker, styles.pos2, { opacity: twinkleAnim }]}
      >
        🌟
      </Animated.Text>
      <Animated.Text
        style={[styles.sticker, styles.pos3, { opacity: twinkleAnim }]}
      >
        🪐
      </Animated.Text>
      <Animated.Text
        style={[styles.sticker, styles.pos4, { opacity: twinkleAnim }]}
      >
        🦋
      </Animated.Text>
      <Animated.Text
        style={[styles.sticker, styles.pos5, { opacity: twinkleAnim }]}
      >
        🌈
      </Animated.Text>

      {/* Outer Orbiting Biome Ring */}
      <Animated.View
        style={[styles.outerOrbit, { transform: [{ rotate: spinClockwise }] }]}
      >
        <View style={[styles.orbitBadge, styles.orbitTop]}>
          <Text style={styles.orbitEmoji}>🌲</Text>
        </View>
        <View style={[styles.orbitBadge, styles.orbitBottom]}>
          <Text style={styles.orbitEmoji}>🐠</Text>
        </View>
        <View style={[styles.orbitBadge, styles.orbitLeft]}>
          <Text style={styles.orbitEmoji}>火山</Text>
        </View>
        <View style={[styles.orbitBadge, styles.orbitRight]}>
          <Text style={styles.orbitEmoji}>🌻</Text>
        </View>
      </Animated.View>

      {/* Inner Counter-Rotating Ring */}
      <Animated.View
        style={[
          styles.innerOrbit,
          { transform: [{ rotate: spinCounterClockwise }] },
        ]}
      />

      {/* Pulsing Aura Behind Mascots */}
      <Animated.View
        style={[styles.auraCircle, { transform: [{ scale: pulseAnim }] }]}
      />

      {/* Floating Astro & Stella Explorer Emblem */}
      <Animated.View
        style={[
          styles.mascotBubble,
          { transform: [{ translateY: floatAnim }] },
        ]}
      >
        <View style={styles.mascotRow}>
          <Text style={styles.mascotEmoji}>🧑‍🚀</Text>
          <Text style={styles.planetCenter}>🌍</Text>
          <Text style={styles.mascotEmoji}>👩‍🚀</Text>
        </View>
        <View style={styles.mascotTag}>
          <Text style={styles.mascotTagText}>ASTRO & STELLA</Text>
        </View>
      </Animated.View>

      {/* Kid-Friendly Curriculum Pill */}
      <View style={styles.curriculumPill}>
        <Text style={styles.curriculumText}>
          🚀 Grades 1–6 Science Adventure
        </Text>
      </View>

      {/* Bouncy Title */}
      <Animated.View
        style={[styles.titleBlock, { transform: [{ scale: pulseAnim }] }]}
      >
        <Text style={styles.title}>Biosphere Quest</Text>
        <Text style={styles.subtitle}>Explore • Play • Discover Earth!</Text>
      </Animated.View>

      {/* Interactive App Teaser Card */}
      <View style={styles.teaserCard}>
        <Text style={styles.teaserHeader}>SNEAK PEEK INSIDE</Text>
        <Animated.Text style={[styles.teaserBody, { opacity: teaserFade }]}>
          {TEASER_TIPS[teaserIndex]}
        </Animated.Text>
      </View>

      {/* Looping Bouncy Progress Bar */}
      <View style={styles.loaderSection}>
        <View style={styles.loaderTrack}>
          <Animated.View
            style={[
              styles.loaderRunner,
              { transform: [{ translateX: loaderTranslate }] },
            ]}
          />
        </View>
        <Text style={styles.loadingLabel}>Preparing Your Quest...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090b20",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  sticker: {
    position: "absolute",
    fontSize: 22,
  },
  pos1: { top: height * 0.11, left: width * 0.12 },
  pos2: { top: height * 0.15, right: width * 0.14 },
  pos3: { top: height * 0.36, left: width * 0.07 },
  pos4: { bottom: height * 0.32, right: width * 0.09 },
  pos5: { bottom: height * 0.24, left: width * 0.11 },

  outerOrbit: {
    position: "absolute",
    width: width * 0.88,
    height: width * 0.88,
    borderRadius: (width * 0.88) / 2,
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.25)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  orbitBadge: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(30, 41, 82, 0.9)",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
  },
  orbitTop: { top: -18 },
  orbitBottom: { bottom: -18 },
  orbitLeft: { left: -18 },
  orbitRight: { right: -18 },
  orbitEmoji: { fontSize: 18 },

  innerOrbit: {
    position: "absolute",
    width: width * 0.62,
    height: width * 0.62,
    borderRadius: (width * 0.62) / 2,
    borderWidth: 1.5,
    borderColor: "rgba(250, 204, 21, 0.28)",
  },
  auraCircle: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(56, 189, 248, 0.16)",
  },

  mascotBubble: {
    width: 165,
    height: 135,
    borderRadius: 36,
    backgroundColor: "rgba(24, 34, 76, 0.92)",
    borderWidth: 3,
    borderColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 10,
  },
  mascotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  mascotEmoji: {
    fontSize: 38,
  },
  planetCenter: {
    fontSize: 44,
  },
  mascotTag: {
    marginTop: 6,
    backgroundColor: "#facc15",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  mascotTagText: {
    color: "#090b20",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  curriculumPill: {
    backgroundColor: "rgba(192, 132, 252, 0.22)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#c084fc",
    marginBottom: 12,
  },
  curriculumText: {
    color: "#f3e8ff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  titleBlock: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "#38bdf8",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#facc15",
    marginTop: 4,
    letterSpacing: 0.8,
  },

  teaserCard: {
    width: "92%",
    backgroundColor: "rgba(15, 23, 56, 0.88)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.45)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 28,
  },
  teaserHeader: {
    fontSize: 10,
    fontWeight: "900",
    color: "#38bdf8",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  teaserBody: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },

  loaderSection: {
    position: "absolute",
    bottom: 48,
    width: width * 0.65,
    alignItems: "center",
  },
  loaderTrack: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderRunner: {
    width: 95,
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#facc15",
  },
  loadingLabel: {
    color: "#bae6fd",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
});
