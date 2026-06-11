import { Feather } from "@expo/vector-icons";
import { useGetProject } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { data: project, isLoading, isError } = useGetProject(id ?? "");

  useEffect(() => {
    if (project) {
      navigation.setOptions({ title: project.name });
    }
  }, [project, navigation]);

  const handleShare = async () => {
    if (!project?.sourceUrl) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (Platform.OS === "web") {
        Alert.alert("Share", project.sourceUrl);
        return;
      }
      await Share.share({
        title: project.name,
        url: project.sourceUrl,
        message: `Check out my project: ${project.name}`,
      });
    } catch {
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <StatusBar style="auto" />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !project) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <StatusBar style="auto" />
        <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
        <Text style={[styles.errorTitle, { color: colors.foreground }]}>Project not found</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.secondary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: colors.foreground }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const webUrl = project.sourceUrl;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />

      <View style={[styles.toolbar, { borderBottomColor: colors.border, paddingBottom: 8 }]}>
        <View style={[styles.urlBar, { backgroundColor: colors.secondary }]}>
          <Feather name="globe" size={13} color={colors.mutedForeground} />
          <Text
            style={[styles.urlText, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {webUrl ?? "No preview URL"}
          </Text>
        </View>
        {webUrl && (
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: colors.secondary }]}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Feather name="share" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {webUrl ? (
        <WebView
          source={{ uri: webUrl }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={[styles.webviewLoading, { backgroundColor: colors.background }]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        />
      ) : (
        <View style={[styles.noPreview, { backgroundColor: colors.background }]}>
          <Feather name="monitor" size={56} color={colors.mutedForeground} />
          <Text style={[styles.noPreviewTitle, { color: colors.foreground }]}>No preview</Text>
          <Text style={[styles.noPreviewSubtitle, { color: colors.mutedForeground }]}>
            This project doesn't have a source URL yet
          </Text>
        </View>
      )}

      <View
        style={[
          styles.statusBar,
          { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 4 },
        ]}
      >
        <View style={[styles.statusDot, { backgroundColor: project.status === "published" ? "#22c55e" : colors.mutedForeground }]} />
        <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
          {project.status === "published" ? "Published" : "Draft"} · Updated{" "}
          {new Date(project.updatedAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  urlBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  urlText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  webview: { flex: 1 },
  webviewLoading: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  noPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  noPreviewTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  noPreviewSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  errorTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  backButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  backButtonText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
