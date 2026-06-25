// ── Form Element Renderer ─────────────────────────────────────────────────────
// Renders a freeform form element with multiple field types.

import { FreeformElement } from "@/lib/freeform-types";
import { sanitizeHTML } from "@/lib/security";

interface Props {
  el: FreeformElement;
  zoom: number;
}

interface FormField {
  type: "text" | "email" | "textarea" | "select" | "checkbox" | "submit";
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

function parseFormFields(el: FreeformElement): FormField[] {
  try {
    if (el.formFields) {
      const fields = JSON.parse(el.formFields);
      if (Array.isArray(fields)) return fields;
    }
  } catch { /* use defaults */ }
  // Default form fields
  return [
    { type: "text", label: "Name", placeholder: "Your name", required: true },
    { type: "email", label: "Email", placeholder: "you@example.com", required: true },
    { type: "textarea", label: "Message", placeholder: "Your message..." },
    { type: "submit", label: "Submit" },
  ];
}

export default function FormElementRenderer({ el, zoom }: Props) {
  const fields = parseFormFields(el);
  const padding = (el.padding || 16) * zoom;
  const fontSize = (el.fontSize || 14) * zoom;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form is for visual editing only — show a toast in preview
    if (el.href) {
      const form = e.target as HTMLFormElement;
      form.action = el.href;
      form.submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding,
        gap: 12 * zoom,
        background: el.fill || "rgba(255,255,255,0.03)",
        borderRadius: (el.borderRadius || 12) * zoom,
        border: el.stroke ? `${(el.strokeWidth || 1) * zoom}px solid ${el.stroke}` : "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {el.text && (
        <div
          style={{
            fontSize: (fontSize + 4),
            fontWeight: 600,
            color: el.color || "#ffffff",
            marginBottom: 4 * zoom,
          }}
        >
          {sanitizeHTML(el.text)}
        </div>
      )}
      {fields.map((field, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 * zoom }}>
          <label
            style={{
              fontSize: fontSize * 0.85,
              color: el.color || "#aaaaaa",
              fontWeight: 500,
            }}
          >
            {sanitizeHTML(field.label)}
            {field.required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
          </label>
          {field.type === "text" || field.type === "email" ? (
            <input
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              style={{
                padding: `${6 * zoom}px ${10 * zoom}px`,
                fontSize: fontSize,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6 * zoom,
                color: "#ffffff",
                outline: "none",
              }}
            />
          ) : field.type === "textarea" ? (
            <textarea
              placeholder={field.placeholder}
              required={field.required}
              rows={3}
              style={{
                padding: `${6 * zoom}px ${10 * zoom}px`,
                fontSize: fontSize,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6 * zoom,
                color: "#ffffff",
                outline: "none",
                resize: "vertical",
              }}
            />
          ) : field.type === "select" ? (
            <select
              style={{
                padding: `${6 * zoom}px ${10 * zoom}px`,
                fontSize: fontSize,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6 * zoom,
                color: "#ffffff",
                outline: "none",
              }}
            >
              {field.options?.map((opt, j) => (
                <option key={j} value={opt} style={{ background: "#1a1a2e" }}>
                  {sanitizeHTML(opt)}
                </option>
              ))}
            </select>
          ) : field.type === "checkbox" ? (
            <label style={{ display: "flex", alignItems: "center", gap: 8 * zoom, fontSize: fontSize, color: "#aaaaaa" }}>
              <input type="checkbox" style={{ width: 14 * zoom, height: 14 * zoom }} />
              {sanitizeHTML(field.label)}
            </label>
          ) : field.type === "submit" ? (
            <button
              type="submit"
              style={{
                padding: `${8 * zoom}px ${16 * zoom}px`,
                fontSize: fontSize,
                fontWeight: 600,
                background: "#3b82f6",
                color: "#ffffff",
                border: "none",
                borderRadius: 8 * zoom,
                cursor: "pointer",
                marginTop: 4 * zoom,
              }}
            >
              {sanitizeHTML(field.label)}
            </button>
          ) : null}
        </div>
      ))}
    </form>
  );
}
