import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface ComponentCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: keyof typeof Feather.glyphMap;
  gradient: [string, string];
}

const CATEGORIES: ComponentCategory[] = [
  { id: "nav", name: "Navigation", description: "Navbars, tabs, breadcrumbs", count: 12, icon: "menu", gradient: ["#1d4ed8", "#3b82f6"] },
  { id: "hero", name: "Hero Sections", description: "Full-width landing blocks", count: 8, icon: "star", gradient: ["#7c3aed", "#a78bfa"] },
  { id: "cards", name: "Cards", description: "Content cards and tiles", count: 24, icon: "credit-card", gradient: ["#0891b2", "#22d3ee"] },
  { id: "forms", name: "Forms", description: "Inputs, selects, checkboxes", count: 18, icon: "edit-2", gradient: ["#059669", "#34d399"] },
  { id: "cta", name: "Call to Action", description: "Buttons and banners", count: 10, icon: "arrow-right-circle", gradient: ["#ea580c", "#fb923c"] },
  { id: "features", name: "Features", description: "Feature grids and lists", count: 15, icon: "grid", gradient: ["#dc2626", "#f87171"] },
  { id: "pricing", name: "Pricing", description: "Pricing tables and tiers", count: 6, icon: "tag", gradient: ["#d97706", "#fbbf24"] },
  { id: "footer", name: "Footers", description: "Site footers and copyright", count: 5, icon: "align-justify", gradient: ["#1e3a5f", "#2d6a9f"] },
];

interface ComponentItem {
  id: string;
  name: string;
  tags: string[];
}

const POPULAR: ComponentItem[] = [
  { id: "c1", name: "Gradient Hero", tags: ["hero", "landing"] },
  { id: "c2", name: "Glassmorphism Card", tags: ["card", "glass"] },
  { id: "c3", name: "Sticky Navbar", tags: ["nav", "scroll"] },
  { id: "c4", name: "Feature Grid", tags: ["features", "icons"] },
  { id: "c5", name: "Pricing Table", tags: ["pricing", "CTA"] },
  { id: "c6", name: "Newsletter Form", tags: ["form", "email"] },
];

export default function ComponentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Components</Text>
        <View style={[styles.betaBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.betaText, { color: colors.primary }]}>Beta</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>POPULAR</Text>
          <FlatList
            horizontal
            data={POPULAR}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            scrollEnabled={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.popularCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <View style={[styles.popularPreview, { backgroundColor: colors.muted }]}>
                  <Feather name="layout" size={20} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.popularName, { color: colors.foreground }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.popularTags}>
                  {item.tags.slice(0, 1).map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CATEGORIES</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  {
                    borderColor: selectedCategory === cat.id ? colors.primary : colors.border,
                    borderWidth: selectedCategory === cat.id ? 1.5 : StyleSheet.hairlineWidth,
                  },
                ]}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={cat.gradient}
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Feather name={cat.icon} size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={[styles.categoryName, { color: colors.foreground }]} numberOfLines={1}>
                  {cat.name}
                </Text>
                <Text style={[styles.categoryCount, { color: colors.mutedForeground }]}>
                  {cat.count} components
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.comingSoon, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="zap" size={24} color={colors.primary} />
          <Text style={[styles.comingSoonTitle, { color: colors.foreground }]}>
            More coming soon
          </Text>
          <Text style={[styles.comingSoonText, { color: colors.mutedForeground }]}>
            The component library is growing. New components are added regularly.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  betaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  betaText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  scrollContent: { paddingBottom: 100 },
  section: { paddingTop: 20 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  horizontalList: { paddingHorizontal: 16, gap: 10 },
  popularCard: {
    width: 130,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    padding: 10,
    gap: 8,
  },
  popularPreview: {
    height: 70,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  popularName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  popularTags: { flexDirection: "row", gap: 4 },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  tagText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryCard: {
    width: "47%",
    borderRadius: 12,
    overflow: "hidden",
    padding: 12,
    gap: 8,
  },
  categoryGradient: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  categoryCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  comingSoon: {
    margin: 16,
    marginTop: 24,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  comingSoonTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  comingSoonText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
});
