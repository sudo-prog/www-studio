import { useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useGetScene } from "@workspace/api-client-react";
import { type SceneElement } from "@/lib/scene-types";

const ANIM_KEYFRAMES = `
@keyframes gentle-float    { 0%,100% { transform: translateY(0); }            50% { transform: translateY(-18px); } }
@keyframes gradient-breathe{ 0%,100% { opacity: var(--op,0.6); transform: scale(1); }  50% { opacity: calc(var(--op,0.6) + 0.25); transform: scale(1.10); } }
@keyframes shadow-pulse    { 0%,100% { filter: brightness(1);   }              50% { filter: brightness(1.35); } }
@keyframes hover-lift      { 0%,100% { transform: translateY(0) scale(1); }   50% { transform: translateY(-10px) scale(1.04); } }
@keyframes scroll-reveal   { 0%  { opacity: 0; transform: translateY(24px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes morph            { 0%,100% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40%/50% 60% 30% 60%; } }
@keyframes spin-slow        { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes scale-pulse      { 0%,100% { transform: scale(1); }                50% { transform: scale(1.15); } }
@keyframes elastic-bounce   { 0%,100% { transform: scale(1); } 30% { transform: scale(1.2); } 60% { transform: scale(0.9); } 80% { transform: scale(1.05); } }
@keyframes fade-in-out      { 0%,100% { opacity: var(--op,0.7); }             50% { opacity: 0.08; } }
@keyframes drift            { 0%,100% { transform: translate(0,0); }          33% { transform: translate(20px,-12px); } 66% { transform: translate(-10px,18px); } }
@keyframes aurora-sweep     { 0%,100% { transform: translateX(-5%) scaleX(1); } 50% { transform: translateX(5%) scaleX(1.08); } }
@keyframes cosmic-pulse     { 0%,100% { transform: scale(1) rotate(0deg); }   50% { transform: scale(1.1) rotate(180deg); } }
`;

function getAnimStyle(el: SceneElement): React.CSSProperties {
  const p = el.animation?.preset ?? "none";
  if (p === "none") return {};
  const dur   = el.animation?.duration ?? 3;
  const delay = el.animation?.delay    ?? 0;
  const ease  = el.animation?.easing   ?? "ease-in-out";
  const loop  = el.animation?.loop !== false ? "infinite" : "1";
  return { animation: `${p} ${dur}s ${ease} ${delay}s ${loop}` };
}

function SceneEl({ el }: { el: SceneElement }) {
  if (!el.visible) return null;

  const base: React.CSSProperties = {
    position:  "absolute",
    left:      el.x,
    top:       el.y,
    width:     el.width,
    height:    el.height,
    opacity:   el.opacity ?? 1,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    filter:    (el.blur ?? 0) > 0 ? `blur(${el.blur}px)` : undefined,
    backgroundColor: el.fill,
    ...getAnimStyle(el),
  };

  if (el.type === "circle") {
    return <div style={{ ...base, borderRadius: "50%" }} />;
  }
  if (el.type === "text") {
    return (
      <div style={{ ...base, backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{
          fontSize:   el.fontSize ?? 32,
          color:      el.fill,
          fontWeight: 600,
          textAlign:  "center",
          userSelect: "none",
          filter:     (el.blur ?? 0) > 0 ? `blur(${el.blur}px)` : undefined,
        }}>
          {el.text ?? "Text"}
        </span>
      </div>
    );
  }
  return <div style={{ ...base, borderRadius: 12 }} />;
}

export default function ScenePreviewPage() {
  const [, params] = useRoute("/scenes/:sceneId/preview");
  const sceneId    = params?.sceneId ?? "";
  const lenisRef   = useRef<any>(null);

  const { data: raw, isLoading, isError } = useGetScene(sceneId);

  useEffect(() => {
    document.title = (raw as any)?.name ? `${(raw as any).name} — Scene Preview` : "Scene Preview";
  }, [raw]);

  useEffect(() => {
    if (sceneId) {
      fetch(`/api/scenes/${sceneId}/view`, { method: "POST" }).catch(() => {});
    }
  }, [sceneId]);

  useEffect(() => {
    let lenis: any;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ autoRaf: true, lerp: 0.08, duration: 1.2 });
      lenisRef.current = lenis;
    }).catch(() => {});
    return () => { if (lenisRef.current) { lenisRef.current.destroy(); lenisRef.current = null; } };
  }, []);

  let elements: SceneElement[] = [];
  if (raw) { try { elements = JSON.parse((raw as any).elements ?? "[]"); } catch { /* */ } }

  const canvasWidth  = (raw as any)?.canvasWidth  ?? 1440;
  const canvasHeight = (raw as any)?.canvasHeight ?? 900;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white/40 text-sm">
        Scene not found
      </div>
    );
  }

  return (
    <>
      <style>{ANIM_KEYFRAMES}</style>
      <div
        className="w-full min-h-screen overflow-y-auto"
        style={{ background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)" }}
      >
        <div
          className="relative mx-auto"
          style={{
            width:           canvasWidth,
            height:          canvasHeight,
            transform:       `scale(${Math.min(window.innerWidth / canvasWidth, 1)})`,
            transformOrigin: "top center",
          }}
        >
          {[...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)).map((el) => (
            <SceneEl key={el.id} el={el} />
          ))}
        </div>
      </div>
    </>
  );
}
