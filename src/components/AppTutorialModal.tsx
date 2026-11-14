import { useAudioPlayer } from "expo-audio";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

interface TutorialStep {
  title: string;
  description: string;
  mascot: any;
  tip: string;
}

interface AppTutorialModalProps {
  visible: boolean;
  pageName: "home" | "explore" | "games" | "profile";
  onClose: () => void;
}

const TUTORIAL_DATA: Record<string, TutorialStep[]> = {
  home: [
    {
      title: "Welcome to Biosphere Quest! 🚀",
      description:
        "This is your main command center where you can track your daily streaks, level progression, and XP.",
      mascot: require("../../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png"),
      tip: "Check your daily study goals and upcoming calendar events right here.",
    },
    {
      title: "Study Schedule & Calendar 📅",
      description:
        "Plan your learning sessions, set custom reminders, and keep your daily streak alive effortlessly.",
      mascot: require("../../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png"),
      tip: "Tap '+ Schedule' on the calendar widget to add your personal study blocks.",
    },
  ],
  explore: [
    {
      title: "Explore Curriculum & Missions 🔬",
      description:
        "Dive into MATATAG-aligned Grade 1–6 Math and Science lessons designed for interactive learning.",
      mascot: require("../../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png"),
      tip: "Tap on any subject domain to view interactive missions and comprehensive notes.",
    },
    {
      title: "Earn XP & Complete Lessons ⭐",
      description:
        "Each completed mission rewards you with XP and unlocks the next exciting challenge in your learning path.",
      mascot: require("../../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png"),
      tip: "Stuck on a concept? Tap 'Comprehensive Notes' for a full reference guide.",
    },
  ],
  games: [
    {
      title: "Mini-Game Arcade 🎮",
      description:
        "Practice your knowledge with fast-paced educational mini-games like Flashcards, Word Scramble, and Number Ninja!",
      mascot: require("../../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png"),
      tip: "Earn massive XP bonuses to climb the Weekly Champions Leaderboard.",
    },
    {
      title: "Defuse the Codebreaker Vault 🔥",
      description:
        "Test your expert problem-solving skills against challenging combinations for maximum rewards.",
      mascot: require("../../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png"),
      tip: "Use the filter buttons at the top to sort games by difficulty.",
    },
  ],
  profile: [
    {
      title: "Your Explorer ID & Stats 🏅",
      description:
        "Customize your avatar, check your total earned XP, and view all unlocked badges and achievements.",
      mascot: require("../../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png"),
      tip: "Tap 'Edit Profile' to update your explorer details anytime.",
    },
    {
      title: "Track Your Study Schedule 📅",
      description:
        "Review all your active study sessions and completed milestones in one convenient place.",
      mascot: require("../../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png"),
      tip: "Mark study sessions as complete to instantly claim bonus XP!",
    },
  ],
};

export default function AppTutorialModal({
  visible,
  pageName,
  onClose,
}: AppTutorialModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const steps = TUTORIAL_DATA[pageName] || TUTORIAL_DATA.home;
  const currentStep = steps[currentStepIndex];

  // Sound effects setup using expo-audio
  const openSound = useAudioPlayer(
    require("../../../assets/BiosphereQuestSoundEffectsandMusic/Marimba Upbeat Kids Fun (No Copyright Music) by MokkaMusic Junior.mp3"),
  );
  const closeSound = useAudioPlayer(
    require("../../../assets/BiosphereQuestSoundEffectsandMusic/The Game Show Theme Music - (192 Kbps).mp3"),
  );

  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0);
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);

      // Play open sound effect safely
      try {
        if (openSound) {
          // eslint-disable-next-line react-hooks/immutability
          openSound.volume = 0.4;
          openSound.seekTo(0);
          openSound.play();
        }
      } catch (e) {
        console.log("Audio play error", e);
      }

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, pageName]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  if (!visible) return null;

  const handleCloseWithSound = () => {
    try {
      if (closeSound) {
        // eslint-disable-next-line react-hooks/immutability
        closeSound.volume = 0.3;
        closeSound.seekTo(0);
        closeSound.play();
      }
    } catch (e) {
      console.log("Audio play error", e);
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleCloseWithSound();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <Animated.View
            style={[styles.glowHalo, { transform: [{ scale: pulseAnim }] }]}
          />

          <View style={styles.mascotContainer}>
            <Image
              source={currentStep.mascot}
              style={styles.mascotImage}
              contentFit="contain"
            />
          </View>

          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>
              STEP {currentStepIndex + 1} OF {steps.length}
            </Text>
          </View>

          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.description}>{currentStep.description}</Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{currentStep.tip}</Text>
          </View>

          <View style={styles.dotsRow}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentStepIndex && styles.activeDot]}
              />
            ))}
          </View>

          <View style={styles.buttonRow}>
            {currentStepIndex > 0 && (
              <Pressable
                style={styles.backButton}
                onPress={() => setCurrentStepIndex(currentStepIndex - 1)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            )}
            <Pressable style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStepIndex === steps.length - 1
                  ? "Got it! 🚀"
                  : "Next →"}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.skipPressable}
            onPress={handleCloseWithSound}
          >
            <Text style={styles.skipText}>Skip Tutorial</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(4, 9, 22, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 9999,
  },
  modalContainer: {
    width: "100%",
    maxWidth: Math.min(width - 32, 380),
    backgroundColor: "#111b36",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#4f46e5",
    padding: 24,
    alignItems: "center",
    position: "relative",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  glowHalo: {
    position: "absolute",
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "rgba(99, 102, 241, 0.3)",
    zIndex: -1,
  },
  mascotContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#6366f1",
  },
  mascotImage: {
    width: 60,
    height: 60,
  },
  badgePill: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  badgeText: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
  },
  tipBox: {
    flexDirection: "row",
    backgroundColor: "#19264a",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#2a3d6b",
    width: "100%",
  },
  tipIcon: {
    fontSize: 18,
  },
  tipText: {
    color: "#93c5fd",
    fontSize: 11.5,
    fontWeight: "700",
    flex: 1,
    lineHeight: 16,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#334155",
  },
  activeDot: {
    width: 20,
    backgroundColor: "#38bdf8",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  backButton: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  backButtonText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "800",
  },
  nextButton: {
    flex: 2,
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  skipPressable: {
    marginTop: 14,
    paddingVertical: 4,
  },
  skipText: {
    color: "#64748b",
    fontSize: 11.5,
    fontWeight: "800",
  },
});
