import { Feather } from "@expo/vector-icons";
import { useGetGalleryTemplates } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import type { GalleryTemplate } from "@workspace/api-client-react";

const STYLES = ["All", "minimal", "bold", "dark", "corporate", "creative", "landing"];

function SkeletonCard({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.cardThumbnail, { backgroundColor: colors.muted }]} />
      <View style={styles.cardContent}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.muted, width: "70%" }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.muted, width: "45%", marginTop: 6 }]} />
        <View style={styles.tagRow}>
          <View style={[styles.skeletonTag, { backgroundColor: colors.muted }]} />
          <View style={[styles.skeletonTag, { backgroundColor: colors.muted, width: 50 }]} />
        </View>
      </View>
    </View>
  );
}

function GalleryCard({ item, colors }: { item: GalleryTemplate; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.cardThumbnail, { backgroundColor: colors.muted }]}>
        <View style={styles.thumbnailPlaceholder}>
          <Feather name="layout" size={24} color={colors.mutedForeground} />
        </View>
        {item.isFeatured && (
          <View style={[styles.featuredBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.cardMeta}>
          <Feather name="user" size={11} color={colors.mutedForeground} />
          <Text style={[styles.cardCreator, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.creator}
          </Text>
          <Feather name="heart" size={11} color={colors.mutedForeground} />
          <Text style={[styles.cardLikes, { color: colors.mutedForeground }]}>{item.likes}</Text>
        </View>
        <View style={styles.tagRow}>
          {item.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function GalleryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedStyle, setSelectedStyle] = useState("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: templates, isLoading, isError, refetch } = useGetGalleryTemplates(
    { style: selectedStyle === "All" ? undefined : selectedStyle },
  );

  const renderItem = ({ item }: { item: GalleryTemplate }) => (
    <GalleryCard item={item} colors={colors} />
  );

  const renderSkeleton = () => (
    <View style={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} colors={colors} />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Gallery</Text>
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.secondary }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={isLoading ? [] : (templates ?? [])}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.listContent]}
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
          <>
            <FlatList
              horizontal
              data={STYLES}
              keyExtractor={(s) => s}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              renderItem={({ item: s }) => (
                <TouchableOpacity
                  onPress={() => setSelectedStyle(s)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selectedStyle === s ? colors.primary : colors.secondary,
                      borderColor: selectedStyle === s ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: selectedStyle === s ? "#ffffff" : colors.mutedForeground },
                    ]}
                  >
                    {s === "All" ? s : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {isLoading && renderSkeleton()}
            {isError && (
              <View style={styles.errorState}>
                <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
                <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
                  Failed to load gallery
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
              <Feather name="grid" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No templates</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                No templates found for this style
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
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: { paddingBottom: 100 },
  filterList: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  row: { paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 8 },
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  cardThumbnail: {
    aspectRatio: 16 / 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  thumbnailPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredText: { color: "#ffffff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  cardContent: { padding: 10, gap: 4 },
  cardTitle: { fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardCreator: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  cardLikes: { fontSize: 11, fontFamily: "Inter_400Regular" },
  tagRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  tagText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  skeletonLine: { height: 12, borderRadius: 6 },
  skeletonTag: { height: 18, width: 40, borderRadius: 5 },
  errorState: { alignItems: "center", paddingTop: 60, gap: 12 },
  errorText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  retryButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  retryText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  emptyState: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
});
