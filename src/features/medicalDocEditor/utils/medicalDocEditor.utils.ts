import type { CSSProperties } from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface PageSize { name: string; w: number; h: number; }
export interface Margins { top: number; right: number; bottom: number; left: number; }
export interface BorderConfig {
  enabled: boolean; pattern: string; color: string;
  width: number; radius: number; offset: number;
}
export interface Logo { id: string; src: string; name: string; }

export type LogoPositionId = "top-left" | "top-center" | "top-right" | "middle" | "bottom-left" | "bottom-right";
export type EditTarget = "header" | "body" | "footer";
export type PanelId = "templates" | "logo" | "layout" | "section";
export type TemplateKey = "repos" | "mariage" | "aptitude" | "blank";
export type LayoutTab = "page" | "border";
export type Orientation = "portrait" | "landscape";

export interface TemplateDefinition {
  label: string; icon: string;
  header: string; footer: string; body: string;
}

// ─── THEME ───────────────────────────────────────────────────────────────────
export const C = {
  teal: "#6366F1", tealDark: "#4447eaff",
  tealLight: "#e8f7f7", tealBg: "#f0fafa",
  navy: "#1a3a5c", border: "#d0e8e8",
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const PAGE_SIZES: PageSize[] = [
  { name: "A4", w: 210, h: 297 },
  { name: "A5", w: 148, h: 210 },
  { name: "Letter", w: 216, h: 279 },
  { name: "Legal", w: 216, h: 356 },
];

export const MARGIN_PRESETS: (Margins & { name: string })[] = [
  { name: "Normal", top: 25, right: 25, bottom: 25, left: 25 },
  { name: "Étroit", top: 13, right: 13, bottom: 13, left: 13 },
  { name: "Large", top: 25, right: 38, bottom: 25, left: 38 },
  { name: "Cabinet", top: 18, right: 20, bottom: 18, left: 20 },
];

export const BORDER_PATTERNS = [
  { id: "none", label: "Aucune", preview: "—" },
  { id: "solid", label: "Continu", preview: "━━" },
  { id: "dashed", label: "Tirets", preview: "╌╌" },
  { id: "dotted", label: "Pointillés", preview: "···" },
  { id: "double", label: "Double", preview: "═══" },
  { id: "groove", label: "Relief", preview: "▓▓▓" },
  { id: "double-frame", label: "Cadre double", preview: "⬚⬚" },
  { id: "shadow-glow", label: "Halo", preview: "❋❋❋" },
  { id: "zigzag", label: "Zigzag", preview: "∿∿∿" },
  { id: "corners", label: "Ornements", preview: "✦✦✦" },
];

export const LOGO_POSITIONS: { id: LogoPositionId; label: string; icon: string }[] = [
  { id: "top-left", label: "Haut G.", icon: "↖" },
  { id: "top-center", label: "Haut C.", icon: "↑" },
  { id: "top-right", label: "Haut D.", icon: "↗" },
  { id: "middle", label: "Filigrane", icon: "⊙" },
  { id: "bottom-left", label: "Bas G.", icon: "↙" },
  { id: "bottom-right", label: "Bas D.", icon: "↘" },
];

export const BORDER_SWATCHES = [
  C.teal, "#3DBFB8", "#1a3a5c", "#2e7d52", "#8B4513", "#8B0000", "#4B0082", "#333", "#DAA520",
];

export const SIDEBAR_TABS: { id: PanelId; icon: string; label: string }[] = [
  { id: "templates", icon: "📄", label: "Modèles" },
  { id: "logo", icon: "🖼", label: "Logos" },
  { id: "layout", icon: "📐", label: "Mise en page" },
  { id: "section", icon: "✏️", label: "Sections" },
];

// ─── SHARED TEMPLATE HTML ────────────────────────────────────────────────────
const SHARED_HEADER = `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;line-height:1.6;">
  <tr>
    <td style="width:50%;vertical-align:top;">
      <strong style="font-size:13px;">Dr. {{fullName}}</strong><br/>
      {{title}}
    </td>
    <td style="width:50%;vertical-align:top;text-align:right;direction:rtl;">
      <strong style="font-size:13px;">د. {{nameAr}}</strong><br/>
     {{titleAr}}
    </td>
  </tr>
</table>
<p style="text-align:center;margin-top:14px;color:#555;font-size:12px;">
  <span style="direction:rtl;display:inline;">{{city}}, le .....................................{{cityAr}}، في </span>
</p>`;

const SHARED_FOOTER = `<div style="text-align:center;font-size:10.5px;color:#555;line-height:1.8;">
  {{address}}<br/>
  <span style="direction:rtl;display:block;">{{addressAr}}</span>
  Tél / WhatsApp : {{phone}} &nbsp;|&nbsp; {{email}}
</div>`;

export const TEMPLATES: Record<TemplateKey, TemplateDefinition> = {
  repos: {
    label: "Certificat Médical de Repos", icon: "🛏",
    header: SHARED_HEADER, footer: SHARED_FOOTER,
    body: `<div style="text-align:center;margin:28px 0 32px;"><div style="display:inline-block;background:#e8f7f7;padding:14px 44px;border-radius:4px;"><strong style="font-size:19px;color:#3DBFB8;letter-spacing:1px;text-transform:uppercase;display:block;">CERTIFICAT MÉDICAL<br/>DE REPOS</strong></div></div>
<p style="margin-bottom:20px;">Je soussigné <span style="border-bottom:1px dotted #999;display:inline-block;min-width:180px;">&nbsp;</span> Certifie avoir examiné ce jour,</p>
<p style="margin-bottom:20px;">Mr/Mme : <span style="border-bottom:1px dotted #999;display:inline-block;min-width:230px;">&nbsp;</span>&nbsp; CIN n° : <span style="border-bottom:1px dotted #999;display:inline-block;min-width:90px;">&nbsp;</span></p>
<p style="margin-bottom:20px;">et déclare que son état de santé nécessite un repos de <span style="border-bottom:1px dotted #999;display:inline-block;min-width:36px;">&nbsp;</span> jours,</p>
<p style="margin-bottom:28px;">du <span style="border-bottom:1px dotted #999;display:inline-block;min-width:28px;">&nbsp;</span> / <span style="border-bottom:1px dotted #999;display:inline-block;min-width:28px;">&nbsp;</span> / <span style="border-bottom:1px dotted #999;display:inline-block;min-width:46px;">&nbsp;</span> au <span style="border-bottom:1px dotted #999;display:inline-block;min-width:28px;">&nbsp;</span> / <span style="border-bottom:1px dotted #999;display:inline-block;min-width:28px;">&nbsp;</span> / <span style="border-bottom:1px dotted #999;display:inline-block;min-width:46px;">&nbsp;</span>, inclus, sauf complications.</p>
<p style="margin-bottom:44px;">En foi de quoi, le présent certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.</p>
<p style="text-align:center;font-style:italic;color:#3DBFB8;font-size:14px;">Signé :</p>`,
  },
  mariage: {
    label: "Certificat de Mariage", icon: "💍",
    header: SHARED_HEADER, footer: SHARED_FOOTER,
    body: `<div style="text-align:center;margin:28px 0 32px;"><div style="display:inline-block;background:#e8f7f7;border:2px solid #3DBFB8;padding:14px 44px;border-radius:4px;"><strong style="font-size:19px;color:#3DBFB8;display:block;direction:rtl;">شهادة طبية<br/>قصد الزواج</strong></div></div>
<p style="margin-bottom:18px;direction:rtl;text-align:right;font-size:15px;">أنا الموقعة اسفله، د. {{nameAr}}، أشهد أنني بتاريخ يومه بطلب منه/منها</p>
<p style="margin-bottom:18px;direction:rtl;text-align:right;font-size:15px;">المسمى/ المسماة <span style="border-bottom:1px dotted #999;display:inline-block;min-width:240px;">&nbsp;</span></p>
<p style="margin-bottom:18px;direction:rtl;text-align:right;font-size:15px;">الحامل(ة) للبطاقة الوطنية/جواز السفر رقم <span style="border-bottom:1px dotted #999;display:inline-block;min-width:180px;">&nbsp;</span></p>
<p style="margin-bottom:28px;direction:rtl;text-align:right;font-size:15px;">و تبين بعد الفحص السريري أن المعني(ة) بالأمر لا تظهر عليه (ها) علامة لمرض معد.</p>
<p style="text-align:center;font-weight:bold;color:#3DBFB8;font-size:15px;direction:rtl;">سلمت له(ها) هذه الشهادة للإدلاء بها قصد الزواج.</p>`,
  },
  aptitude: {
    label: "Certificat d'Aptitude Physique", icon: "💪",
    header: SHARED_HEADER, footer: SHARED_FOOTER,
    body: `<div style="text-align:center;margin:28px 0 32px;"><div style="display:inline-block;background:#e8f7f7;border:2px solid #3DBFB8;padding:14px 44px;border-radius:4px;"><strong style="font-size:18px;color:#3DBFB8;letter-spacing:1px;text-transform:uppercase;display:block;">CERTIFICAT MÉDICAL<br/>D'APTITUDE PHYSIQUE</strong></div></div>
<p style="margin-bottom:20px;">Je soussigné <span style="border-bottom:1px dotted #999;display:inline-block;min-width:180px;">&nbsp;</span> Certifie avoir examiné ce jour,</p>
<p style="margin-bottom:20px;">Mr/Mme : <span style="border-bottom:1px dotted #999;display:inline-block;min-width:230px;">&nbsp;</span>&nbsp; CIN n° : <span style="border-bottom:1px dotted #999;display:inline-block;min-width:90px;">&nbsp;</span></p>
<p style="margin-bottom:24px;">et déclare d'après son examen clinique et des examens complémentaires qu'il/elle est <strong>physiquement apte</strong> pour l'emploi considéré.</p>
<p style="margin-bottom:44px;">En foi de quoi, le présent certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.</p>
<p style="text-align:center;font-style:italic;color:#3DBFB8;font-size:14px;">Signé :</p>`,
  },
  blank: {
    label: "Document Vierge", icon: "📄",
    header: SHARED_HEADER, footer: SHARED_FOOTER,
    body: `<p style="color:#aaa;font-style:italic;">Commencez à saisir votre document ici...</p>`,
  },
};

// ─── PURE FUNCTIONS ──────────────────────────────────────────────────────────

export function getPopulatedTemplate(html: string, data?: Record<string, any>): string {
  if (!data) return html;
  return html
    .replace(/{{fullName}}/g, data.fullName || '')
    .replace(/{{title}}/g, data.title || '')
    .replace(/{{titleAr}}/g, data.titleAr || '')
    .replace(/{{nameAr}}/g, data.nameAr || '')
    .replace(/{{city}}/g, data.city || '')
    .replace(/{{cityAr}}/g, data.cityAr || '')
    .replace(/{{address}}/g, data.address || '')
    .replace(/{{addressAr}}/g, data.addressAr || '')
    .replace(/{{phone}}/g, data.phone || '')
    .replace(/{{email}}/g, data.email || '');
}

/** Returns CSS for the absolutely-positioned border frame inside the page. */
export function buildBorderFrameStyle(b: BorderConfig): CSSProperties {
  if (!b.enabled || b.pattern === "none") return { display: "none" };
  const { color, width, pattern, radius, offset } = b;
  const base: CSSProperties = {
    position: "absolute",
    top: offset, left: offset, right: offset, bottom: offset,
    borderRadius: radius ? `${radius}px` : 0,
    pointerEvents: "none",
    zIndex: 3,
    boxSizing: "border-box",
  };
  switch (pattern) {
    case "solid": return { ...base, border: `${width}px solid ${color}` };
    case "dashed": return { ...base, border: `${width}px dashed ${color}` };
    case "dotted": return { ...base, border: `${width}px dotted ${color}` };
    case "double": return { ...base, border: `${width * 3}px double ${color}` };
    case "groove": return { ...base, border: `${width}px groove ${color}` };
    case "double-frame": return {
      ...base, border: `${width}px solid ${color}`,
      outline: `${Math.max(1, Math.round(width / 2))}px solid ${color}`,
      outlineOffset: `${-(width + Math.max(1, Math.round(width / 2)) + 3)}px`,
    };
    case "shadow-glow": return {
      ...base, border: `${width}px solid ${color}`,
      boxShadow: `0 0 ${width * 4}px ${color}66,0 0 ${width * 2}px ${color}33,inset 0 0 ${width * 3}px ${color}22`,
    };
    case "zigzag": {
      const s = Math.max(4, width * 1.5);
      return {
        ...base, border: `${width}px solid transparent`,
        borderImage: `repeating-linear-gradient(90deg,${color} 0,${color} ${s}px,transparent ${s}px,transparent ${s * 2}px) ${width}//${width}px repeat,` +
          `repeating-linear-gradient(0deg,${color} 0,${color} ${s}px,transparent ${s}px,transparent ${s * 2}px) ${width}//${width}px repeat`,
      } as CSSProperties;
    }
    case "corners": return { ...base, border: `${Math.max(1, width - 2)}px solid ${color}` };
    default: return { ...base, border: `${width}px solid ${color}` };
  }
}

/** Returns CSS for the page container div. */
export function buildPageStyle(
  pw: number, ph: number,
  margins: Margins,
  docFontSize: number,
  rtl: boolean,
): CSSProperties {
  return {
    width: `${pw}mm`, minHeight: `${ph}mm`,
    background: "#fff",
    boxShadow: "0 6px 40px rgba(61,191,184,.15)",
    display: "flex", flexDirection: "column",
    position: "relative",
    fontSize: docFontSize,
    fontFamily: "'Georgia','Times New Roman',serif",
    direction: rtl ? "rtl" : "ltr",
    boxSizing: "border-box",
    paddingTop: `${margins.top}mm`,
    paddingRight: `${margins.right}mm`,
    paddingBottom: `${margins.bottom}mm`,
    paddingLeft: `${margins.left}mm`,
  };
}

/** Scales a BorderConfig for mini-preview rendering. */
export function scaleBorder(b: BorderConfig, scale: number): BorderConfig {
  return {
    ...b,
    width: Math.max(1, Math.round(b.width * scale)),
    offset: Math.round(b.offset * scale),
    radius: Math.round(b.radius * scale),
  };
}

/** Derives computed page dimensions respecting orientation. */
export function getPageDimensions(pageSize: PageSize, orientation: Orientation): { pw: number; ph: number } {
  return {
    pw: orientation === "landscape" ? pageSize.h : pageSize.w,
    ph: orientation === "landscape" ? pageSize.w : pageSize.h,
  };
}
