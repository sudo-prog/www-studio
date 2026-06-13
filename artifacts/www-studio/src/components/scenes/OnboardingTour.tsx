import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "www-studio:scene-onboarding-done";

const STEPS = [
  {
    title: "Welcome to Scenes ✨",
    body:  "Create living, animated SVG compositions with AI. Each scene is a canvas of wellness-inspired visual elements.",
    emoji: "🎨",
  },
  {
    title: "Add Elements",
    body:  "Click shapes in the left panel to add them to the canvas. Drag them freely. Use the Properties tab to fine-tune size, color, blur, and rotation.",
    emoji: "🔵",
  },
  {
    title: "Animate Everything",
    body:  "Select any element and go to the Animation tab. Choose from 11 presets like Gentle Float, Morph, and Elastic Bounce — set duration and delay.",
    emoji: "🌀",
  },
  {
    title: "AI Scene Chat",
    body:  "Click AI Chat in the top bar to describe what you want: \"Add a floating lavender orb\" or \"Make the selected element 50% transparent\". The AI understands your full canvas.",
    emoji: "🤖",
  },
  {
    title: "Enhance & Export",
    body:  "Use AI Enhance modes (Deeper Calm, Morning Energy…) to transform your scene's mood. Export to React, Lottie, GSAP, SVG, or grab an embed snippet.",
    emoji: "🚀",
  },
];

interface Props {
  onDone: () => void;
}

export function OnboardingTour({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in-0 zoom-in-95 duration-200">
        <button
          onClick={finish}
          className="absolute top-3 right-3 w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center space-y-3 mb-6">
          <span className="text-4xl">{current.emoji}</span>
          <h2 className="text-lg font-semibold">{current.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {step + 1} / {STEPS.length}
          </span>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)}>
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button size="sm" onClick={() => setStep(s => s + 1)}>
                Next →
              </Button>
            ) : (
              <Button size="sm" onClick={finish}>
                Start Creating!
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setShow(true);
  }, []);

  return {
    show,
    done: () => { setShow(false); localStorage.setItem(STORAGE_KEY, "1"); },
  };
}
