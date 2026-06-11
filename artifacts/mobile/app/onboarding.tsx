import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const ONBOARDING_KEY = "onboarding_complete";

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  gradient: [string, string];
  title: string;
  subtitle: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    icon: "layers",
    gradient: ["#1d4ed8", "#3b82f6"],
    title: "Browse Templates",
    subtitle: "Explore hundreds of professionally designed website templates, filtered by style and category.",
  },
  {
    id: "2",
    icon: "folder",
    gradient: ["#7c3aed", "#a78bfa"],
    title: "Manage Projects",
    subtitle: "Keep all your cloned and customized websites organized in one place — accessible anywhere.",
  },
  {
    id: "3",
    icon: "eye",
    gradient: ["#0891b2", "#22d3ee"],
    title: "Preview Anywhere",
    subtitle: "Full-screen preview of your published sites directly in the app. Share with one tap.",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#09090b", "#0d1117", "#09090b"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoLetter}>W</Text>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>WWW Studio</Text>
        </View>
        {!isLast && (
          <TouchableOpacity onPress={handleFinish}>
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <LinearGradient
              colors={item.gradient}
              style={styles.slideIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name={item.icon} size={52} color="#ffffff" />
            </LinearGradient>
            <Text style={[styles.slideTitle, { color: colors.foreground }]}>
              {item.title}
            </Text>
            <Text style={[styles.slideSubtitle, { color: colors.mutedForeground }]}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: bottomPad + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? colors.primary : colors.muted,
                  width: i === activeIndex ? 20 : 6,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: isLast ? colors.primary : colors.secondary }]}
          onPress={isLast ? handleFinish : handleNext}
          activeOpacity={0.85}
        >
          {isLast ? (
            <>
              <Text style={[styles.nextButtonText, { color: "#ffffff" }]}>Get Started</Text>
              <Feather name="arrow-right" size={18} color="#ffffff" />
            </>
          ) : (
            <>
              <Text style={[styles.nextButtonText, { color: colors.foreground }]}>Next</Text>
              <Feather name="arrow-right" size={18} color={colors.foreground} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: "#ffffff",
  },
  appName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
  },
  skipText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  slide: {
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  slideIcon: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  slideTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 28,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: 54,
    borderRadius: 14,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
  },
});
