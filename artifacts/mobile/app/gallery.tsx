import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";

function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  return "http://localhost:8080";
}

async function fetchPublic(tag?: string, search?: string) {
  const params = new URLSearchParams();
  if (tag)    params.set("tag", tag);
  if (search) params.set("q",   search);
  const res = await fetch(`${getApiBase()}/api/scenes/public?${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const TAGS = ["relaxation","sleep","energy","focus","nature","breathe","meditation","minimal"];

function SceneCard({ scene, onPress, onLike, liked, colors }: { scene: any; onPress: () => void; onLike: () => void; liked: boolean; colors: ReturnType<typeof useColors> }) {
  let elements: any[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch {}
  const fills = elements.slice(0, 5).map((e: any) => e.fill).filter(Boolean);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[s.thumb, { backgroundColor: fills[0] ?? colors.muted }]}>
        {fills.slice(1).map((fill, i) => (
          <View key={i} style={[s.orb, {
            backgroundColor: fill,
            width: 48 - i * 6,
            height: 48 - i * 6,
            left: 10 + i * 16,
            top: 10 + i * 8,
            opacity: 0.7 - i * 0.1,
          }]} />
        ))}
        <View style={s.thumbBadges}>
          <View style={[s.badge, { backgroundColor: "#22c55e22" }]}>
            <Text style={[s.badgeText, { color: "#22c55e" }]}>Live</Text>
          </View>
        </View>
      </View>
      <View style={s.body}>
        <Text numberOfLines={1} style={[s.name, { color: colors.foreground }]}>{scene.name}</Text>
        <View style={s.meta}>
          <Text style={[s.metaText, { color: colors.mutedForeground }]}>
            👁 {scene.viewCount ?? 0}
          </Text>
          <TouchableOpacity onPress={onLike} activeOpacity={0.7} style={s.likeBtn}>
            <Text style={{ fontSize: 12, color: liked ? "#E8957A" : colors.mutedForeground }}>
              {liked ? "♥" : "♡"} {scene.likes ?? 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function GalleryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search,    setSearch]    = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [likedIds,  setLikedIds]  = useState<Set<string>>(new Set());

  const { data: scenes = [], isLoading, refetch } = useQuery({
    queryKey: ["mobile-public-gallery", activeTag, search],
    queryFn: () => fetchPublic(activeTag ?? undefined, search || undefined),
    staleTime: 30_000,
  });

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text style={[s.title, { color: colors.foreground }]}>Public Gallery</Text>
            <Text style={[s.subtitle, { color: colors.mutedForeground }]}>{(scenes as any[]).length} published scenes</Text>
          </View>
        </View>

        {/* Search */}
        <View style={[s.searchWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={14} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search scenes…"
            placeholderTextColor={colors.mutedForeground}
            style={[s.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tag pills */}
        <FlatList
          horizontal
          data={["All", ...TAGS]}
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tagList}
          renderItem={({ item }) => {
            const isActive = item === "All" ? !activeTag : activeTag === item;
            return (
              <TouchableOpacity
                onPress={() => setActiveTag(item === "All" ? null : item)}
                style={[s.tag, {
                  backgroundColor: isActive ? colors.primary : colors.muted,
                  borderColor: isActive ? colors.primary : colors.border,
                }]}
                activeOpacity={0.7}
              >
                <Text style={[s.tagText, { color: isActive ? "#fff" : colors.mutedForeground }]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={s.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={scenes as any[]}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <SceneCard
              scene={item}
              colors={colors}
              liked={likedIds.has(item.id)}
              onPress={() => router.push({ pathname: "/scene/[id]", params: { id: item.id } })}
              onLike={() => {
                if (likedIds.has(item.id)) return;
                const next = new Set(likedIds); next.add(item.id); setLikedIds(next);
                fetch(`${getApiBase()}/api/scenes/${item.id}/like`, { method: "POST" }).catch(() => {});
              }}
            />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Feather name="globe" size={42} color={colors.mutedForeground} />
              <Text style={[s.emptyTitle, { color: colors.foreground }]}>No public scenes</Text>
              <Text style={[s.emptySub, { color: colors.mutedForeground }]}>Publish scenes in WWW Studio to share them</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1 },
  header:     { paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  headerRow:  { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  backBtn:    { padding: 4 },
  title:      { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle:   { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, marginBottom: 10 },
  searchInput:{ flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 2 },
  tagList:    { paddingBottom: 10, gap: 6 },
  tag:        { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  tagText:    { fontSize: 11, fontWeight: "600" },
  list:       { paddingTop: 12, paddingHorizontal: 10 },
  row:        { gap: 8, marginBottom: 8 },
  card:       { flex: 1, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  thumb:      { height: 100, position: "relative", overflow: "hidden" },
  orb:        { position: "absolute", borderRadius: 100 },
  thumbBadges:{ position: "absolute", top: 6, right: 6 },
  badge:      { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText:  { fontSize: 9, fontWeight: "700" },
  body:       { padding: 10 },
  name:       { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  meta:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaText:   { fontSize: 10, fontFamily: "Inter_400Regular" },
  likeBtn:    { paddingLeft: 8 },
  loader:     { flex: 1, alignItems: "center", justifyContent: "center" },
  empty:      { alignItems: "center", paddingTop: 80, gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub:   { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
