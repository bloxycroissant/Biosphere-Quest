import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

export interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}

interface AppTutorialModalProps {
  visible: boolean;
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export default function AppTutorialModal({
  visible,
  steps,
  onComplete,
  onSkip,
}: AppTutorialModalProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!visible || steps.length === 0) return <></>;

  const currentStep = steps[currentIndex];
  const isLast = currentIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <LinearGradient
            colors={["#1e293b", "#0f172a"]}
            style={styles.cardGradient}
          >
            <View style={styles.topRow}>
              <Text style={styles.stepIndicator}>
                Step {currentIndex + 1} of {steps.length}
              </Text>
              <Pressable onPress={onSkip} hitSlop={10}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            </View>

            <View style={styles.iconBubble}>
              <Text style={styles.iconText}>{currentStep.icon}</Text>
            </View>

            <Text style={styles.title}>{currentStep.title}</Text>
            <Text style={styles.description}>{currentStep.description}</Text>

            <View style={styles.dotsRow}>
              {steps.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, idx === currentIndex && styles.dotActive]}
                />
              ))}
            </View>

            <Pressable style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {isLast ? "Let's Go! 🚀" : "Next ➔"}
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardGradient: {
    padding: 24,
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  stepIndicator: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  skipText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  iconText: {
    fontSize: 32,
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
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#334155",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#38bdf8",
  },
  nextButton: {
    backgroundColor: "#4f46e5",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
});
