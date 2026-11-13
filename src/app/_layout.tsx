import { LinearGradient } from "expo-linear-gradient";
import {
  DarkTheme,
  DefaultTheme,
  Slot,
  ThemeProvider,
  usePathname,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

import AppTabs from "@/components/mobile-navigation";
import { ProgressProvider } from "@/hooks/use-progress";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

const USE_NATIVE_DRIVER = Platform.OS !== "web";
const { width } = Dimensions.get("window");

// Custom Assets
const ASTRO_IMG = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const STELLA_IMG = require("../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");
const LOGO_IMG = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const CLICK_SFX = require("../../assets/BiosphereQuestSoundEffectsandMusic/BiosphereQuestSFX/Button_Click_SFX.mp3");

const TEASER_TIPS = [
  "🎮 Unlock 7 Interactive Science & Math Minigames!",
  "📓 Collect Badges & Notes in Your Digital Notebook!",
  "🌍 Explore Earth's Biomes with Astro & Stella!",
  "🏆 Beat Timed Quizzes & Climb Leaderboards!",
  "📅 Stay on Track with Your Study Scheduler!",
  "✨ Built for Grades 1–6 • MATATAG Ready!",
];

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Biosphere Quest!",
    desc: "Your interactive science adventure for Grades 1–6. Let's show you around!",
    icon: "🌟",
  },
  {
    title: "🎮 Minigames & Quizzes",
    desc: "Play 7 exciting gamified lessons to master ecosystems, recycling, and biology.",
    icon: "🚀",
  },
  {
    title: "📓 Digital Notebook",
    desc: "All your badges, vocabulary, and mission notes are automatically saved here.",
    icon: "📚",
  },
  {
    title: "📅 Study Scheduler",
    desc: "Plan your learning sessions and track your daily XP growth effortlessly.",
    icon: "⏰",
  },
];

export default function RootLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);

  useEffect(() => {
    const hideNativeSplash = async () => {
      if (Platform.OS === "web") return;
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.log("Error hiding splash screen:", e);
      }
    };
    hideNativeSplash();
  }, []);

  const isWelcomeOrAuth =
    pathname === "/" ||
    pathname === "/welcome" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/verifyEmail" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-code" ||
    pathname === "/new-password";

  const isParentRoute =
    pathname.includes("/parent-dashboard") || pathname.startsWith("/parent");

  const isStudentTabRoute =
    pathname.includes("/home") ||
    pathname.includes("/courses") ||
    pathname.includes("/games") ||
    pathname.includes("/profile") ||
    pathname === "/(tabs)/home" ||
    pathname === "/(tabs)/courses" ||
    pathname === "/(tabs)/games" ||
    pathname === "/(tabs)/profile";

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ProgressProvider>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#0b0f29", "#151b4a", "#0d2847"]}
          style={styles.background}
        >
          {isWelcomeOrAuth || isParentRoute || !isStudentTabRoute ? (
            <AnimatedRoute />
          ) : (
            <AppTabs />
          )}

          {isSplashActive && (
            <View style={[StyleSheet.absoluteFill, styles.splashOverlay]}>
              <CustomSplashScreen onFinish={() => setIsSplashActive(false)} />
            </View>
          )}
        </LinearGradient>
      </ProgressProvider>
    </ThemeProvider>
  );
}

function CustomSplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}): React.JSX.Element {
  const floatAstro = useRef(new Animated.Value(0)).current;
  const floatStella = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const reverseOrbitAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const twinkleAnim = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const teaserFade = useRef(new Animated.Value(1)).current;

  const tutorialScale = useRef(new Animated.Value(0.8)).current;
  const tutorialFade = useRef(new Animated.Value(0)).current;

  // Set precisely to 15 seconds (15000ms)
  const SPLASH_DURATION_MS = 15000;
  const [teaserIndex, setTeaserIndex] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(15);

  const [poppedStars, setPoppedStars] = useState<number>(0);

  const [floatingStars, setFloatingStars] = useState<
    Array<{ id: number; x: number; y: number; scale: Animated.Value }>
  >([
    { id: 1, x: width * 0.2, y: 150, scale: new Animated.Value(1) },
    { id: 2, x: width * 0.75, y: 130, scale: new Animated.Value(1) },
    { id: 3, x: width * 0.15, y: 350, scale: new Animated.Value(1) },
    { id: 4, x: width * 0.8, y: 320, scale: new Animated.Value(1) },
  ]);

  const [burstParticles, setBurstParticles] = useState<
    Array<{
      id: string;
      x: number;
      y: number;
      animX: Animated.Value;
      animY: Animated.Value;
      opacity: Animated.Value;
    }>
  >([]);

  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialIndex, setTutorialIndex] = useState<number>(0);

  const playClickSfx = () => {
    try {
      if (typeof window !== "undefined") {
        const sfx = new (window as any).Audio(CLICK_SFX);
        sfx.volume = 0.9;
        sfx.play().catch(() => {});
      }
    } catch (e) {
      console.log("Click SFX error:", e);
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAstro, {
          toValue: -12,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(floatAstro, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatStella, {
          toValue: 10,
          duration: 1450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(floatStella, {
          toValue: -4,
          duration: 1450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ).start();

    Animated.loop(
      Animated.timing(reverseOrbitAnim, {
        toValue: 1,
        duration: 11000,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0.25,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SPLASH_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const teaserInterval = setInterval(() => {
      Animated.timing(teaserFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTeaserIndex((prev) => (prev + 1) % TEASER_TIPS.length);
        Animated.timing(teaserFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    const countdownInterval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(teaserInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const openTutorial = () => {
    playClickSfx();
    setShowTutorial(true);
    tutorialScale.setValue(0.5);
    tutorialFade.setValue(0);
    Animated.parallel([
      Animated.spring(tutorialScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(tutorialFade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  };

  const closeTutorial = () => {
    playClickSfx();
    setShowTutorial(false);
  };

  const nextTutorialStep = () => {
    playClickSfx();
    if (tutorialIndex < TUTORIAL_STEPS.length - 1) {
      Animated.sequence([
        Animated.timing(tutorialScale, {
          toValue: 0.92,
          duration: 100,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(tutorialScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
      setTutorialIndex((prev) => prev + 1);
    } else {
      setShowTutorial(false);
      onFinish();
    }
  };

  const handlePopBubbleStar = (
    id: number,
    starX: number,
    starY: number,
    starScale: Animated.Value,
  ) => {
    playClickSfx();
    setPoppedStars((prev) => prev + 150);

    Animated.sequence([
      Animated.timing(starScale, {
        toValue: 1.8,
        duration: 100,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(starScale, {
        toValue: 0,
        duration: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => {
      setFloatingStars((prev) => prev.filter((star) => star.id !== id));

      const newFragments = [0, 1, 2].map((i) => {
        const angle = (i * 2 * Math.PI) / 3;
        const dist = 50 + Math.random() * 30;
        const animX = new Animated.Value(0);
        const animY = new Animated.Value(0);
        const opacity = new Animated.Value(1);

        Animated.parallel([
          Animated.timing(animX, {
            toValue: Math.cos(angle) * dist,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(animY, {
            toValue: Math.sin(angle) * dist,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 450,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]).start();

        return {
          id: `${id}-frag-${i}-${Date.now()}`,
          x: starX,
          y: starY,
          animX,
          animY,
          opacity,
        };
      });

      setBurstParticles((prev) => [...prev, ...newFragments]);

      setTimeout(() => {
        setFloatingStars((current) => [
          ...current,
          {
            id: Date.now() + Math.random(),
            x: 60 + Math.random() * (width - 120),
            y: 120 + Math.random() * 260,
            scale: new Animated.Value(0),
          },
        ]);
      }, 1500);
    });
  };

  const spinClockwise = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spinCounterClockwise = reverseOrbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const runnerTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(width, 420) * 0.72],
  });

  return (
    <View style={styles.splashContainer}>
      <View style={styles.topBar}>
        <View />

        <View style={styles.rightTopControls}>
          <Pressable style={styles.tutorialBtn} onPress={openTutorial}>
            <Text style={styles.tutorialBtnText}>❓ How It Works</Text>
          </Pressable>

          <Pressable
            style={styles.skipBtn}
            onPress={() => {
              playClickSfx();
              onFinish();
            }}
          >
            <Text style={styles.skipBtnText}>Skip 🚀</Text>
          </Pressable>
        </View>
      </View>

      {floatingStars.map((star) => (
        <Pressable
          key={star.id}
          style={[styles.popBubbleItem, { left: star.x, top: star.y }]}
          onPress={() =>
            handlePopBubbleStar(star.id, star.x, star.y, star.scale)
          }
        >
          <Animated.View
            style={[
              styles.bubbleCircle,
              { transform: [{ scale: star.scale }] },
            ]}
          >
            <Animated.Text style={[styles.starEmoji, { opacity: twinkleAnim }]}>
              ⭐
            </Animated.Text>
          </Animated.View>
        </Pressable>
      ))}

      {burstParticles.map((frag) => (
        <Animated.View
          key={frag.id}
          style={[
            styles.fragmentItem,
            {
              left: frag.x,
              top: frag.y,
              opacity: frag.opacity,
              transform: [
                { translateX: frag.animX },
                { translateY: frag.animY },
              ],
            },
          ]}
        >
          <Text style={styles.fragmentEmoji}>✨</Text>
        </Animated.View>
      ))}

      <View style={styles.scoreBadge}>
        <Text style={styles.scoreText}>⭐ Bubble XP: +{poppedStars}</Text>
      </View>

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
          <Text style={styles.orbitEmoji}>🌋</Text>
        </View>
        <View style={[styles.orbitBadge, styles.orbitRight]}>
          <Text style={styles.orbitEmoji}>🌻</Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.innerOrbit,
          { transform: [{ rotate: spinCounterClockwise }] },
        ]}
      />

      <Animated.View
        style={[styles.auraCircle, { transform: [{ scale: pulseAnim }] }]}
      />

      <View style={styles.mascotShowcase}>
        <Animated.Image
          source={ASTRO_IMG}
          style={[
            styles.mascotImage,
            { transform: [{ translateY: floatAstro }] },
          ]}
          resizeMode="contain"
        />

        <Animated.Image
          source={LOGO_IMG}
          style={[styles.centerLogo, { transform: [{ scale: pulseAnim }] }]}
          resizeMode="contain"
        />

        <Animated.Image
          source={STELLA_IMG}
          style={[
            styles.mascotImage,
            { transform: [{ translateY: floatStella }] },
          ]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.curriculumPill}>
        <Text style={styles.curriculumText}>
          🚀 Grades 1–6 Science & Math Adventure
        </Text>
      </View>

      <Animated.View
        style={[styles.titleBlock, { transform: [{ scale: pulseAnim }] }]}
      >
        <Text style={styles.title}>Biosphere Quest</Text>
        <Text style={styles.subtitle}>
          Rocket your knowledge from Grade 1 to Grade 6
        </Text>
      </Animated.View>

      <View style={styles.teaserCard}>
        <Text style={styles.teaserHeader}>SNEAK PEEK INSIDE</Text>
        <Animated.Text style={[styles.teaserBody, { opacity: teaserFade }]}>
          {TEASER_TIPS[teaserIndex]}
        </Animated.Text>
      </View>

      <View style={styles.loaderSection}>
        <View style={styles.runnerTrackContainer}>
          <Animated.View
            style={[
              styles.runnerChaser,
              { transform: [{ translateX: runnerTranslateX }] },
            ]}
          >
            <Animated.Image
              source={STELLA_IMG}
              style={styles.runnerStellaImg}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <View style={styles.loaderTrack}>
          <Animated.View
            style={[styles.loaderFill, { width: progressWidth }]}
          />
        </View>
        <Text style={styles.loadingLabel}>
          Stella Racing... ({secondsLeft}s left) • Pop Star Bubbles! 🫧⭐
        </Text>
      </View>

      {showTutorial && (
        <Animated.View
          style={[styles.tutorialOverlay, { opacity: tutorialFade }]}
        >
          <Animated.View
            style={[
              styles.tutorialCard,
              { transform: [{ scale: tutorialScale }] },
            ]}
          >
            <Pressable style={styles.closeModalBtn} onPress={closeTutorial}>
              <Text style={styles.closeModalBtnText}>✕</Text>
            </Pressable>

            <Text style={styles.tutorialIcon}>
              {TUTORIAL_STEPS[tutorialIndex].icon}
            </Text>
            <Text style={styles.tutorialTitle}>
              {TUTORIAL_STEPS[tutorialIndex].title}
            </Text>
            <Text style={styles.tutorialDesc}>
              {TUTORIAL_STEPS[tutorialIndex].desc}
            </Text>

            <View style={styles.tutorialNavRow}>
              {tutorialIndex > 0 ? (
                <Pressable
                  style={styles.tutorialNavBtnSecondary}
                  onPress={() => {
                    playClickSfx();
                    setTutorialIndex((prev) => prev - 1);
                  }}
                >
                  <Text style={styles.tutorialNavBtnTextSecondary}>Back</Text>
                </Pressable>
              ) : (
                <View />
              )}

              <Pressable
                style={styles.tutorialNavBtnPrimary}
                onPress={nextTutorialStep}
              >
                <Text style={styles.tutorialNavBtnTextPrimary}>
                  {tutorialIndex < TUTORIAL_STEPS.length - 1
                    ? "Next ➔"
                    : "Let's Play! 🎉"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

function AnimatedRoute(): React.JSX.Element {
  const pathname = usePathname();
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entrance.setValue(0);
    Animated.spring(entrance, {
      toValue: 1,
      useNativeDriver: USE_NATIVE_DRIVER,
      tension: 55,
      friction: 9,
    }).start();
  }, [entrance, pathname]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: entrance,
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }),
          },
        ],
      }}
    >
      <Slot />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  splashOverlay: {
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: "#0b0f29",
  },
  splashContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  topBar: {
    position: "absolute",
    top: 42,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  rightTopControls: {
    flexDirection: "row",
    gap: 8,
  },
  tutorialBtn: {
    backgroundColor: "rgba(192, 132, 252, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#c084fc",
  },
  tutorialBtnText: {
    color: "#f3e8ff",
    fontSize: 11,
    fontWeight: "800",
  },
  skipBtn: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  popBubbleItem: {
    position: "absolute",
    zIndex: 15,
    padding: 8,
  },
  bubbleCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(250, 204, 21, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  starEmoji: {
    fontSize: 22,
  },
  fragmentItem: {
    position: "absolute",
    zIndex: 16,
  },
  fragmentEmoji: {
    fontSize: 16,
  },
  scoreBadge: {
    position: "absolute",
    top: 96,
    backgroundColor: "rgba(250, 204, 21, 0.18)",
    borderWidth: 1.5,
    borderColor: "#facc15",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    zIndex: 15,
  },
  scoreText: {
    color: "#fef08a",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  outerOrbit: {
    position: "absolute",
    width: Math.min(width, 420) * 0.82,
    height: Math.min(width, 420) * 0.82,
    borderRadius: (Math.min(width, 420) * 0.82) / 2,
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  orbitBadge: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(21, 27, 74, 0.9)",
    borderWidth: 1.5,
    borderColor: "#818cf8",
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
    width: Math.min(width, 420) * 0.56,
    height: Math.min(width, 420) * 0.56,
    borderRadius: (Math.min(width, 420) * 0.56) / 2,
    borderWidth: 1.5,
    borderColor: "rgba(250, 204, 21, 0.3)",
  },
  auraCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  mascotShowcase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 6,
  },
  mascotImage: {
    width: 95,
    height: 115,
  },
  centerLogo: {
    width: 110,
    height: 110,
  },
  curriculumPill: {
    backgroundColor: "rgba(192, 132, 252, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#c084fc",
    marginBottom: 8,
  },
  curriculumText: {
    color: "#f3e8ff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  titleBlock: {
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "#818cf8",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#cbd5e1",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  teaserCard: {
    width: "92%",
    maxWidth: 380,
    backgroundColor: "rgba(21, 27, 74, 0.85)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(99, 102, 241, 0.4)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  teaserHeader: {
    fontSize: 10,
    fontWeight: "900",
    color: "#818cf8",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  teaserBody: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  loaderSection: {
    position: "absolute",
    bottom: 36,
    width: Math.min(width, 420) * 0.78,
    alignItems: "center",
  },
  runnerTrackContainer: {
    width: "100%",
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  runnerChaser: {
    position: "absolute",
    left: 0,
    zIndex: 5,
  },
  runnerStellaImg: {
    width: 32,
    height: 32,
  },
  loaderTrack: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#818cf8",
    marginBottom: 6,
  },
  loaderFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#6366f1",
  },
  loadingLabel: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tutorialOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(11, 15, 41, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },
  tutorialCard: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: "#151b4a",
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#6366f1",
    padding: 24,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  closeModalBtn: {
    position: "absolute",
    top: 14,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 5,
  },
  closeModalBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  tutorialIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  tutorialTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  tutorialDesc: {
    fontSize: 14,
    fontWeight: "700",
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  tutorialNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  tutorialNavBtnSecondary: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  tutorialNavBtnTextSecondary: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
  tutorialNavBtnPrimary: {
    backgroundColor: "#6366f1",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  tutorialNavBtnTextPrimary: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 14,
  },
});
