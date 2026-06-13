import React, { useState } from "react";
import {
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
import { useGetScenes } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

function parseElements(raw: any): any[] {
  try { return JSON.parse(raw?.elements ?? "[]"); } catch { return []; }
}

function SceneThumb({ elements, colors }: { elements: any[]; colors: ReturnType<typeof useColors> }) {
  const fills = elements.slice(0, 4).map((el) => el.fill).filter(Boolean);
  if (fills.length === 0) {
    return (
      <View style={[thumb.wrap, { backgroundColor: colors.muted }]}>
        <Feather name="layers" size={28} color={colors.mutedForeground} />
      </View>
    );
  }
  return (
    <View style={[thumb.wrap, { backgroundColor: "#0d1117" }]}>
      {fills.map((fill, i) => (
        <View
          key={i}
          style={[thumb.orb, {
            backgroundColor: fill,
            width: 72 - i * 10,
            height: 72 - i * 10,
            left: 8 + i * 20,
            top: 16 + i * 6,
            opacity: 0.78 - i * 0.08,
          }]}
        />
      ))}
    </View>
  );
}

const thumb = StyleSheet.create({
  wrap: { height: 110, overflow: "hidden", position: "relative", justifyContent: "center", alignItems: "center" },
  orb:  { position: "absolute", borderRadius: 100 },
});

function SceneCard({ scene, onPress, colors }: { scene: any; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  const elements = parseElements(scene);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <SceneThumb elements={elements} colors={colors} />
      <View style={s.cardBody}>
        <Text numberOfLines={1} style={[s.cardTitle, { color: colors.foreground }]}>{scene.name}</Text>
        <View style={s.cardMeta}>
          <Text style={[s.metaText, { color: colors.mutedForeground }]}>{elements.length} elements</Text>
          <View style={[s.badge, { backgroundColor: scene.status === "published" ? "#22c55e22" : colors.muted }]}>
            <Text style={[s.badgeText, { color: scene.status === "published" ? "#22c55e" : colors.mutedForeground }]}>
              {scene.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

type SortMode = "newest" | "oldest" | "name" | "published";

export default function ScenesTab() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const [query,   setQuery]   = useState("");
  const [sortBy,  setSortBy]  = useState<SortMode>("newest");

  const { data: rawScenes = [], isLoading, refetch } = useGetScenes();
  const scenes = (rawScenes as any[])
    .filter((sc) => !query || sc.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest")    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "oldest")    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sortBy === "published") return (b.status === "published" ? 1 : 0) - (a.status === "published" ? 1 : 0);
      return a.name.localeCompare(b.name);
    });

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <View style={s.headerRow}>
          <View>
            <Text style={[s.title, { color: colors.foreground }]}>Scenes</Text>
            <Text style={[s.subtitle, { color: colors.mutedForeground }]}>Wellness visual compositions</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push("/gallery")}
              style={[s.aiBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Feather name="globe" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/generate-scene")}
              style={[s.aiBtn, { backgroundColor: "#7FB5A020", borderColor: "#7FB5A040" }]}
              activeOpacity={0.7}
            >
              <Feather name="zap" size={14} color="#7FB5A0" />
              <Text style={[s.aiBtnText, { color: "#7FB5A0" }]}>AI Generate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[s.searchWrap, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <View style={[s.searchInner, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={13} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search scenes…"
            placeholderTextColor={colors.mutedForeground}
            style={[s.searchInput, { color: colors.foreground }]}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x" size={13} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort tabs */}
      <View style={[s.sortRow, { borderBottomColor: colors.border }]}>
        {(["newest","name","published"] as SortMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setSortBy(mode)}
            style={[s.sortTab, sortBy === mode && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Text style={[s.sortTabText, { color: sortBy === mode ? colors.primary : colors.mutedForeground }]}>
              {mode === "newest" ? "Newest" : mode === "name" ? "A–Z" : "Published"}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <Text style={[s.countText, { color: colors.mutedForeground }]}>{scenes.length} scene{scenes.length !== 1 ? "s" : ""}</Text>
      </View>

      <FlatList
        data={scenes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 90 }]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <SceneCard
            scene={item}
            colors={colors}
            onPress={() => router.push({ pathname: "/scene/[id]", params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.empty}>
              <Feather name="layers" size={42} color={colors.mutedForeground} />
              <Text style={[s.emptyTitle, { color: colors.foreground }]}>No scenes yet</Text>
              <Text style={[s.emptySub, { color: colors.mutedForeground }]}>
                Create scenes in WWW Studio
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1 },
  header:     { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerRow:  { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  title:      { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle:   { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  aiBtn:      { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  aiBtnText:  { fontSize: 13, fontWeight: "600" },
  searchWrap:  { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  searchInner: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 2 },
  sortRow:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  sortTab:     { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: "transparent", marginRight: 4 },
  sortTabText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  countText:   { fontSize: 11, fontFamily: "Inter_400Regular", paddingRight: 4 },
  list:       { paddingTop: 12, paddingHorizontal: 10 },
  row:        { gap: 8, marginBottom: 8 },
  card:       { flex: 1, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  cardBody:   { padding: 10, gap: 6 },
  cardTitle:  { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  cardMeta:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaText:   { fontSize: 11, fontFamily: "Inter_400Regular" },
  badge:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeText:  { fontSize: 10, fontFamily: "Inter_500Medium" },
  empty:      { alignItems: "center", paddingTop: 80, gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub:   { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
