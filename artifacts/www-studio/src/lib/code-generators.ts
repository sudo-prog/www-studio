// ── Code Generators ──────────────────────────────────────────────────────────
import { FreeformElement, FreeformPage } from "@/lib/freeform-types";

export function generateCSSForElement(el: FreeformElement): string {
  const lines: string[] = [];
  lines.push(`.element-${el.id.slice(0, 8)} {`);
  if (el.x !== undefined) lines.push(`  left: ${el.x}px;`);
  if (el.y !== undefined) lines.push(`  top: ${el.y}px;`);
  if (el.width) lines.push(`  width: ${el.width}px;`);
  if (el.height) lines.push(`  height: ${el.height}px;`);
  if (el.opacity !== undefined && el.opacity !== 1) lines.push(`  opacity: ${el.opacity};`);
  if (el.rotation) lines.push(`  transform: rotate(${el.rotation}deg);`);
  if (el.borderRadius) lines.push(`  border-radius: ${el.borderRadius}px;`);
  if (el.fill) lines.push(`  background: ${el.fill};`);
  if (el.color) lines.push(`  color: ${el.color};`);
  if (el.fontSize) lines.push(`  font-size: ${el.fontSize}px;`);
  if (el.fontWeight) lines.push(`  font-weight: ${el.fontWeight};`);
  if (el.zIndex !== undefined) lines.push(`  z-index: ${el.zIndex};`);
  lines.push("}");
  return lines.join("\n");
}

export function generateTailwindForElement(el: FreeformElement): string {
  const classes: string[] = [];
  classes.push("absolute");
  if (el.fill) classes.push(`bg-[${el.fill}]`);
  if (el.color) classes.push(`text-[${el.color}]`);
  if (el.fontSize) classes.push(`text-[${el.fontSize}px]`);
  if (el.fontWeight) classes.push(`font-[${el.fontWeight}]`);
  if (el.borderRadius) classes.push(`rounded-[${el.borderRadius}px]`);
  if (el.opacity !== undefined && el.opacity !== 1) classes.push(`opacity-${Math.round(el.opacity * 100)}`);

  return `<div\n  className="${classes.join(" ")}"\n  style={{\n    left: ${el.x}px,\n    top: ${el.y}px,\n    width: ${el.width}px,\n    height: ${el.height}px${el.rotation ? `,\n    transform: 'rotate(${el.rotation}deg)'` : ""} ${el.zIndex ? `,\n    zIndex: ${el.zIndex}` : ""}\n  }}\n>\n  ${el.type === "text" ? el.text || "Text" : el.type === "button" ? `<a href="${el.href || "#"}">${el.label || "Button"}</a>` : ""}\n</div>`;
}

export function generateReactForElement(el: FreeformElement): string {
  return `  {/* ${el.type}: ${el.name || el.id.slice(0, 8)} */}\n${generateTailwindForElement(el)}`;
}

export function generatePageCSS(page: FreeformPage): string {
  const lines: string[] = [];
  lines.push(`/* ${page.name} - Generated CSS */\n`);
  lines.push(".page {");
  lines.push("  position: relative;");
  lines.push(`  width: ${page.canvasWidth}px;`);
  lines.push(`  min-height: ${page.canvasHeight}px;`);
  if (page.background.type === "color") {
    lines.push(`  background: ${page.background.value};`);
  } else if (page.background.type === "gradient") {
    lines.push(`  background: ${page.background.value};`);
  } else {
    lines.push(`  background-image: url(${page.background.value});`);
    lines.push("  background-size: cover;");
    lines.push("  background-position: center;");
  }
  lines.push("}\n");

  for (const el of page.elements) {
    if (!el.visible) continue;
    lines.push(generateCSSForElement(el));
    lines.push("");
  }

  return lines.join("\n");
}

export function generatePageTailwind(page: FreeformPage): string {
  const lines: string[] = [];
  lines.push(`<!-- ${page.name} - Generated Tailwind -->\n`);

  let bgClass = `"background: ${page.background.value}"`;
  if (page.background.type === "color") {
    bgClass = `style={{ background: "${page.background.value}" }}`;
  }

  lines.push(`<div className="relative mx-auto" ${bgClass}>`);
  lines.push(`  <div className="relative" style={{ width: ${page.canvasWidth}px, minHeight: ${page.canvasHeight}px }}>`);

  for (const el of page.elements) {
    if (!el.visible) continue;
    lines.push(`    ${generateTailwindForElement(el)}`);
  }

  lines.push("  </div>\n</div>");
  return lines.join("\n");
}

export function generatePageReact(page: FreeformPage): string {
  const lines: string[] = [];
  lines.push(`import React from "react";\n`);
  lines.push(`export default function ${page.name.replace(/[^a-zA-Z0-9]/g, "")}Page() {`);
  lines.push("  return (");
  lines.push(`    <div\n      className="relative mx-auto"\n      style={{\n        width: ${page.canvasWidth}px,\n        minHeight: ${page.canvasHeight}px,`);
  if (page.background.type === "color") {
    lines.push(`        background: "${page.background.value}",`);
  } else if (page.background.type === "gradient") {
    lines.push(`        background: "${page.background.value}",`);
  } else {
    lines.push(`        backgroundImage: "url(${page.background.value})",`);
    lines.push('        backgroundSize: "cover",');
    lines.push('        backgroundPosition: "center",');
  }
  lines.push("      }}\n    >");

  for (const el of page.elements) {
    if (!el.visible) continue;
    if (el.type === "text") {
      lines.push(`      <p\n        className="absolute"\n        style={{\n          left: ${el.x}px,\n          top: ${el.y}px,\n          width: ${el.width}px,\n          color: "${el.color || '#fff'}",\n          fontSize: ${el.fontSize || 24}px,\n          fontWeight: ${el.fontWeight || 400},\n          textAlign: "${el.textAlign || 'left'}",\n          transform: "${el.rotation ? `rotate(${el.rotation}deg)` : ""}",\n          zIndex: ${el.zIndex},\n        }}\n      >\n        ${el.text || "Text"}\n      </p>`);
    } else if (el.type === "shape") {
      lines.push(`      <div\n        className="absolute${el.borderRadius ? ` rounded-[${el.borderRadius}px]` : ""}"\n        style={{\n          left: ${el.x}px,\n          top: ${el.y}px,\n          width: ${el.width}px,\n          height: ${el.height}px,\n          background: "${el.fill || "#7FB5A0"}",\n          transform: "${el.rotation ? `rotate(${el.rotation}deg)` : ""}",\n          zIndex: ${el.zIndex},\n        }}\n      />`);
    } else if (el.type === "button") {
      lines.push(`      <a\n        href="${el.href || "#"}"\n        className="absolute flex items-center justify-center font-semibold"\n        style={{\n          left: ${el.x}px,\n          top: ${el.y}px,\n          width: ${el.width}px,\n          height: ${el.height}px,\n          background: "${el.fill || "#3b82f6"}",\n          color: "#fff",\n          borderRadius: ${el.borderRadius || 24}px,\n          transform: "${el.rotation ? `rotate(${el.rotation}deg)` : ""}",\n          zIndex: ${el.zIndex},\n        }}\n      >\n        ${el.label || "Button"}\n      </a>`);
    } else if (el.type === "image") {
      lines.push(`      <img\n        className="absolute"\n        style={{\n          left: ${el.x}px,\n          top: ${el.y}px,\n          width: ${el.width}px,\n          height: ${el.height}px,\n          borderRadius: ${el.borderRadius || 8}px,\n          transform: "${el.rotation ? `rotate(${el.rotation}deg)` : ""}",\n          zIndex: ${el.zIndex},\n        }}"\n        src="${el.src || ""}"\n        alt="${el.name || ""}"\n      />`);
    } else if (el.type === "embed") {
      lines.push(`      <iframe\n        className="absolute"\n        style={{\n          left: ${el.x}px,\n          top: ${el.y}px,\n          width: ${el.width}px,\n          height: ${el.height}px,\n          zIndex: ${el.zIndex},\n        }}"\n        src="${el.embedUrl || ""}"\n        frameBorder="0"\n        allowFullScreen\n        title="${el.embedType || "embed"}"\n      />`);
    } else {
      lines.push(`      {/* ${el.type}: ${el.name || el.id.slice(0, 8)} */}`);
    }
  }

  lines.push("    </div>\n  );\n}\n");
  return lines.join("\n");
}

// ── Framer Motion Export ──────────────────────────────────────────────────

export function generatePageFramerMotion(page: FreeformPage): string {
  const lines: string[] = [];
  lines.push(`import { motion } from "framer-motion";\n`);
  lines.push(`export default function ${page.name.replace(/[^a-zA-Z0-9]/g, "")}Page() {`);
  lines.push("  return (");
  lines.push(`    <div`);
  lines.push(`      className="relative mx-auto"`);
  lines.push(`      style={{`);
  lines.push(`        width: ${page.canvasWidth}px,`);
  lines.push(`        minHeight: ${page.canvasHeight}px,`);
  if (page.background.type === "color") {
    lines.push(`        background: "${page.background.value}",`);
  } else if (page.background.type === "gradient") {
    lines.push(`        background: "${page.background.value}",`);
  } else {
    lines.push(`        backgroundImage: "url(${page.background.value})",`);
    lines.push(`        backgroundSize: "cover",`);
    lines.push(`        backgroundPosition: "center",`);
  }
  lines.push(`      }}`);
  lines.push(`    >`);

  for (const el of page.elements) {
    if (!el.visible) continue;
    const motionProps: string[] = [];
    if (el.type === "text") {
      motionProps.push(`      initial={{ opacity: 0, y: 20 }}`);
      motionProps.push(`      animate={{ opacity: 1, y: 0 }}`);
      motionProps.push(`      transition={{ duration: 0.5, delay: ${el.zIndex * 0.05} }}`);
      lines.push(`      <motion.p`);
      motionProps.forEach((p) => lines.push(p));
      lines.push(`        className="absolute"`);
      lines.push(`        style={{`);
      lines.push(`          left: ${el.x}px,`);
      lines.push(`          top: ${el.y}px,`);
      lines.push(`          width: ${el.width}px,`);
      lines.push(`          color: "${el.color || "#fff"}",`);
      lines.push(`          fontSize: ${el.fontSize || 24}px,`);
      lines.push(`          fontWeight: ${el.fontWeight || 400},`);
      lines.push(`          textAlign: "${el.textAlign || "left"}",`);
      lines.push(`          transform: "${el.rotation ? `rotate(${el.rotation}deg)` : ""}",`);
      lines.push(`          zIndex: ${el.zIndex},`);
      lines.push(`        }}`);
      lines.push(`      >`);
      lines.push(`        ${el.text || "Text"}`);
      lines.push(`      </motion.p>`);
    } else if (el.type === "shape") {
      lines.push(`      <motion.div`);
      lines.push(`        initial={{ opacity: 0, scale: 0.8 }}`);
      lines.push(`        animate={{ opacity: 1, scale: 1 }}`);
      lines.push(`        transition={{ duration: 0.4, delay: ${el.zIndex * 0.05} }}`);
      lines.push(`        className="absolute${el.borderRadius ? ` rounded-[${el.borderRadius}px]` : ""}"`);
      lines.push(`        style={{`);
      lines.push(`          left: ${el.x}px,`);
      lines.push(`          top: ${el.y}px,`);
      lines.push(`          width: ${el.width}px,`);
      lines.push(`          height: ${el.height}px,`);
      lines.push(`          background: "${el.fill || "#7FB5A0"}",`);
      lines.push(`          transform: "${el.rotation ? `rotate(${el.rotation}deg)` : ""}",`);
      lines.push(`          zIndex: ${el.zIndex},`);
      lines.push(`        }}`);
      lines.push(`      />`);
    } else if (el.type === "button") {
      lines.push(`      <motion.a`);
      lines.push(`        href="${el.href || "#"}"`);
      lines.push(`        whileHover={{ scale: 1.05 }}`);
      lines.push(`        whileTap={{ scale: 0.95 }}`);
      lines.push(`        className="absolute flex items-center justify-center font-semibold"`);
      lines.push(`        style={{`);
      lines.push(`          left: ${el.x}px,`);
      lines.push(`          top: ${el.y}px,`);
      lines.push(`          width: ${el.width}px,`);
      lines.push(`          height: ${el.height}px,`);
      lines.push(`          background: "${el.fill || "#3b82f6"}",`);
      lines.push(`          color: "#fff",`);
      lines.push(`          borderRadius: ${el.borderRadius || 24}px,`);
      lines.push(`          transform: "${el.rotation ? `rotate(${el.rotation}deg)` : ""}",`);
      lines.push(`          zIndex: ${el.zIndex},`);
      lines.push(`        }}`);
      lines.push(`      >`);
      lines.push(`        ${el.label || "Button"}`);
      lines.push(`      </motion.a>`);
    } else if (el.type === "image") {
      lines.push(`      <motion.img`);
      lines.push(`        initial={{ opacity: 0, scale: 1.1 }}`);
      lines.push(`        animate={{ opacity: 1, scale: 1 }}`);
      lines.push(`        transition={{ duration: 0.6, delay: ${el.zIndex * 0.05} }}`);
      lines.push(`        className="absolute"`);
      lines.push(`        style={{`);
      lines.push(`          left: ${el.x}px,`);
      lines.push(`          top: ${el.y}px,`);
      lines.push(`          width: ${el.width}px,`);
      lines.push(`          height: ${el.height}px,`);
      lines.push(`          borderRadius: ${el.borderRadius || 8}px,`);
      lines.push(`          transform: "${el.rotation ? `rotate(${el.rotation}deg)` : ""}",`);
      lines.push(`          zIndex: ${el.zIndex},`);
      lines.push(`        }}`);
      lines.push(`        src="${el.src || ""}"`);
      lines.push(`        alt="${el.name || ""}"`);
      lines.push(`      />`);
    } else {
      lines.push(`      {/* ${el.type}: ${el.name || el.id.slice(0, 8)} */}`);
    }
  }

  lines.push(`    </div>`);
  lines.push(`  );`);
  lines.push(`}`);
  return lines.join("\n");
}
