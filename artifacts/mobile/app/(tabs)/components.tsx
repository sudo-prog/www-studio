import { Feather } from "@expo/vector-icons";
import { useGetGalleryTemplates } from "@workspace/api-client-react";
import type { GalleryTemplate } from "@workspace/api-client-react";
import { Image } from "expo-image";
import React, { useState } from "react";
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

import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  { id: "All", label: "All" },
  { id: "landing", label: "Landing" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "dark", label: "Dark" },
  { id: "corporate", label: "Corporate" },
  { id: "creative", label: "Creative" },
];

function ComponentCard({ item, colors }: { item: GalleryTemplate; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.cardPreview, { backgroundColor: colors.muted }]}>
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.previewImage}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj" }}
          />
        ) : (
          <Feather name="layout" size={24} color={colors.mutedForeground} />
        )}
        <View style={[styles.stylePill, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.stylePillText, { color: colors.primary }]}>{item.style}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <View style={styles.tagRow}>
            {item.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.likes}>
            <Feather name="heart" size={11} color={colors.mutedForeground} />
            <Text style={[styles.likesText, { color: colors.mutedForeground }]}>{item.likes}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SkeletonCard({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.cardPreview, { backgroundColor: colors.muted }]} />
      <View style={styles.cardBody}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.muted, width: "70%" }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.muted, width: "50%", marginTop: 6 }]} />
      </View>
    </View>
  );
}

export default function ComponentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: components, isLoading, isError, refetch } = useGetGalleryTemplates(
    { style: selectedCategory === "All" ? undefined : selectedCategory },
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Components</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {components?.length ?? 0}
          </Text>
        </View>
      </View>

      <FlatList
        data={isLoading ? [] : (components ?? [])}
        renderItem={({ item }) => <ComponentCard item={item} colors={colors} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!(!isLoading)}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={(c) => c.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              scrollEnabled={true}
              renderItem={({ item: cat }) => (
                <TouchableOpacity
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selectedCategory === cat.id ? colors.primary : colors.secondary,
                      borderColor: selectedCategory === cat.id ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: selectedCategory === cat.id ? "#ffffff" : colors.mutedForeground },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {isLoading && (
              <View style={styles.skeletonList}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} colors={colors} />
                ))}
              </View>
            )}
            {isError && (
              <View style={styles.errorState}>
                <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
                <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
                  Failed to load components
                </Text>
                <TouchableOpacity
                  onPress={() => refetch()}
                  style={[styles.retryButton, { borderColor: colors.border }]}
                >
                  <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !isLoading && !isError ? (
            <View style={styles.emptyState}>
              <Feather name="cpu" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No components</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                No components found for this category
              </Text>
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
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    flex: 1,
  },
  countBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  countText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  listContent: { paddingBottom: 100 },
  filterList: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  skeletonList: { paddingHorizontal: 16, gap: 8 },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  cardPreview: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  stylePill: {
    position: "absolute",
    bottom: 8,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stylePillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardBody: { padding: 12, gap: 6 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tagRow: { flexDirection: "row", gap: 4 },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  tagText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  likes: { flexDirection: "row", alignItems: "center", gap: 4 },
  likesText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  skeletonLine: { height: 12, borderRadius: 6 },
  errorState: { alignItems: "center", paddingTop: 60, gap: 12 },
  errorText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  retryButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  retryText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  emptyState: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
});
