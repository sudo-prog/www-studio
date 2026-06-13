import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  return "http://localhost:8080";
}

const PROMPTS = [
  "serene ocean at dawn with gentle floating orbs",
  "peaceful forest with soft morning light",
  "lavender dreamscape for deep sleep",
  "sunrise energy with warm coral tones",
  "mindful stillness with minimal shapes",
  "calming mountain mist at twilight",
  "gentle breathing meditation in sage and sky",
  "cozy evening wind-down with amber glows",
];

const STYLES = [
  { key: "meditation", label: "🧘 Meditation", color: "#7FB5A0" },
  { key: "sleep",      label: "🌙 Sleep",      color: "#B39DC2" },
  { key: "energy",     label: "⚡ Energy",     color: "#E8957A" },
  { key: "nature",     label: "🌿 Nature",     color: "#4A7C6B" },
  { key: "minimal",    label: "◯ Minimal",    color: "#87BBDB" },
];

export default function GenerateSceneScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [prompt,    setPrompt]    = useState("");
  const [style,     setStyle]     = useState("meditation");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [generated, setGenerated] = useState<{ id: string; name: string; elements: any[] } | null>(null);

  async function handleGenerate() {
    const text = prompt.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    setGenerated(null);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/scenes/ai-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, style }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Generation failed");
      const scene = await res.json();
      let elements: any[] = [];
      try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }
      setGenerated({ id: scene.id, name: scene.name, elements });
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (generated) {
    const fills = generated.elements.slice(0, 5).map((el: any) => el.fill).filter(Boolean);
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 24, paddingBottom: 24, alignItems: "center", flex: 1, justifyContent: "center", gap: 20 }}>
          {/* Mini preview */}
          <View style={{ width: 220, height: 140, backgroundColor: "#0d1117", borderRadius: 20, overflow: "hidden", position: "relative" }}>
            {fills.map((fill: string, i: number) => (
              <View key={i} style={{
                position: "absolute", borderRadius: 100,
                width: 80 - i * 8, height: 80 - i * 8,
                backgroundColor: fill,
                left: 20 + i * 28, top: 30 - i * 6,
                opacity: 0.75 - i * 0.07,
              }} />
            ))}
          </View>

          <View style={{ alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground, textAlign: "center" }}>
              {generated.name}
            </Text>
            <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center" }}>
              {generated.elements.length} elements generated ✨
            </Text>
          </View>

          <TouchableOpacity
            style={{ width: "100%", backgroundColor: "#7FB5A0", borderRadius: 14, paddingVertical: 16, alignItems: "center" }}
            onPress={() => router.replace(`/scene/${generated.id}`)}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Open in Editor →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setGenerated(null); setPrompt(""); }}
            style={{ paddingVertical: 10 }}
          >
            <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Generate another</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[s.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.title, { color: colors.foreground }]}>AI Scene Generator</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Icon hero */}
        <View style={s.hero}>
          <View style={[s.heroOrb, { backgroundColor: "#7FB5A020" }]}>
            <View style={[s.heroOrbInner, { backgroundColor: "#7FB5A040" }]}>
              <Feather name="aperture" size={32} color="#7FB5A0" />
            </View>
          </View>
          <Text style={[s.heroTitle, { color: colors.foreground }]}>Describe a wellness scene</Text>
          <Text style={[s.heroSub, { color: colors.mutedForeground }]}>
            The AI will compose calming orbs, waves, and animations in seconds.
          </Text>
        </View>

        {/* Prompt input */}
        <View style={[s.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[s.input, { color: colors.foreground }]}
            placeholderTextColor={colors.mutedForeground}
            placeholder="e.g. peaceful ocean at dusk with floating orbs…"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={3}
            autoFocus
            returnKeyType="done"
          />
          <View style={s.charCount}>
            <Text style={[s.charText, { color: colors.mutedForeground }]}>{prompt.length}/200</Text>
          </View>
        </View>

        {error && (
          <View style={[s.errorBox, { backgroundColor: "#ef444420", borderColor: "#ef444440" }]}>
            <Feather name="alert-circle" size={14} color="#ef4444" />
            <Text style={[s.errorText, { color: "#ef4444" }]}>{error}</Text>
          </View>
        )}

        {/* Generate button */}
        <TouchableOpacity
          style={[s.generateBtn, { backgroundColor: prompt.trim() && !loading ? "#7FB5A0" : colors.muted }]}
          onPress={handleGenerate}
          disabled={!prompt.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather name="zap" size={16} color="#fff" />
              <Text style={s.generateText}>Generate Scene</Text>
            </>
          )}
        </TouchableOpacity>

        {loading && (
          <Text style={[s.generatingNote, { color: colors.mutedForeground }]}>
            Composing your wellness scene… this takes a few seconds
          </Text>
        )}

        {/* Style selector */}
        <Text style={[s.suggestLabel, { color: colors.mutedForeground }]}>Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 4 }}>
            {STYLES.map((st) => (
              <TouchableOpacity
                key={st.key}
                onPress={() => setStyle(st.key)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  borderWidth: 1,
                  backgroundColor: style === st.key ? `${st.color}22` : colors.card,
                  borderColor:     style === st.key ? st.color         : colors.border,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13, color: style === st.key ? st.color : colors.mutedForeground, fontWeight: "600" }}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Quick prompts */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={[s.suggestLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>Quick prompts</Text>
          <TouchableOpacity
            onPress={() => {
              const all = [...PROMPTS, "cosmic starfield meditation", "golden hour forest", "deep sea breathing", "mountain clarity sunrise", "evening amber glow"];
              setPrompt(all[Math.floor(Math.random() * all.length)]);
            }}
            style={{ paddingVertical: 4, paddingHorizontal: 8 }}
          >
            <Text style={{ color: "#7FB5A0", fontSize: 12, fontFamily: "Inter_500Medium" }}>🎲 Shuffle</Text>
          </TouchableOpacity>
        </View>
        <View style={s.promptGrid}>
          {PROMPTS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPrompt(p)}
              style={({ pressed }) => [
                s.promptChip,
                { backgroundColor: prompt === p ? "#7FB5A020" : colors.card, borderColor: prompt === p ? "#7FB5A0" : colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[s.promptChipText, { color: prompt === p ? "#7FB5A0" : colors.foreground }]} numberOfLines={2}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1 },
  header:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn:        { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title:          { fontSize: 16, fontWeight: "600" },
  scroll:         { flex: 1, paddingHorizontal: 16 },
  hero:           { alignItems: "center", paddingVertical: 28 },
  heroOrb:        { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  heroOrbInner:   { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  heroTitle:      { fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  heroSub:        { fontSize: 13, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  inputCard:      { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 14 },
  input:          { fontSize: 14, lineHeight: 22, minHeight: 72 },
  charCount:      { alignItems: "flex-end", marginTop: 6 },
  charText:       { fontSize: 11 },
  errorBox:       { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  errorText:      { fontSize: 13, flex: 1 },
  generateBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14, marginBottom: 10 },
  generateText:   { color: "#fff", fontSize: 16, fontWeight: "700" },
  generatingNote: { textAlign: "center", fontSize: 12, marginBottom: 20 },
  suggestLabel:   { fontSize: 12, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 10, marginBottom: 10 },
  promptGrid:     { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  promptChip:     { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, maxWidth: "48%" },
  promptChipText: { fontSize: 12, lineHeight: 17 },
});
