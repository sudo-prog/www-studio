import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#09090b", "#0d1117", "#09090b"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: topPad + 60, paddingBottom: bottomPad + 40 }]}>
        <View style={styles.logoSection}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoLetter}>W</Text>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>WWW Studio</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Design. Clone. Launch.
          </Text>
        </View>

        <View style={styles.features}>
          {[
            { icon: "layout" as const, label: "Browse template gallery" },
            { icon: "folder" as const, label: "Manage your projects" },
            { icon: "eye" as const, label: "Preview cloned sites" },
          ].map((item) => (
            <View key={item.label} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={item.icon} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.featureLabel, { color: colors.mutedForeground }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.signInButton, { backgroundColor: colors.primary }]}
          onPress={login}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Feather name="log-in" size={18} color="#ffffff" />
              <Text style={styles.signInText}>Sign in with Replit</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          By continuing, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  logoSection: {
    alignItems: "center",
    gap: 12,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoLetter: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: "#ffffff",
    letterSpacing: -1,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
    fontFamily: "Inter_700Bold",
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  features: {
    gap: 16,
    paddingVertical: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  signInButton: {
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  signInText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    paddingBottom: 8,
  },
});
