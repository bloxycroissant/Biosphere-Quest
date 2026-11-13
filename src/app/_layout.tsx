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
const { width, height } = Dimensions.get("window");

// Custom Assets
const ASTRO_IMG = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const STELLA_IMG = require("../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");
const LOGO_IMG = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const LOFI_AUDIO = require("../../assets/BiosphereQuestSoundEffectsandMusic/Lofi Splash Screen Official.mp3");
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
          colors={["#080b1e", "#1b2354", "#123c69"]}
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
  const stellaReachAnim = useRef(new Animated.Value(0)).current; // Stella catching stars animation
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const reverseOrbitAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const twinkleAnim = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const teaserFade = useRef(new Animated.Value(1)).current;

  const tutorialScale = useRef(new Animated.Value(0.8)).current;
  const tutorialFade = useRef(new Animated.Value(0)).current;

  // Exact 32-second track match
  const SPLASH_DURATION_MS = 32000;
  const [teaserIndex, setTeaserIndex] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(32);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(true);

  const audioRef = useRef<any>(null);

  const [poppedStars, setPoppedStars] = useState<number>(0);
  const [floatingStars, setFloatingStars] = useState<
    Array<{ id: number; x: number; y: number; scale: Animated.Value }>
  >([
    { id: 1, x: width * 0.2, y: height * 0.28, scale: new Animated.Value(1) },
    { id: 2, x: width * 0.75, y: height * 0.22, scale: new Animated.Value(1) },
    { id: 3, x: width * 0.15, y: height * 0.65, scale: new Animated.Value(1) },
    { id: 4, x: width * 0.8, y: height * 0.6, scale: new Animated.Value(1) },
  ]);

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
    try {
      if (typeof window !== "undefined") {
        audioRef.current = new (window as any).Audio(LOFI_AUDIO);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.7;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {
      console.log("Audio play error:", e);
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAstro, {
          toValue: -14,
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

    // Stella Reaching / Catching Motion Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(stellaReachAnim, {
          toValue: -18,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(stellaReachAnim, {
          toValue: 4,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(stellaReachAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatStella, {
          toValue: 12,
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
          toValue: 1.07,
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
          if (audioRef.current) audioRef.current.pause();
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(teaserInterval);
      clearInterval(countdownInterval);
      if (audioRef.current) audioRef.current.pause();
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
      if (audioRef.current) audioRef.current.pause();
      onFinish();
    }
  };

  const toggleMusic = () => {
    playClickSfx();
    try {
      if (!audioRef.current) return;
      if (isPlayingMusic) {
        audioRef.current.pause();
        setIsPlayingMusic(false);
      } else {
        audioRef.current.play();
        setIsPlayingMusic(true);
      }
    } catch (e) {
      console.log("Audio toggle error:", e);
    }
  };

  const handlePopStar = (id: number, starScale: Animated.Value) => {
    playClickSfx();
    Animated.sequence([
      Animated.timing(starScale, {
        toValue: 1.6,
        duration: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(starScale, {
        toValue: 0,
        duration: 150,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => {
      setPoppedStars((prev) => prev + 100);
      setFloatingStars((prev) => prev.filter((star) => star.id !== id));
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

  return (
    <View style={styles.splashContainer}>
      <View style={styles.topBar}>
        <Pressable style={styles.pillBtn} onPress={toggleMusic}>
          <Text style={styles.pillBtnText}>
            {isPlayingMusic ? "🎵 Lofi: On" : "🔇 Lofi: Off"}
          </Text>
        </Pressable>

        <View style={styles.rightTopControls}>
          <Pressable style={styles.tutorialBtn} onPress={openTutorial}>
            <Text style={styles.tutorialBtnText}>❓ How It Works</Text>
          </Pressable>

          <Pressable
            style={styles.skipBtn}
            onPress={() => {
              playClickSfx();
              if (audioRef.current) audioRef.current.pause();
              onFinish();
            }}
          >
            <Text style={styles.skipBtnText}>Skip 🚀</Text>
          </Pressable>
        </View>
      </View>

      {/* Poppable Floating Stars */}
      {floatingStars.map((star) => (
        <Pressable
          key={star.id}
          style={[styles.popStarItem, { left: star.x, top: star.y }]}
          onPress={() => handlePopStar(star.id, star.scale)}
        >
          <Animated.View style={{ transform: [{ scale: star.scale }] }}>
            <Animated.Text style={[styles.starEmoji, { opacity: twinkleAnim }]}>
              ⭐
            </Animated.Text>
          </Animated.View>
        </Pressable>
      ))}

      <View style={styles.scoreBadge}>
        <Text style={styles.scoreText}>⭐ Star XP: +{poppedStars}</Text>
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

      {/* Custom Mascot Showcase with Stella Catching Stars Animation */}
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
            {
              transform: [
                { translateY: Animated.add(floatStella, stellaReachAnim) },
                {
                  rotate: stellaReachAnim.interpolate({
                    inputRange: [-18, 0, 4],
                    outputRange: ["-8deg", "0deg", "3deg"],
                  }),
                },
              ],
            },
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
        <Text style={styles.subtitle}>Explore • Play • Discover Earth!</Text>
      </Animated.View>

      <View style={styles.teaserCard}>
        <Text style={styles.teaserHeader}>SNEAK PEEK INSIDE</Text>
        <Animated.Text style={[styles.teaserBody, { opacity: teaserFade }]}>
          {TEASER_TIPS[teaserIndex]}
        </Animated.Text>
      </View>

      <View style={styles.loaderSection}>
        <View style={styles.loaderTrack}>
          <Animated.View
            style={[styles.loaderFill, { width: progressWidth }]}
          />
        </View>
        <Text style={styles.loadingLabel}>
          Stella Catching Stars... ({secondsLeft}s left) • Tap Stars! ⭐
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
    backgroundColor: "#080b1e",
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
  pillBtn: {
    backgroundColor: "rgba(30, 41, 82, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#38bdf8",
  },
  pillBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  tutorialBtn: {
    backgroundColor: "rgba(192, 132, 252, 0.3)",
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
  popStarItem: {
    position: "absolute",
    zIndex: 15,
    padding: 10,
  },
  starEmoji: {
    fontSize: 28,
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
    width: Math.min(width, 420) * 0.84,
    height: Math.min(width, 420) * 0.84,
    borderRadius: (Math.min(width, 420) * 0.84) / 2,
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
    width: Math.min(width, 420) * 0.58,
    height: Math.min(width, 420) * 0.58,
    borderRadius: (Math.min(width, 420) * 0.58) / 2,
    borderWidth: 1.5,
    borderColor: "rgba(250, 204, 21, 0.28)",
  },
  auraCircle: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
  },
  mascotShowcase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 6,
  },
  mascotImage: {
    width: 100,
    height: 120,
  },
  centerLogo: {
    width: 115,
    height: 115,
  },
  curriculumPill: {
    backgroundColor: "rgba(192, 132, 252, 0.22)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#c084fc",
    marginBottom: 10,
  },
  curriculumText: {
    color: "#f3e8ff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  titleBlock: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "#38bdf8",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#facc15",
    marginTop: 4,
    letterSpacing: 0.8,
  },
  teaserCard: {
    width: "92%",
    maxWidth: 380,
    backgroundColor: "rgba(18, 60, 105, 0.85)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.45)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 24,
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
    bottom: 40,
    width: Math.min(width, 420) * 0.75,
    alignItems: "center",
  },
  loaderTrack: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    marginBottom: 8,
  },
  loaderFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#6366f1",
  },
  loadingLabel: {
    color: "#bae6fd",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tutorialOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(8, 11, 30, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },
  tutorialCard: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: "#123c69",
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
    color: "#e2e8f0",
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
