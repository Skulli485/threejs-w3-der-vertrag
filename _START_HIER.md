# Three.js Deep Dive — GLSL-Shader: „Der Vertrag"

**Datum:** Dienstag, 23.06.2026  ·  **Woche 3, Tag 2**
**Rolle heute:** Webapp-Entwickler
**Arbeitsrahmen:** Lumen, eine vorbereitete SaaS-Plattform fuer Produkt-Analytics und Deployments

Heute ist Shader-Arbeit gleich Produktarbeit. Kein einzelnes Kunst-Canvas, kein Effekt ohne Kontext. Ihr baut eine Shader-Schicht in eine echte Webapp-Oberflaeche: zuerst sichtbar im Warmup, dann gemeinsam in der Lecture, dann in einem kleinen Projekt, das ihr abschicken koennt, danach als Hausaufgabe mit Live-Deploy.

---

## Der Tag in Dateien

| Zeit | Datei | Zweck |
|---|---|---|
| 08:30 | `00_WARMUP/WARMUP_0830_DER_VERTRAG.md` | Kurze Lesephase, dann zwei Visualizer nebeneinander |
| 08:30 | `00_WARMUP/VISUALIZER_A_glsl-playground.html` | Der Shader als Kunst-Canvas, mit Uniforms-Panel |
| 08:30 | `00_WARMUP/VISUALIZER_B_produkt-surface.html` | Dasselbe Prinzip als Lumen-Produkt-Surface |
| 09:00 | `01_LECTURE/LECTURE_0900_DER_VERTRAG.md` | Die Lecture, vom Vertrag bis zur bewegten Surface |
| 12:30 | `02_IN_CLASS_PROJECT/PROJEKT_1230_RELEASE_SURFACE.md` | 45 Minuten: die Live-Surface mit `uColor` und `uTime` |
| nach dem Kurs | `03_HOMEWORK/HAUSAUFGABE_SHADER_SURFACE.md` | Hausaufgabe als Markdown |
| nach dem Kurs | `03_HOMEWORK/HAUSAUFGABE_SHADER_SURFACE.html` | Dieselbe Hausaufgabe als visuelle Seite |
| durchgehend | `04_STARTER_APP/` | Der Zero-Build-Starter, Three.js r184 per Importmap |

---

## Was heute bleibt

Ein Shader in Three.js ist ein Vertrag zwischen dem JavaScript auf der CPU und zwei kleinen Programmen auf der GPU. Der Vertex-Shader setzt Positionen, der Fragment-Shader setzt Farben. Daten laufen ueber drei Kanaele.

| Kanal | Richtung | Bedeutung in der Webapp |
|---|---|---|
| `attribute` | Buffer zur GPU, pro Vertex | `position` und `uv` kommen aus der Geometrie |
| `uniform` | CPU zur GPU, pro Draw-Call | `uColor` und `uTime` steuern die Surface live |
| `varying` | Vertex-Shader zum Fragment-Shader | `vUv` wird pro Pixel interpoliert und macht den Verlauf adressierbar |

Das ist dieselbe Art Denken wie bei API-Grenzen, Component-Props und Server-Contracts. Namen, Typen und Zustaendigkeiten zaehlen. Laufen der Name im GLSL und der Name im JavaScript auseinander, ist das kein schoener Fehler, es ist ein falsches Bild.

---

## Warum das Karrierearbeit ist

Shader landen in echten Produkten: Gradient-Heroes bei Stripe, Linear und Vercel, Auth-Hintergruende, Bild- und Videofilter, Page-Transitions, Kartenlayer, Web-Editoren, Datenvisualisierung bei grossen Mengen, Loading-States, Empty-States und CTA-Flaechen. Die Leistung kommt daher, dass die GPU Millionen Pixel parallel berechnet, waehrend die CPU nur kleine Werte wie Farbe und Zeit schickt.

Der Webapp-Skill heute: Du entscheidest, welche Arbeit in DOM und CSS bleibt, welche Arbeit auf die GPU wandert, und wie sauber der Vertrag zwischen beiden Seiten aussieht.

---

## Schnellstart fuer den Starter

```bash
cd 04_STARTER_APP
python -m http.server 5173
```

Dann im Browser:

```text
http://localhost:5173
```

Kein Build noetig. Der Starter pinnt Three.js auf `0.184.0` ueber eine Importmap. Beim ersten Start braucht ihr Internet, damit Three.js von unpkg geladen wird.

---

## Abgabe

Fuer das Projekt im Kurs reicht der lokale Stand. Fuer die Hausaufgabe liefert ihr eine Live-URL, einen Repo-Link und eine kurze Engineer-Note: Was injiziert `ShaderMaterial`, was laesst `RawShaderMaterial` offen, und worueber reden Vertex- und Fragment-Shader miteinander.

---

*Three.js Deep Dive | Woche 3, Tag 2 | Der Vertrag | Morphos GmbH*
