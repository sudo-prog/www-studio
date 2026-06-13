import React, { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import WebView from "react-native-webview";
import { useGetScene } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  return "http://localhost:8080";
}

const ANIM_CSS = `
@keyframes gentle-float   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)} }
@keyframes gradient-breathe{ 0%,100%{opacity:var(--op,0.5);transform:scale(1)}50%{opacity:calc(var(--op,0.5) + 0.25);transform:scale(1.1)} }
@keyframes shadow-pulse   { 0%,100%{opacity:var(--op,0.5)}50%{opacity:calc(var(--op,0.5) + 0.3)} }
@keyframes hover-lift     { 0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.04)} }
@keyframes morph          { 0%,100%{rx:30%}50%{rx:50%} }
@keyframes scroll-reveal  { 0%{opacity:0;transform:translateY(24px)}100%{opacity:var(--op,0.7);transform:translateY(0)} }
`;

function buildHtml(raw: any): string {
  let elements: any[] = [];
  try { elements = JSON.parse(raw.elements ?? "[]"); } catch { /* */ }
  const w = raw.canvasWidth  ?? 1440;
  const h = raw.canvasHeight ?? 900;

  const defs = elements
    .filter((el) => (el.blur ?? 0) > 0)
    .map((el) => `<filter id="b${el.id.replace(/-/g,"")}"><feGaussianBlur stdDeviation="${(el.blur ?? 0) * 0.35}"/></filter>`)
    .join("");

  const shapes = elements
    .filter((el) => el.visible !== false)
    .map((el) => {
      const preset  = el.animation?.preset ?? "none";
      const dur     = el.animation?.duration ?? 3;
      const delay   = el.animation?.delay ?? 0;
      const easing  = el.animation?.easing ?? "ease-in-out";
      const loop    = el.animation?.loop !== false ? "infinite" : "1";
      const animSt  = preset !== "none" ? `animation:${preset} ${dur}s ${easing} ${delay}s ${loop};` : "";
      const filterA = (el.blur ?? 0) > 0 ? `filter="url(#b${el.id.replace(/-/g,"")})"` : "";
      const op      = el.opacity ?? 0.7;
      const rot     = el.rotation ? `rotate(${el.rotation},${el.x + el.width / 2},${el.y + el.height / 2})` : "";

      if (el.type === "circle") return `<circle cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" r="${el.width / 2}" fill="${el.fill}" opacity="${op}" ${filterA} transform="${rot}" style="--op:${op};${animSt}" />`;
      if (el.type === "rect")   return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="16" fill="${el.fill}" opacity="${op}" ${filterA} transform="${rot}" style="--op:${op};${animSt}" />`;
      if (el.svgPath)           return `<path d="${el.svgPath}" fill="${el.fill}" transform="translate(${el.x},${el.y}) ${rot}" opacity="${op}" ${filterA} style="--op:${op};${animSt}" />`;
      return "";
    })
    .join("\n");

  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100vh;overflow:hidden;background:#0d1117}
svg{width:100%;height:100%;display:block}
${ANIM_CSS}
</style></head><body>
<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>${defs}</defs>
${shapes}
</svg></body></html>`;
}

export default function ScenePreview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();

  const { data: scene, isLoading, isError } = useGetScene(id ?? "");
  const html = useMemo(() => scene ? buildHtml(scene) : null, [scene]);

  const [liked, setLiked]   = React.useState(false);
  const [likes, setLikes]   = React.useState(0);
  const [views, setViews]   = React.useState(0);

  React.useEffect(() => {
    if (scene) {
      setLikes((scene as any).likes ?? 0);
      setViews((scene as any).viewCount ?? 0);
    }
  }, [scene]);

  function handleLike() {
    if (liked || !id) return;
    fetch(`${getApiBase()}/api/scenes/${id}/like`, { method: "POST" }).catch(() => {});
    setLiked(true);
    setLikes((n) => n + 1);
  }

  async function handleShare() {
    if (!scene) return;
    const base = getApiBase().replace("/api","");
    await Share.share({ message: `Check out this wellness scene: ${(scene as any).name}\n${base}/scenes/${id}/share` });
  }

  return (
    <View style={[s.root, { backgroundColor: "#0d1117" }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{(scene as any)?.name ?? "Scene"}</Text>
        <TouchableOpacity onPress={handleShare} style={s.iconBtn}>
          <Feather name="share" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading && (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[s.loadingText, { color: "#ffffff80" }]}>Loading scene…</Text>
        </View>
      )}
      {isError && (
        <View style={s.center}>
          <Feather name="alert-circle" size={40} color="#ffffff40" />
          <Text style={[s.loadingText, { color: "#ffffff60" }]}>Failed to load scene</Text>
          <TouchableOpacity onPress={() => router.back()} style={s.retryBtn}>
            <Text style={{ color: "#fff", fontSize: 14, fontFamily: "Inter_500Medium" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
      {html && (
        <WebView
          source={{ html }}
          style={s.webview}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          originWhitelist={["*"]}
          javaScriptEnabled
        />
      )}

      {/* Bottom info bar */}
      {scene && (
        <View style={[s.infoBar, { paddingBottom: insets.bottom + 8, backgroundColor: "#0d111780" }]}>
          {(() => {
            let elements: any[] = [];
            try { elements = JSON.parse((scene as any).elements ?? "[]"); } catch { /* */ }
            return (
              <View style={s.infoRow}>
                <Text style={s.infoText}>{elements.length} elements · {(scene as any).status}</Text>
                <View style={s.statsRow}>
                  <Text style={s.infoText}>👁 {views}</Text>
                  <TouchableOpacity onPress={handleLike} style={s.likeBtn} activeOpacity={0.7}>
                    <Text style={[s.likeText, liked && { color: "#f87171" }]}>♥ {likes}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: "#0d1117" },
  header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
  headerTitle: { flex: 1, color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  iconBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: "#ffffff12", justifyContent: "center", alignItems: "center" },
  webview:     { flex: 1, backgroundColor: "transparent" },
  center:      { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  retryBtn:    { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: "#ffffff20" },
  infoBar:     { paddingHorizontal: 20, paddingTop: 8 },
  infoRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statsRow:    { flexDirection: "row", alignItems: "center", gap: 12 },
  infoText:    { color: "#ffffff50", fontSize: 11, fontFamily: "Inter_400Regular" },
  likeBtn:     { paddingHorizontal: 4 },
  likeText:    { color: "#ffffff50", fontSize: 11, fontFamily: "Inter_500Medium" },
});
