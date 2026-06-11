import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { useColors } from "@/hooks/useColors";

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  colors: ReturnType<typeof useColors>;
  dangerous?: boolean;
}

function SettingRow({ icon, label, value, onPress, colors, dangerous }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: dangerous ? "#7f1d1d22" : colors.secondary }]}>
        <Feather name={icon} size={16} color={dangerous ? "#f87171" : colors.mutedForeground} />
      </View>
      <Text style={[styles.settingLabel, { color: dangerous ? "#f87171" : colors.foreground }]}>
        {label}
      </Text>
      {value && (
        <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text>
      )}
      {onPress && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        </View>
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        </View>
        <View style={styles.authPrompt}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.secondary }]}>
            <Feather name="user" size={36} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.authTitle, { color: colors.foreground }]}>Sign in to WWW Studio</Text>
          <Text style={[styles.authSubtitle, { color: colors.mutedForeground }]}>
            Access your projects, designs, and settings
          </Text>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: colors.primary }]}
            onPress={login}
            activeOpacity={0.85}
          >
            <Feather name="log-in" size={16} color="#ffffff" />
            <Text style={styles.signInText}>Sign in with Replit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "User";
  const initials = (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
      >
        <View style={styles.profileSection}>
          {user?.profileImageUrl ? (
            <Image
              source={{ uri: user.profileImageUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarInitials}>
                {initials || <Feather name="user" size={28} color="#ffffff" />}
              </Text>
            </View>
          )}
          <Text style={[styles.displayName, { color: colors.foreground }]}>{displayName}</Text>
          {user?.email && (
            <Text style={[styles.email, { color: colors.mutedForeground }]}>{user.email}</Text>
          )}
        </View>

        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
          <SettingRow icon="user" label="Account info" colors={colors} />
          <SettingRow icon="shield" label="Privacy" colors={colors} />
          <SettingRow icon="bell" label="Notifications" colors={colors} />
        </View>

        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>PREFERENCES</Text>
          <SettingRow icon="moon" label="Appearance" value="Dark" colors={colors} />
          <SettingRow icon="globe" label="Language" value="English" colors={colors} />
        </View>

        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>SUPPORT</Text>
          <SettingRow icon="help-circle" label="Help & FAQ" colors={colors} />
          <SettingRow icon="info" label="About" value="v1.0.0" colors={colors} />
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: "#7f1d1d44" }]}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={16} color="#f87171" />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: {},
  profileSection: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    gap: 8,
  },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#ffffff",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
  },
  displayName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
  },
  email: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  settingsGroup: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    paddingTop: 4,
  },
  groupLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  settingValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: { color: "#f87171", fontSize: 15, fontFamily: "Inter_500Medium" },
  authPrompt: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  authTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  authSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  signInText: { color: "#ffffff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
