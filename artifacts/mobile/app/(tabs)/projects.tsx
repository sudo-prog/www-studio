import { Feather } from "@expo/vector-icons";
import { useGetProjects } from "@workspace/api-client-react";
import type { Project } from "@workspace/api-client-react";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { useColors } from "@/hooks/useColors";

function ProjectCard({ item, colors }: { item: Project; colors: ReturnType<typeof useColors> }) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/project/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={[styles.thumbnail, { backgroundColor: colors.muted }]}>
        <Feather name="monitor" size={28} color={colors.mutedForeground} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "published" ? "#166534" : colors.secondary,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: item.status === "published" ? "#4ade80" : colors.mutedForeground,
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={[styles.cardDate, { color: colors.mutedForeground }]}>
          {new Date(item.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function SkeletonProject({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.thumbnail, { backgroundColor: colors.muted }]} />
      <View style={styles.cardBody}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.muted, width: "60%" }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.muted, width: "35%", marginTop: 8 }]} />
      </View>
    </View>
  );
}

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const {
    data: projects,
    isLoading,
    isError,
    refetch,
  } = useGetProjects({ query: { enabled: isAuthenticated } });

  if (!authLoading && !isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Projects</Text>
        </View>
        <View style={styles.authPrompt}>
          <View style={[styles.authIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="lock" size={28} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.authTitle, { color: colors.foreground }]}>Sign in required</Text>
          <Text style={[styles.authSubtitle, { color: colors.mutedForeground }]}>
            Sign in to view and manage your projects
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Projects</Text>
        {isAuthenticated && (
          <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.countText, { color: colors.mutedForeground }]}>
              {projects?.length ?? 0}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={isLoading ? [] : (projects ?? [])}
        renderItem={({ item }) => <ProjectCard item={item} colors={colors} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isLoading}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          isLoading ? (
            <View style={styles.skeletonList}>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonProject key={i} colors={colors} />
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !isError ? (
            <View style={styles.emptyState}>
              <Feather name="folder" size={44} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No projects yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                Clone a website from the web app to get started
              </Text>
            </View>
          ) : isError ? (
            <View style={styles.emptyState}>
              <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Failed to load</Text>
              <TouchableOpacity
                onPress={() => refetch()}
                style={[styles.retryButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  listContent: { paddingBottom: 100 },
  skeletonList: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    gap: 12,
    padding: 12,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, gap: 4 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "capitalize" },
  cardDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  skeletonLine: { height: 12, borderRadius: 6 },
  authPrompt: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 40 },
  authIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
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
  emptyState: { alignItems: "center", paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1, marginTop: 4 },
  retryText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
