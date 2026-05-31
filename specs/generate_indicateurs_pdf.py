#!/usr/bin/env python3
"""Génère le PDF des indicateurs RH — absences pour raison de santé."""

from fpdf import FPDF
from pathlib import Path

OUTPUT = Path(__file__).parent / "Indicateurs-RH-Absences-Sante.pdf"

# Couleurs (RGB)
PRIMARY = (0, 82, 147)
SECONDARY = (51, 51, 51)
ACCENT = (0, 120, 80)
LIGHT_BG = (245, 247, 250)
TABLE_HEADER = (0, 82, 147)
TABLE_ALT = (240, 244, 248)


FONT_DIR = Path("C:/Windows/Fonts")
FONT_REG = "Arial"
FONT_BOLD = "ArialB"
FONT_ITALIC = "ArialI"


class IndicateursPDF(FPDF):
    def setup_fonts(self):
        self.add_font(FONT_REG, "", str(FONT_DIR / "arial.ttf"))
        self.add_font(FONT_BOLD, "", str(FONT_DIR / "arialbd.ttf"))
        self.add_font(FONT_ITALIC, "", str(FONT_DIR / "ariali.ttf"))

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font(FONT_ITALIC, "", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, "Indicateurs RH — Absences pour raison de santé", align="C")
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font(FONT_ITALIC, "", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def section_title(self, number: str, title: str):
        self.ln(4)
        self.set_fill_color(*PRIMARY)
        self.set_text_color(255, 255, 255)
        self.set_font(FONT_BOLD, "", 12)
        self.cell(0, 10, f"  {number}. {title}", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(*SECONDARY)
        self.ln(2)

    def subsection(self, title: str):
        self.set_font(FONT_BOLD, "", 10)
        self.set_text_color(*PRIMARY)
        self.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(*SECONDARY)
        self.ln(1)

    def bullet(self, text: str, indent: int = 8):
        self.set_font(FONT_REG, "", 9)
        self.set_x(self.l_margin + indent)
        w = self.w - self.l_margin - self.r_margin - indent
        self.multi_cell(w, 5, f"-  {text}")
        self.ln(0.5)

    def note(self, text: str):
        self.set_font(FONT_ITALIC, "", 9)
        self.set_text_color(80, 80, 80)
        self.multi_cell(0, 5, text)
        self.set_text_color(*SECONDARY)
        self.ln(1)

    def formula(self, text: str):
        self.set_fill_color(*LIGHT_BG)
        self.set_font(FONT_REG, "", 9)
        self.multi_cell(0, 6, text, fill=True)
        self.ln(2)


def build_pdf(output: Path | None = None) -> Path:
    target = output or OUTPUT
    pdf = IndicateursPDF()
    pdf.setup_fonts()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # --- Page de titre ---
    pdf.ln(25)
    pdf.set_font(FONT_BOLD, "", 22)
    pdf.set_text_color(*PRIMARY)
    pdf.multi_cell(0, 12, "Tableau de bord des indicateurs RH", align="C")
    pdf.ln(4)
    pdf.set_font(FONT_REG, "", 14)
    pdf.set_text_color(*SECONDARY)
    pdf.multi_cell(
        0,
        8,
        "Absences pour raison de santé\n(arrêt maladie, longue maladie, invalidité, inaptitude)",
        align="C",
    )
    pdf.ln(10)
    pdf.set_draw_color(*PRIMARY)
    pdf.set_line_width(0.8)
    pdf.line(40, pdf.get_y(), 170, pdf.get_y())
    pdf.ln(12)

    pdf.set_font(FONT_BOLD, "", 11)
    pdf.cell(0, 8, "Cadre d'analyse — 4 dimensions", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    dimensions = [
        "Volume — combien de situations à gérer",
        "Délais — rapidité de traitement",
        "Prévention et retour à l'emploi",
        "Impact organisationnel",
    ]
    for d in dimensions:
        pdf.bullet(d)

    pdf.ln(8)
    pdf.note(
        "Ce document recense l'ensemble des indicateurs recommandés pour le suivi "
        "des agents en arrêt maladie, longue maladie, longue durée, invalidité, "
        "inaptitude ou absences pour raison de santé."
    )

    # --- Section 1 ---
    pdf.add_page()
    pdf.section_title("1", "Indicateurs d'activité")

    pdf.subsection("Nombre total de dossiers suivis")
    for item in ["Dossiers actifs", "Nouveaux dossiers du mois", "Dossiers clôturés"]:
        pdf.bullet(item)

    pdf.ln(2)
    pdf.subsection("Répartition par type d'absence")
    types_absence = [
        "Maladie ordinaire (COM)",
        "Longue maladie (CLM)",
        "Longue durée (CLD)",
        "Accident de service",
        "Maladie professionnelle",
        "Temps partiel thérapeutique",
        "Disponibilité d'office pour raison de santé",
        "CITIS — Congé pour Invalidité Temporaire Imputable au Service",
    ]
    for t in types_absence:
        pdf.bullet(t)

    pdf.ln(2)
    pdf.subsection("Répartition par pôle")
    pdf.note("Permet d'identifier les services les plus touchés.")

    # --- Section 2 ---
    pdf.section_title("2", "Indicateurs d'absentéisme")

    pdf.subsection("Taux d'absentéisme global")
    pdf.formula("Nombre de jours d'absence / nombre théorique de jours travaillés")

    pdf.subsection("Nombre total de jours d'absence")
    for p in ["Mois", "Trimestre", "Année"]:
        pdf.bullet(p)

    pdf.ln(2)
    pdf.subsection("Durée moyenne des arrêts")
    pdf.note("Exemple :")
    for tranche in ["< 30 jours", "30 à 90 jours", "90 à 180 jours", "> 180 jours"]:
        pdf.bullet(tranche)

    pdf.ln(2)
    pdf.subsection("Nombre d'agents absents depuis plus de")
    for d in ["3 mois", "6 mois", "1 an", "2 ans"]:
        pdf.bullet(d)
    pdf.note("Très utile pour une collectivité ou un établissement public.")

    # --- Section 3 ---
    pdf.section_title("3", "Indicateurs de gestion RH")

    pdf.subsection("Délai moyen d'ouverture d'un dossier")
    pdf.note("Entre réception de l'arrêt et création du dossier.")

    pdf.subsection("Délai moyen de traitement")
    pdf.note("Entre réception et réalisation des démarches obligatoires.")

    pdf.subsection("Taux de dossiers à jour")
    pdf.formula("Nombre de dossiers complets / nombre total de dossiers")

    pdf.subsection("Nombre de dossiers en attente")
    for attente in [
        "Expertise médicale",
        "Avis du conseil médical",
        "Décision administrative",
        "Retour d'un médecin agréé",
    ]:
        pdf.bullet(attente)

    # --- Section 4a ---
    pdf.section_title("4a", "Indicateurs conseil médical")

    pdf.subsection("Nombre de saisines")
    pdf.note("Par mois et par période.")

    pdf.subsection("Délai moyen d'instruction")
    pdf.note("Entre saisine et avis.")

    for item in [
        "Nombre d'avis favorables",
        "Nombre d'avis défavorables",
        "Nombre de sursis à statuer",
    ]:
        pdf.subsection(item)
        pdf.note("Par mois et par période.")

    # --- Section 4b ---
    pdf.section_title("4b", "Indicateurs médecine du travail")

    pdf.subsection("Nombre d'aptitude")
    pdf.note("Par mois et par période.")

    pdf.subsection("Nombre d'inaptitude")
    pdf.note("Par mois et par période.")
    for item in ["Au poste de travail", "Au métier"]:
        pdf.bullet(item)

    pdf.ln(2)
    pdf.subsection("Nombre de reclassement")
    pdf.note("Par mois et par période.")

    # --- Section 5 ---
    pdf.section_title("5", "Indicateurs de retour à l'emploi")

    pdf.subsection("Taux de retour à l'emploi")
    pdf.formula("Agents revenus à leur poste / agents suivis")

    pdf.subsection("Taux de reprise durable")
    pdf.note("Retour maintenu après :")
    for d in ["3 mois", "6 mois", "12 mois"]:
        pdf.bullet(d)

    pdf.ln(2)
    pdf.subsection("Nombre de reprises en")
    for r in ["Temps plein", "Temps partiel thérapeutique", "Reclassement"]:
        pdf.bullet(r)

    pdf.ln(2)
    pdf.subsection("Taux de rechute")
    pdf.formula("Retour puis nouvel arrêt au cours de 6 mois")

    # --- Section 6 ---
    pdf.section_title("6", "Indicateurs de maintien dans l'emploi")

    for item in [
        "Nombre d'études de poste réalisées",
        "Nombre d'aménagements de poste",
        "Nombre de reclassements",
    ]:
        pdf.subsection(item)

    pdf.subsection("Nombre d'agents orientés vers")
    for o in [
        "Médecine du travail",
        "Ergonomie",
        "Accompagnement psychologique",
        "Handicap/FIPHFP",
        "Formation",
        "Bilan de compétences",
    ]:
        pdf.bullet(o)

    # --- Section 7 ---
    pdf.section_title("7", "Indicateurs de départs à la retraite")

    pdf.subsection("Nombre de départs à la retraite")
    pdf.note("Par mois et par période.")
    pdf.subsection("Répartition par motif")
    for motif in [
        "Retraite pour inaptitude",
        "Retraite anticipée pour handicap",
        "Retraite de droit (âge limite)",
        "Autres motifs liés à la santé",
    ]:
        pdf.bullet(motif)

    pdf.ln(2)
    pdf.subsection("Délai moyen de traitement")
    pdf.note("Entre la décision administrative et le départ effectif à la retraite.")

    pdf.subsection("Nombre de dossiers en cours de préparation")
    pdf.note("Dossiers administratifs en cours avant le départ effectif.")

    pdf.subsection("Taux de départ à la retraite")
    pdf.formula("Agents partis à la retraite / agents suivis pour absence de longue durée")

    # --- Section 8 ---
    pdf.add_page()
    pdf.section_title("8", "Indicateurs formation & reclassement (PPR)")

    pdf.subsection("Parcours de reclassement — Nombre d'agents en parcours")
    for p in ["Entrées du mois", "Sorties du mois", "Total"]:
        pdf.bullet(p)

    pdf.ln(2)
    pdf.subsection("Taux d'entrée en parcours")
    pdf.formula(
        "Nombre d'agents orientés vers un reclassement / "
        "nombre d'agents déclarés inaptes (Nombre d'inaptitude)"
    )

    pdf.subsection("Durée moyenne d'un parcours de reclassement")
    pdf.note("Entre l'identification du besoin et l'affectation sur un nouveau poste.")

    # --- Section 9 ---
    pdf.ln(6)
    pdf.section_title("9", "Indicateurs de pilotage (KPIs de direction)")
    pdf.note("Ce sont généralement ceux qui remontent en comité de direction.")

    kpis = [
        ("Taux d'absentéisme global", "Diminuer"),
        ("Nombre d'agents en arrêt > 180 jours", "Diminuer"),
        ("Délai de traitement des dossiers", "Diminuer"),
        ("Taux de retour à l'emploi", "Augmenter"),
        ("Taux de reprise durable à 12 mois", "Augmenter"),
        ("Taux de reclassement réussi", "Augmenter"),
        ("Nombre de dossiers en attente > 30 jours", "Diminuer"),
    ]

    col_w = [110, 70]
    pdf.set_font(FONT_BOLD, "", 9)
    pdf.set_fill_color(*TABLE_HEADER)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(col_w[0], 8, "  KPI", border=1, fill=True)
    pdf.cell(col_w[1], 8, "  Objectif", border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

    pdf.set_text_color(*SECONDARY)
    for i, (kpi, obj) in enumerate(kpis):
        fill = i % 2 == 1
        if fill:
            pdf.set_fill_color(*TABLE_ALT)
        pdf.set_font(FONT_REG, "", 9)
        pdf.cell(col_w[0], 8, f"  {kpi}", border=1, fill=fill)
        pdf.set_font(FONT_BOLD, "", 9)
        color = ACCENT if "Augmenter" in obj else (180, 50, 50)
        pdf.set_text_color(*color)
        pdf.cell(col_w[1], 8, f"  {obj}", border=1, fill=fill, new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(*SECONDARY)

    # --- Section APRS ---
    pdf.ln(6)
    pdf.set_fill_color(0, 100, 70)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font(FONT_BOLD, "", 12)
    pdf.cell(
        0,
        10,
        "  Focus collectivité publique (APRS) — 9 indicateurs stratégiques",
        fill=True,
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.set_text_color(*SECONDARY)
    pdf.ln(3)
    pdf.note(
        "Pour un service spécialisé dans les absences pour raison de santé (APRS), "
        "prioriser le tableau de bord suivant :"
    )

    strategiques = [
        "Nombre de dossiers actifs",
        "Nombre d'agents absents > 6 mois",
        "Nombre d'agents absents > 1 an",
        "Taux d'absentéisme global",
        "Délai moyen de traitement des dossiers",
        "Nombre de saisines Conseil Médical",
        "Taux de retour à l'emploi",
        "Taux de reprise durable à 6 mois",
        "Nombre de reclassements réalisés",
    ]
    for i, ind in enumerate(strategiques, 1):
        pdf.set_font(FONT_BOLD, "", 9)
        pdf.set_text_color(*PRIMARY)
        pdf.cell(12, 6, f"{i}.")
        pdf.set_font(FONT_REG, "", 9)
        pdf.set_text_color(*SECONDARY)
        pdf.cell(0, 6, ind, new_x="LMARGIN", new_y="NEXT")

    pdf.output(str(target))
    return target


if __name__ == "__main__":
    from datetime import datetime

    try:
        path = build_pdf()
    except PermissionError:
        fallback = OUTPUT.with_name(
            f"Indicateurs-RH-Absences-Sante-{datetime.now():%Y%m%d-%H%M%S}.pdf"
        )
        path = build_pdf(fallback)
    print(f"PDF généré : {path}")
