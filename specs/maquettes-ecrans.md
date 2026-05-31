# Maquettes écrans — Lulu Santé

**Version :** 1.2  
**Date :** 30 mai 2026  
**Références :** [CDF](./cahier-des-charges-fonctionnel.md) §11 · [Design system DSFR + Tailwind](./design-system.md) · [Prototype React](../frontend/) · [Canvas interactif](/C:/Users/xsima/.cursor/projects/c-Users-xsima-Desktop-lulu-sante/canvases/lulu-sante-maquettes.canvas.tsx)

---

## 1. Principes UX

| Principe | Application |
|----------|-------------|
| **Langue** | Interface 100 % française |
| **Public** | Gestionnaires APRS, référents CM/MT, direction, admin |
| **Structure** | Navigation latérale fixe + zone de contenu |
| **Filtres globaux** | Période et pôle visibles en en-tête sur tous les écrans analytiques |
| **Drill-down** | Tout indicateur ou alerte mène à la liste de dossiers concernés |
| **Accessibilité** | Contrastes RGAA AA, navigation clavier, libellés explicites |
| **Design system** | [DSFR](https://www.systeme-de-design.gouv.fr/) via `@codegouvfr/react-dsfr` + Tailwind (`tw-`) pour la mise en page |

---

## 2. Arborescence

```
├── Connexion               [Tous]
├── Dashboard APRS          [Tous]
├── Dossiers
│   ├── Liste + filtres
│   ├── Wizard création (3 étapes)
│   └── Fiche dossier
│       ├── Synthèse
│       ├── Arrêts
│       ├── Conseil médical      [GEST, RCME]
│       ├── Médecine du travail  [GEST, RMED]
│       ├── Maintien en emploi
│       ├── Parcours PPR
│       └── Retraite
├── Indicateurs (§1–§9)
├── KPI direction           [DIR]
├── Exports
└── Administration        [ADMN]
```

---

## 3. Écrans détaillés

### 3.0 Connexion

**Objectif :** Authentifier l'utilisateur sur le serveur LAN.

| Zone | Contenu |
|------|---------|
| Formulaire | Identifiant, mot de passe |
| Action | Bouton « Se connecter » |
| Info | Adresse serveur local, version applicative |
| Session | Expiration après 2 h d'inactivité |
| Mot de passe | Bouton « Voir » / « Masquer » (reveal) |

**Profils :** GEST, RCME, RMED, DIR, ADMN — droits appliqués après connexion.

---

### 3.1 Dashboard APRS (accueil)

**Objectif :** Vue synthétique des 9 indicateurs stratégiques + alertes.

| Zone | Contenu |
|------|---------|
| En-tête | Titre, sélecteur période/pôle, bouton « Exporter PDF » |
| Grille 3×3 | 9 KPI APRS avec valeur et évolution vs période précédente |
| Alertes | Tableau : type, n° dossier, agent, durée, lien « Ouvrir » |

**Actions :** clic alerte → fiche dossier · export PDF · drill-down KPI

---

### 3.2 Liste dossiers

**Objectif :** Rechercher et accéder aux dossiers actifs/clôturés.

| Zone | Contenu |
|------|---------|
| Barre d'action | « + Nouveau dossier » → ouvre le wizard |
| Filtres | Recherche texte, statut, type absence, pôle |
| Tableau | N° dossier, agent, pôle, type, durée, statut, complet |
| Pagination | Compteur dossiers actifs |

---

### 3.3 Wizard création dossier (3 étapes)

**Objectif :** Créer un dossier APRS depuis la liste.

| Étape | Titre | Champs |
|-------|-------|--------|
| **1 — Agent** | Sélection agent | Recherche matricule/nom · liste agents · « Créer agent » |
| **2 — Dossier** | Informations dossier | Date réception arrêt*, date création*, type absence*, pôle*, n° dossier auto |
| **3 — Arrêt** | Premier épisode | Date début*, date fin, type absence, jours ouvrables · confirmation |

**Navigation :** Retour · Annuler · Suivant · Créer le dossier (étape 3)

**Maquette canvas :** étape 2 affichée en modale centrée sur la liste dossiers.

---

### 3.4 Fiche dossier — Synthèse

| Zone | Contenu |
|------|---------|
| En-tête | N° dossier, agent, matricule, pôle, type · bouton Clôturer |
| Onglets | Synthèse · Arrêts · CM · MT · Maintien · PPR · Retraite |
| Synthèse | Chronologie · 4 stats · délais clés |
| Verrouillage | Badge « Verrouillé par X » si édition concurrente |

---

### 3.5 Fiche dossier — Conseil médical (CM)

**Profil écriture :** RCME (+ GEST, ADMN)

| Zone | Contenu |
|------|---------|
| Liste | Date saisine, date avis, résultat (FAVR/DEFA/SURS), délai calculé |
| Formulaire | Date saisine*, date avis, résultat (liste déroulante) |
| Calcul auto | Délai instruction = date avis − date saisine |
| Actions | + Nouvelle saisine · Enregistrer · Saisir avis (ligne en attente) |

**Indicateurs alimentés :** §4a (saisines, délai, avis favorables/défavorables/sursis)

---

### 3.6 Fiche dossier — Médecine du travail (MT)

**Profil écriture :** RMED (+ GEST, ADMN)

| Zone | Contenu |
|------|---------|
| Liste | Date visite, type d'avis |
| Formulaire | Date visite*, type d'avis* (APTITU / INAPOP / INAPMT / RECLMT) |
| Alerte | Proposition ouverture PPR si inaptitude au métier |
| Actions | + Nouvelle visite · Enregistrer |

**Indicateurs alimentés :** §4b (aptitudes, inaptitudes poste/métier, reclassements MT)

---

### 3.7 Fiche dossier — Parcours PPR

**Profil écriture :** GEST (+ ADMN)

| Zone | Contenu |
|------|---------|
| Stats | Date entrée, durée parcours, reclassement réussi (oui/non) |
| Formulaire | Date entrée*, date sortie, **date affectation*** , poste affectation |
| Historique | Parcours clôturés avec indicateur réussi |
| Règle D5 | Reclassement réussi = date d'affectation renseignée |

**Indicateurs alimentés :** §8 (entrées/sorties/total, taux entrée, durée moyenne) · KPI reclassement §9

---

### 3.8 Indicateurs détaillés

Grille des 9 sections README + drill-down par section (stats, tableaux).

---

### 3.9 KPI direction

Tableau §9 : KPI, valeur, objectif, N−1, évolution · Snapshot · Export comité.

---

### 3.10 Administration

Utilisateurs (login, rôle CHAR(4)), paramètres (20 j), sauvegarde, import XLS.

---

## 4. Modales et flux secondaires

### 4.1 Export

- Format : PDF / Excel
- Périmètre : dashboard, section, liste dossiers

### 4.2 Import agents

- Fichier XLS/XLSX · mapping colonnes · rapport import

---

## 5. Matrice écran × profil

| Écran | GEST | RCME | RMED | DIR | ADMN |
|-------|:----:|:----:|:----:|:---:|:----:|
| Connexion | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dashboard | L | L | L | L | L |
| Liste dossiers | E | L | L | L | E |
| Wizard dossier | E | — | — | — | E |
| Fiche — synthèse | E | L | L | L | E |
| Fiche — CM | E | E | — | L | E |
| Fiche — MT | E | — | E | L | E |
| Fiche — PPR | E | L | L | L | E |
| Indicateurs | L | L | L | L | L |
| KPI direction | L | L | L | L | L |
| Admin | — | — | — | — | E |

L = lecture · E = écriture · — = pas d'accès

---

## 6. Composants UI réutilisables

> Implémentation cible : voir [design-system.md](./design-system.md). Le prototype `frontend/` utilise les composants react-dsfr.

| Composant maquette | Composant DSFR | Usage |
|--------------------|----------------|--------|
| `AppShell` | `Header` + `SideMenu` | Layout latéral + en-tête |
| `LoginCard` | `Input` + `PasswordInput` + `Button` | Écran connexion |
| `WizardModal` | `Modal` | Création dossier 3 étapes |
| `WizardSteps` | `Stepper` | Stepper visuel 1-2-3 |
| `FicheHeader` | `Breadcrumb` + `h1` | En-tête dossier commun |
| `FicheTabBar` | `Tabs` | Onglets fiche |
| `WireField` / `WireSelect` | `Input` / `Select` | Champs formulaire |
| `Stat` | Tuile `fr-tile` | KPI unitaire |
| `Table` | `Table` / `fr-table` | Listes et historiques |
| Alertes | `Callout` | Bandeaux dashboard |

---

## 7. Itérations restantes

- [x] Onglets CM / MT / PPR en détail (formulaires)
- [x] Modale création dossier (wizard étape 2)
- [x] Écran connexion
- [x] Wizard étapes 1 et 3 (vues dédiées)
- [x] Onglets Arrêts, Maintien, Retraite
- [ ] Version mobile tablette (consultation seule)

---

*Maquette interactive (11 écrans) : [lulu-sante-maquettes.canvas.tsx](/C:/Users/xsima/.cursor/projects/c-Users-xsima-Desktop-lulu-sante/canvases/lulu-sante-maquettes.canvas.tsx)*
