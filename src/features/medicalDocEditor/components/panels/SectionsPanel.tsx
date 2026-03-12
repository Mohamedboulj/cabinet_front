import { C, type EditTarget, type PanelId } from "../../utils/medicalDocEditor.utils";

const SECTIONS: { id: EditTarget; icon: string; label: string; desc: string }[] = [
  { id: "header", icon: "🔝", label: "En-tête",      desc: "Nom du médecin, diplômes, date"     },
  { id: "body",   icon: "📝", label: "Corps",        desc: "Contenu principal du certificat"    },
  { id: "footer", icon: "🔻", label: "Pied de page", desc: "Adresse, téléphone, email"          },
];

interface Props {
  editTarget:     EditTarget;
  activePanel:    PanelId;
  setEditTarget:  (t: EditTarget) => void;
  setActivePanel: (p: PanelId) => void;
}

export function SectionsPanel({ editTarget, activePanel, setEditTarget, setActivePanel }: Props) {
  return (
    <>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 12, lineHeight: 1.5 }}>
        Cliquez sur une section pour l'activer dans l'éditeur.
      </p>
      {SECTIONS.map(({ id, icon, label, desc }) => {
        const isActive = editTarget === id && activePanel === "section";
        return (
          <div key={id}
            onClick={() => { setEditTarget(id); setActivePanel("section"); }}
            style={{
              border: `2px solid ${isActive ? C.teal : C.border}`,
              borderRadius: 8, padding: "11px 13px", marginBottom: 10, cursor: "pointer",
              background: isActive ? C.tealLight : "#fff",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: C.tealDark }}>{icon} {label}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{desc}</div>
          </div>
        );
      })}
    </>
  );
}
