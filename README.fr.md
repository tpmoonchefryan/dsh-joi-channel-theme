<p align="center">
  <img src="./docs/app-logo-flowers.png" width="380" alt="Thème deux tenues Joi · logo duo">
</p>

<h1 align="center">Thème Joi — Deux Tenues</h1>

<p align="center">
  <strong>Faites de DeepSeek Harness sa chambre.</strong><br>
  Un thème DeepSeek Harness non officiel et non commercial, inspiré de Joi, VTuber du groupe VirtuaReal.
</p>

<p align="center">
  <a href="./README.en.md">English</a> ·
  <a href="./README.md">简体中文</a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <strong>Français</strong>
</p>

<p align="center">
  <img alt="DeepSeek Harness" src="https://img.shields.io/badge/DeepSeek-Harness-4D6BFE?style=flat-square&logoColor=white">
  <img alt="Claude Fable 5" src="https://img.shields.io/badge/Claude-Fable%205-D97757?style=flat-square&logoColor=white">
  <a href="https://space.bilibili.com/61639371"><img alt="Joi sur Bilibili" src="https://img.shields.io/badge/Bilibili-Joi-00A1D6?style=flat-square&logo=bilibili&logoColor=white"></a>
</p>

<p align="center">
  <img alt="dsh web plugin" src="https://img.shields.io/badge/dsh%20plugin-web-8B5CF6?style=flat-square">
  <img alt="Deux tenues" src="https://img.shields.io/badge/tenues-Flowers%20%C2%B7%20Library-EE7F2D?style=flat-square">
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/code-MIT-3DA639?style=flat-square"></a>
  <a href="./LICENSE-ASSETS.md"><img alt="CC BY-NC-SA 4.0" src="https://img.shields.io/badge/assets-CC%20BY--NC--SA%204.0-EF9421?style=flat-square"></a>
</p>

<p align="center">
  <a href="#overview">Présentation</a> ·
  <a href="#gallery">Aperçu</a> ·
  <a href="#states">Jeu d'états</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#wardrobe">Garde-robe & natif</a> ·
  <a href="#design">Design & technique</a> ·
  <a href="#license">Licence</a>
</p>

---

<a id="overview"></a>

## Présentation

Joi est une VTuber active sur la plateforme vidéo chinoise Bilibili, membre du
groupe d'artistes virtuels VirtuaReal.

Elle aime le pixel art, le cyberpunk et le film *Blade Runner* ; déteste le sport ;
son talent : « avaler une mandarine entière, peau comprise, en une bouchée » — elle
tient la mandarine pour le fruit parfait, et 🍊 est ainsi devenu son emoji de fait
(non officiel).

Ce thème transforme **ses deux tenues officielles en deux pièces complètes** :
**Joi·Flowers**, chaleureuse comme une scène, et **Joi·Library**, feutrée comme un
bureau. Ce n'est pas une peau unique dont on tourne la teinte — fonds, panneaux,
bulles, coloration syntaxique, textures et jeu des personnages forment deux systèmes
autonomes qui **ne se mélangent jamais**. Et le mot « garde-robe » est précisément
l'endroit où le récit de la Joi du film se pose sur cette interface.

| Tenues | Apparence | Créneaux sémantiques | Personnages | Ressources embarquées |
| :---: | :---: | :---: | :---: | :---: |
| `2` | `clair · sombre · système` | `7 + feuille` | `Joi · Zhouxin · Whale Musume` | `10 fichiers · 2,4 Mo · zéro externe` |

> [!IMPORTANT]
> **Œuvre de fan non officielle.** Ce projet n'a aucun lien d'affiliation,
> d'autorisation, de partenariat, de parrainage ou d'approbation avec Joi,
> VirtuaReal, Bilibili, DeepSeek ni aucun ayant droit. Les noms, apparences et
> univers des personnages ainsi que les droits de marque appartiennent à leurs
> titulaires respectifs.

<a id="gallery"></a>

## Aperçu

La page nouvelle session : elle se tient à l'entrée de la pièce, le regard posé sur
le titre ; la Whale Musume somnole sur celui-ci, les griffes enfoncées d'exactement
quatre pixels dans les glyphes — l'unique indice de profondeur qui fasse lire
« couchée dessus ».

| | Joi·Flowers | Joi·Library |
| ---: | :---: | :---: |
| **Clair** | <img src="./docs/new-chat-flowers.png" width="410" alt="Joi·Flowers nouvelle session, clair"> | <img src="./docs/new-chat-library.png" width="410" alt="Joi·Library nouvelle session, clair"> |
| **Sombre** | <img src="./docs/new-chat-flowers-dark.png" width="410" alt="Joi·Flowers nouvelle session, sombre"> | <img src="./docs/new-chat-library-dark.png" width="410" alt="Joi·Library nouvelle session, sombre"> |

Clair et sombre suivent toujours le réglage d'apparence de l'application ; une tenue
change la teinte, jamais la luminosité. Les quatre quadrants (deux tenues ×
clair/sombre) sont vérifiés valeur par valeur contre une même base de référence gelée.

### Le portrait en duo

Le glyphe de baleine en haut à gauche de la barre latérale cède la place à un
**portrait en duo** — la Whale Musume et Joi serrées dans un même autocollant
die-cut : le moteur et elle, aucun des deux n'est optionnel. Le portrait se
change avec la tenue, son liseré blanc est cuit dans l'image pour tenir sur
fond clair, et les deux visuels sont alignés sur le même canevas : les visages
ne bougent pas d'un pixel quand on change de tenue.

<p align="center">
  <img src="./docs/app-logo-flowers.png" width="360" alt="Logo duo Flowers">
  &nbsp;&nbsp;
  <img src="./docs/app-logo-library.png" width="360" alt="Logo duo Library">
</p>

<a id="states"></a>

## Jeu d'états

Sur la page de conversation, deux petits compagnons sont assis au-dessus du champ de
saisie : **Zhouxin** (mascotte de fans) à gauche, **Joi** en chibi à droite. Ils
changent d'expression avec le tour en cours — même vocabulaire, même instant de
règlement, jamais désynchronisés :

| | Joi·Flowers | Joi·Library |
| ---: | :---: | :---: |
| **Repos** `info` | <img src="./docs/idle-flowers.png" width="380" alt="Flowers repos"> | <img src="./docs/idle-library.png" width="380" alt="Library repos"> |
| **En cours** `running` | <img src="./docs/working-flowers.png" width="380" alt="Flowers en cours"> | <img src="./docs/working-library.png" width="380" alt="Library en cours"> |
| **Succès** `success` | <img src="./docs/success-flowers.png" width="380" alt="Flowers succès"> | <img src="./docs/success-library.png" width="380" alt="Library succès"> |
| **Échec** `error` | <img src="./docs/failed-flowers.png" width="380" alt="Flowers échec"> | <img src="./docs/failed-library.png" width="380" alt="Library échec"> |

Quand un tour réussit, les deux rayonnent ensemble ; quand il échoue, les deux
baissent les yeux avec une seule larme — tristes cinq secondes, puis de retour à
leur poste. L'échec n'est jamais joué en sanglots : ce n'est pas leur caractère.

Dans les longues conversations, toute ligne de texte qui chevauche un personnage
reçoit automatiquement un liseré couleur de fond — la lisibilité prime toujours sur
la mignonnerie.

<a id="installation"></a>

## Installation

### Deux prérequis

| Prérequis | Pourquoi | Vérifier |
| --- | --- | --- |
| **Node.js** `^22.19` ou `>=24` | Le socle d'exécution de DeepSeek Harness | `node -v` |
| **pnpm** | `dsh plugin` n'est qu'un relais vers pnpm ; sans lui : `pnpm not found on PATH` | `pnpm -v` |

Si pnpm manque, installez-le (au choix) :

```bash
npm install -g pnpm
```

```bash
corepack enable pnpm
```

### Cas A : vous lancez harness via `npx`

Si votre habitude est `npx @deepseek-ai/dsh web`, alors `dsh` **n'est pas dans
votre PATH** — taper `dsh plugin ...` seul renvoie `command not found`. Reprenez
le même préfixe `npx` :

```bash
npx @deepseek-ai/dsh plugin --profile web add dsh-joi-channel-theme
```

Puis démarrez comme d'habitude :

```bash
npx @deepseek-ai/dsh web
```

> [!IMPORTANT]
> **Le profil doit s'appeler `web`.** Seuls `web` et `headless` embarquent un
> modèle ; tout autre nom produit un profil vide, sans interface web, et rien
> ne se charge.

### Cas B : vous préférez taper moins

Installez harness globalement et `dsh` devient directement disponible :

```bash
npm install -g @deepseek-ai/dsh
```

```bash
dsh plugin --profile web add dsh-joi-channel-theme && dsh web
```

### Ensuite

Ouvrez l'adresse affichée dans le terminal (`http://127.0.0.1:3080` par défaut),
rechargez une fois : elle est là.

**Si harness tourne déjà**, les plugins ne se chargent pas à chaud — les
changements d'ensemble de plugins prennent effet au redémarrage. Faites `Ctrl+C`,
installez, puis relancez.

### Désinstaller

```bash
npx @deepseek-ai/dsh plugin --profile web remove dsh-joi-channel-theme
```

> [!NOTE]
> **C'est la seule fois où vous touchez un terminal.** Tout le reste se passe dans
> l'interface : la garde-robe — et le retour à l'apparence DeepSeek d'origine —
> partagent la même rangée sous Réglages → Général. DeepSeek Harness ne propose
> actuellement aucun installateur graphique de plugins ; cette étape est donc
> incontournable.

> [!TIP]
> Après retrait, l'interface revient au natif élément par élément — jetons,
> favicon, logotype, couleurs de syntaxe, zéro résidu — vérifié sur instance réelle.

<details>
<summary><strong>En cas de problème</strong></summary>

**`dsh: command not found`** — harness n'est pas installé globalement. Utilisez
`npx @deepseek-ai/dsh plugin ...` (cas A), ou faites d'abord
`npm install -g @deepseek-ai/dsh` (cas B).

**`dsh: pnpm not found on PATH`** — `dsh plugin` a besoin de pnpm pour gérer les
dépendances du profil. Lancez `npm install -g pnpm` ou `corepack enable pnpm`.

**Installé mais rien ne change** — les changements d'ensemble de plugins prennent
effet au redémarrage. Arrêtez harness, relancez-le, puis forcez le rechargement du
navigateur (`Cmd/Ctrl+Shift+R`).

**Depuis une copie locale (pour le développement)**

```bash
dsh plugin --profile web add /path/to/dsh-joi-channel-theme
```

L'installation directe depuis GitHub est **déconseillée** : pnpm ≥10 bloque le
script de build `prepare`, le premier `add` échoue donc systématiquement et il
faut recopier la clé de paquet affichée dans le `pnpm-workspace.yaml` du profil,
sous `allowBuilds`, puis relancer. Le paquet npm est livré déjà compilé et ne
demande aucune autorisation de build.

</details>

<a id="wardrobe"></a>

## Garde-robe & natif

La **garde-robe** se trouve dans Réglages → Général → 换装 : deux cartes de tenue ;
choisissez-en une et la pièce suit. La moitié basse conserve les trois cases natives
clair / sombre / système — la luminosité appartient toujours à l'application.

**« DeepSeek d'origine » est la troisième carte**, juste à côté des deux tenues :
choisissez-la et l'interface revient au DeepSeek d'origine, le plugin restant
installé ; rechoisissez une tenue et elle revient aussitôt. Installer le plugin
n'impose jamais le thème.

Ce n'est pas un interrupteur d'activation du plugin, car cela n'en a jamais été un :
la choisir ne désactive rien — le bundle reste installé et chargé, et son état dans
la liste des plugins ne bouge pas. Ce qui change, c'est uniquement l'apparence.

<details>
<summary><strong>Ce qui se cache dans cette pièce (clins d'œil de design)</strong></summary>

- **Une mandarine qui mûrit** — l'usage du contexte n'est pas un anneau de
  progression mais une mandarine qui mûrit du vert profond à l'orange rouge.
  Trop mûre, c'est déjà l'alerte ; la feuille reste verte et la tige brune,
  car l'identité ne change pas avec l'état.
- **Le bleu baleine constant** — modèle, usage et sous-agents gardent la même
  couleur dans les deux tenues. Les personnes changent de tenue ; les outils, non.
- **Le quota d'or** — la couleur de ses iris `#FFCE65` peut inonder les bulles
  utilisateur en Flowers, mais n'apparaît en Library qu'à l'échelle d'une broche.
  La retenue aussi est un design.
- **La texture comme étoffe** — les pois-pétales de Flowers viennent de l'imprimé
  de sa robe ; le papier millimétré de Library, des traits de dessin technique.
- **Chirurgie du logotype** — le mot deepseek de la barre latérale est
  soigneusement recomposé sur deux lignes, le badge HARNESS aligné exactement sur
  le « e » de « ek » — sans changer un octet du SVG natif, entièrement réversible.
- **🍊 partout** — le favicon et les puces de premier niveau sont ce fruit parfait.
- **Petites baleines des sous-agents** — les sous-tâches concurrentes s'alignent en
  petites baleines : yeux fermés en file, jet d'eau en action, yeux plissés une
  fois finies.

</details>

<a id="design"></a>

## Design & technique

Ce thème a eu **une base de référence gelée avant d'avoir du code** : chaque valeur
de couleur, chaque ancre, chaque ratio de cellule de sprite vit dans un unique
`baseline-4q.json` ; le code génère ses constantes depuis cette base au moment du
build — la copie manuelle est interdite.
Le script de régression vérifie les quatre quadrants contre la même base
(283 assertions doivent passer).

| Élément | Valeur |
| --- | --- |
| ID du plugin | `dsh-joi-channel-theme` |
| Forme | bundle dsh + plugin client web (chemin d'installation officiel, aucun fork du client) |
| Surcouche de jetons | par tenue : rampe neutre 19 crans + 44 alias sémantiques + 9 jetons de syntaxe, clair & sombre |
| Ressources personnages | Joi 2×2 ×2 tenues · Zhouxin 2×2 · Whale Musume couchée/debout · mini-baleines 1×3 |
| Ressources embarquées | 10 data URI WebP, 2,4 Mo au total, zéro requête externe (compatible CSP) |
| Compatibilité | DeepSeek Harness web `0.1.0-rc.5+` |
| Pour aller plus loin | [Doc de développement](./docs/DEVELOPMENT.md) |

<details>
<summary><strong>Structure du dépôt</strong></summary>

```text
dsh-joi-channel-theme/
├── README.md                 # chinois (principal) ; en/ja/ko/fr au même niveau
├── LICENSE                   # code : MIT
├── LICENSE-ASSETS.md         # ressources : CC BY-NC-SA 4.0
├── THIRD_PARTY_NOTICES.md
├── cordis.patch.yml          # couche bundle dsh
├── src/                      # moitié hôte + moitié navigateur
├── scripts/                  # génération base/ressources · alignement sprites · régression 4 quadrants
├── stuff/                    # ressources sources (y compris prises non retenues)
└── docs/                     # captures & doc de développement
```

</details>

<a id="license"></a>

## Licence & droits

Ce dépôt applique une licence différenciée :

- Le code, la configuration originale du projet et les textes de documentation sont
  sous [licence MIT](./LICENSE) ;
- Les contributions visuelles originales de `stuff/` et `docs/` que l'auteur est
  légalement en droit de licencier sont sous
  [CC BY-NC-SA 4.0](./LICENSE-ASSETS.md) — attribution, usage non commercial,
  partage dans les mêmes conditions.

> [!WARNING]
> Les deux licences ne couvrent que les parties originales que le mainteneur ou les
> contributeurs peuvent légalement licencier. Elles ne confèrent aucun droit sur le
> nom, l'apparence ou l'univers de Joi, ni sur les noms, marques, ressources ou
> références de VirtuaReal, Bilibili, DeepSeek ou de tout autre tiers.

Le périmètre complet des droits est documenté dans
[`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).

---

<p align="center">
  <sub>Unofficial fan project · Code MIT · Original assets CC BY-NC-SA 4.0 · 🍊</sub>
</p>
