> [!WARNING]
> Bitte gerendert lesen, nicht als Rohtext. In VSCode mit `Strg+Shift+V` (Windows) oder `Cmd+Shift+V` (Mac).

---

# In-Class-Project — Die Lumen Release-Surface
## 45 Minuten | 12:30 bis 13:15 | gemeinsam, im Starter

Ihr macht aus der ruhigen Basis-Flaeche im Lumen-Hero eine echte Live-Produkt-Surface. Am Ende reagiert sie auf eine Produktfarbe, die ihr oben im Hero steuert, und sie bewegt sich ruhig ueber die Zeit. Alles im echten App-Kontext, neben Topbar, Metriken und Empty-State.

**Ihr arbeitet im Ordner** `04_STARTER_APP`. Startet den lokalen Server und oeffnet die Seite:

```bash
cd 04_STARTER_APP
python -m http.server 5173
```

Dann `http://localhost:5173` im Browser. Die Basis-Surface laeuft schon. Im Code (`app.js`) gibt es fuenf markierte Stellen, `GAP 1` bis `GAP 5`. Genau die fuellt ihr jetzt, in dieser Reihenfolge.

> Haltet das HUD oben links im Hero im Blick. Es zeigt euch live, ob `uColor` und `uTime` schon aktiv sind oder noch offen. Das ist euer Fortschrittsbalken.

---

## Der Plan in einem Bild

| Schritt | GAP | Datei | Was entsteht |
|---|---|---|---|
| 1 | GAP 1 | `app.js`, Fragment-Shader | Die zwei neuen uniforms `uColor` und `uTime` deklarieren |
| 2 | GAP 4 | `app.js`, uniforms-Objekt | Den Kanal oeffnen: `uColor` und `uTime` im JS eintragen |
| 3 | GAP 2 | `app.js`, Fragment-Shader | Die Produktfarbe in die Flaeche einrechnen |
| 4 | GAP 3 | `app.js`, Fragment-Shader | Die Zeit bewegt die Flaeche ruhig |
| 5 | GAP 5 | `app.js`, Input und Loop | Color-Input und Render-Loop mit dem Shader verbinden |

Reihenfolge zaehlt, und sie hat einen Grund. Wir deklarieren ein `uniform` erst (Schritt 1), oeffnen dann den Kanal im JavaScript (Schritt 2) und benutzen es erst danach im Bild (Schritt 3 und 4). So hat jeder Wert immer einen sauberen Startwert. Wer die Reihenfolge dreht und eine Farbe benutzt, die im JS noch nicht eingetragen ist, multipliziert mit Null und bekommt eine schwarze Flaeche. Kein Fehler, nur ein falsches Bild. Das ist der Vertrag von heute.

---

## Schritt 1 — Die neuen uniforms deklarieren (GAP 1)

**Ziel:** Der Fragment-Shader soll eine Produktfarbe und eine Zeit kennen.

**Warum:** Ein `uniform` ist der schmale Kanal von der CPU zur GPU. Bevor ihr ihn benutzt, muss der Shader wissen, dass es ihn gibt, mit exaktem Namen und Typ.

An der Stelle `GAP 1` im Fragment-Shader, unter den zwei vorhandenen Farb-uniforms:

```glsl
uniform vec3 uColor;
uniform float uTime;
```

---

## Schritt 2 — Den Kanal oeffnen (GAP 4)

**Ziel:** Das JavaScript kennt die zwei neuen uniforms und gibt ihnen einen sauberen Startwert.

**Warum:** Die GLSL-Seite und die JS-Seite sind die zwei Enden des Vertrags. Beide Namen muessen Zeichen fuer Zeichen zusammenpassen. Wir oeffnen den Kanal jetzt, bevor das Bild den Wert benutzt, damit nie mit einem unbelegten Wert gerechnet wird.

An der Stelle `GAP 4` im `uniforms`-Objekt:

```js
uColor: { value: new THREE.Color('#9ad7ff') },
uTime: { value: 0 },
```

Sobald das steht, springt das HUD im Hero auf `uColor aktiv` und `uTime` faengt an zu zaehlen.

---

## Schritt 3 — Die Produktfarbe einrechnen (GAP 2)

**Ziel:** Die Flaeche nimmt den Farbton an, den ihr gerade als Startwert gesetzt habt.

**Warum:** So traegt die Surface Produktzustand. Weiss bedeutet unveraendert, jede andere Farbe toent den Verlauf. Das ist die gleiche Idee wie eine Brand- oder Status-Farbe in einem echten Dashboard.

An der Stelle `GAP 2`, nach der `mix`-Zeile:

```glsl
color *= uColor;
```

---

## Schritt 4 — Die Flaeche bewegen (GAP 3)

**Ziel:** Der Verlauf atmet ruhig, statt still zu stehen.

**Warum:** Eine bewegte Flaeche ueber die GPU kostet die CPU fast nichts. Genau ein Wert pro Frame, die Zeit, und Millionen Pixel rechnen das neue Bild.

An der Stelle `GAP 3`, vor der `mix`-Zeile, verschiebt ihr die Misch-Achse leicht ueber die Zeit:

```glsl
float wave = sin(vUv.x * 8.0 + uTime * 1.2) * 0.05;
axis = clamp(axis + wave, 0.0, 1.0);
```

> Achtet auf die Dezimalpunkte. `8.0`, nicht `8`. GLSL rechnet sonst ganzzahlig und der Effekt kippt. Solange `uTime` im Loop noch nicht laeuft (Schritt 5), steht die Welle still. Das ist richtig so.

---

## Schritt 5 — Input und Loop verbinden (GAP 5)

**Ziel:** Der Color-Input oben im Hero steuert die Flaeche, und die Zeit laeuft pro Frame.

**Warum:** Das ist der Webapp-Skill in zwei Zeilen. Die UI bleibt klein, die CPU schickt zwei kleine Werte, die GPU traegt die ganze Flaeche.

Im Input-Handler (`GAP 5`, erste Stelle):

```js
material.uniforms.uColor.value.set(event.target.value)
```

Im Render-Loop (`GAP 5`, zweite Stelle):

```js
material.uniforms.uTime.value = elapsed
```

Schreibt immer in `.value`, nie in das uniform-Objekt selbst. Sonst reisst die Bindung still ab.

---

## Fertig? Der Check

- Die Hero-Surface bewegt sich ruhig.
- Der Color-Input oben aendert die Stimmung der ganzen Flaeche live.
- Das HUD zeigt `uColor aktiv` und eine laufende `uTime`.
- Kein Fehler in der Browser-Konsole (`F12`).

Wenn die Flaeche schwarz wird oder die Farbe nicht reagiert, geht den Vertrag durch, nicht raten:

1. Heisst das uniform im GLSL und im JS exakt gleich?
2. Hat jedes uniform die Form `{ value: ... }`?
3. Schreibt ihr in `.value` und nicht in das Objekt?
4. Tragen alle GLSL-Zahlen einen Dezimalpunkt?

---

## Zugabe fuer schnelle Teams

Die Karten im Dashboard und der Empty-State sind noch ruhig. Gebt der Empty-State-Flaeche dieselbe Behandlung: ein zweites kleines Canvas, dieselbe Shader-Logik, eine andere Grundfarbe, die zum Zustand „keine offenen Deployments" passt (ruhiger, kuehler). Mehr braucht es nicht, es ist genau der Schritt, den ihr fuer die Hausaufgabe sowieso geht.

---

*In-Class-Project | Dienstag 23.06.2026 | Lumen Release-Surface | Three.js Deep Dive | Morphos GmbH*
