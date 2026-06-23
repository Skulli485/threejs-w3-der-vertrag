> [!WARNING]
> Bitte gerendert lesen, nicht als Rohtext. In VSCode mit `Strg+Shift+V` (Windows) oder `Cmd+Shift+V` (Mac).

---

# Warmup — Dienstag 23.06.2026
## Der Vertrag: attribute, uniform, varying | Selbststudium vor der Lecture | 08:30 bis 09:00 | 30 Minuten

| | |
|---|---|
| **Dauer** | 30 Minuten |
| **Format** | Kurz lesen, dann zwei Visualizer nebeneinander laufen lassen |
| **Rolle heute** | Webapp-Entwickler. Ein Shader ist heute kein Kunstprojekt, sondern eine Rendering-Schicht in einer echten App |
| **Ziel** | Die drei Datenkanaele eines Shaders als Vertrag lesen und verstehen, warum aus drei Eckwerten eine ganze Flaeche wird |
| **Ergebnis** | Um 09:00 koennt ihr den Vertrag zwischen CPU und GPU in eigenen Worten erklaeren und habt zwei Antworten notiert, die ihr in der Stunde vorlest |
| **Dateien** | Dieses Dokument, daneben `VISUALIZER_A_glsl-playground.html` und `VISUALIZER_B_produkt-surface.html` |

> Lest den Text bis zum Ende. Oeffnet danach beide Visualizer und stellt sie nebeneinander. Was heute in der Lecture mit der nackten Variante (`RawShaderMaterial`) passiert, bleibt eine Ueberraschung. Der Warmup fasst nur das Komfort-Material `ShaderMaterial` an und den Vertrag der drei Kanaele.

---

## Warum dieser Warmup

Am Montag hattet ihr einen vollen Selbstlerntag mit Shadern. Ihr habt im Browser-Editor GLSL getippt, die Regel mit dem Dezimalpunkt kennengelernt (`1.0`, nicht `1`), mit `mix`, `step` und `smoothstep` gespielt und am Ende einen Shader zum ersten Mal an Three.js angedockt. Eine Gradient-Plane, sie lief, fertig.

Das war das Andocken. Heute kommt das Verstehen, und zwar in einem Rahmen, der euch beruflich etwas bringt. Wir behandeln den Shader nicht als Spielwiese, sondern als das, was er in echten Produkten ist: eine Schicht, die Arbeit von der CPU auf die GPU verlagert. Ein Gradient-Hero wie bei Stripe, Linear oder Vercel, ein Auth-Hintergrund, ein Loading-Shimmer, ein Empty-State, der ruhig atmet statt leer zu wirken. Genau dort lebt diese Technik.

Bevor ihr in der Lecture den Vertrag in beide Richtungen seht, sollt ihr eine Sache wirklich verinnerlichen: Ein `varying`, das ihr im Vertex-Shader an den drei Ecken eines Dreiecks setzt, kommt im Fragment-Shader an jedem Pixel dazwischen interpoliert an. Das ist kein Zufall und kein Fehler, das ist der Vertrag.

---

## Teil 1 — Die zwei Programme (8 Minuten lesen)

Ein Shader an einem `ShaderMaterial` sind immer **zwei** Programme, die nacheinander auf der GPU laufen.

Der **Vertex-Shader** laeuft einmal pro Eckpunkt. Eine Plane mit vier Ecken ruft ihn viermal auf. Seine einzige Aufgabe: die endgueltige Position des Eckpunkts auf dem Bildschirm berechnen und in `gl_Position` schreiben. Hier wird Geometrie bewegt.

Der **Fragment-Shader** laeuft einmal pro Pixel. Bei einer bildschirmfuellenden Flaeche sind das Hunderttausende Aufrufe pro Bild. Seine einzige Aufgabe: die Farbe dieses Pixels berechnen und in `gl_FragColor` schreiben. Hier wird gefaerbt.

Der Merksatz, der bleiben soll: **Vertex ist Position, Fragment ist Farbe.**

Dazwischen liegt eine Stufe, die ihr nicht programmiert, die aber alles erklaert: der **Rasterizer**. Er nimmt die drei Eckpunkte eines Dreiecks und fuellt die Flaeche dazwischen mit Pixeln auf. Genau diese Stufe interpoliert spaeter. Merkt euch, dass sie existiert.

### Die drei Kanaele: der Vertrag

Die zwei Programme teilen keinen Speicher. Daten fliessen nur ueber drei deklarierte Kanaele. Das ist eine echte Schnittstelle mit Regeln, kein loser Zugriff auf gemeinsame Variablen.

| Kanal | Richtung | Pro was | Beispiel | Wer setzt ihn |
|---|---|---|---|---|
| **`attribute`** | CPU zum Vertex-Shader | pro **Vertex** | `position`, `normal`, `uv` | die Geometrie (Buffer) |
| **`uniform`** | CPU zu beiden Shadern | pro **Draw-Call**, konstant | `uTime`, `uColor`, `projectionMatrix` | euer JavaScript, einmal pro Bild |
| **`varying`** | Vertex-Shader zum Fragment-Shader | pro **Vertex**, dann interpoliert | `vUv`, `vNormal` | ihr selbst, im Vertex-Shader |

Lest die Tabelle als drei Geschwindigkeiten. Ein `attribute` ist der feinste Kanal: jeder Eckpunkt bringt seinen eigenen Wert mit. Ein `uniform` ist der groebste: ein einziger Wert gilt fuer den ganzen Zeichenvorgang, jeder Vertex und jedes Pixel sieht dieselbe Zahl. Ein `varying` ist die Bruecke zwischen den zwei Programmen: ihr schreibt ihn im Vertex-Shader, er taucht im Fragment-Shader interpoliert wieder auf.

### Die eine Sache: Interpolation

Hier ist der Kern. Ihr setzt `vUv` im Vertex-Shader nur an den Eckpunkten. Eine Plane hat vier Ecken, also setzt ihr genau vier Werte. Trotzdem hat im Fragment-Shader jedes Pixel der Flaeche seinen eigenen `vUv`-Wert, und in der Mitte steht sauber `(0.5, 0.5)`.

Diesen Wert dazwischen hat niemand von Hand gesetzt. Der Rasterizer hat ihn berechnet, indem er zwischen den Eckwerten linear gemischt hat. Genau das macht aus drei gesetzten Werten einen weichen Verlauf ueber die ganze Flaeche.

> **Der Satz, der heute haengen bleiben soll:** Ein `varying`, das im Vertex-Shader an den Ecken gesetzt wird, kommt im Fragment-Shader an jedem Pixel dazwischen interpoliert an. Das ist nicht kaputt, das ist der Vertrag.

### Wer hat `projectionMatrix` und `uv` deklariert?

Schaut auf diesen Vertex-Shader:

```glsl
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

Ihr benutzt `uv`, `position`, `projectionMatrix` und `modelViewMatrix`, ohne sie irgendwo zu deklarieren. Woher kommen die? Das `ShaderMaterial` legt sie euch hin, bevor euer Code anfaengt. Es schreibt vor eure Zeilen automatisch die eingebauten `uniform`s (`projectionMatrix`, `modelViewMatrix`, `modelMatrix`, `viewMatrix`, `normalMatrix`, `cameraPosition`), die eingebauten `attribute`s (`position`, `normal`, `uv`) und die `precision`-Zeile. Deshalb ist euer erster Vertex-Shader so kurz.

Genau hier sitzt die heutige Ueberraschung, die der Warmup nicht anfasst: es gibt eine zweite Material-Sorte, die euch nichts hinlegt, bei der ihr jede dieser Zeilen selbst schreibt. Was das ist und warum man es trotzdem will, baut ihr in der Lecture.

### Der Engineering-Punkt: eine Schnittstelle, kein gemeinsamer Speicher

Die drei Kanaele sind nicht einfach „wie man Daten in einen Shader bekommt". Sie sind eine Schnittstelle mit einem Datenvertrag, exakt wie die Grenze zwischen zwei Diensten in einem groesseren System. Vertex- und Fragment-Shader reden ausschliesslich ueber deklarierte `varying`s. Stimmen Name und Typ auf beiden Seiten nicht ueberein, verbindet der Compiler sie nicht.

Und hier kommt das Gesetz der Woche ins Spiel. Dieser Vertrag ist nicht erzwungen. Ihr koennt im JavaScript ein `uniform` `uColor` nennen und im GLSL `uColour` schreiben (ein Buchstabe Unterschied), und nichts haelt euch auf. Kein Fehler. Der Shader kompiliert, laeuft, und das `uColor` aus dem JavaScript landet nirgendwo, weil im GLSL kein passender Name darauf wartet. Ihr habt einen Vertrag gebrochen, den niemand kontrolliert.

| **Regel** | **Hyrum's Law:** Bei genuegend Nutzern einer Schnittstelle ist es egal, was im Vertrag steht, jedes beobachtbare Verhalten wird sich auf irgendjemanden verlassen. Auf den GPU-Vertrag gemuenzt: Der Kontrakt ueber Namen und Typen wird von nichts erzwungen, also faellt jeder Tippfehler nicht als Fehler heraus, sondern als stilles Fehlverhalten. |
|---|---|
| **Quelle** | Hyrum Wright, hyrumslaw.com |
| **Fuer euch** | `uniform`-Name im JS und im GLSL muessen Zeichen fuer Zeichen gleich sein. `varying`-Name und -Typ muessen in beiden Shadern identisch sein. Bricht einer davon, sucht ihr nicht nach einem Fehler in der Konsole, ihr seht nur ein falsches Bild. Wer das weiss, debuggt Shader in Minuten statt in Stunden. |

---

## Teil 2 — Zwei Visualizer nebeneinander (12 Minuten)

Oeffnet jetzt beide Dateien aus diesem Ordner und stellt die Browserfenster **nebeneinander**:

- **links** `VISUALIZER_A_glsl-playground.html`: derselbe Shader als reines Kunst-Canvas, mit einem Seitenpanel, das die `uniform`s und die von Three.js eingespeisten eingebauten Variablen zeigt.
- **rechts** `VISUALIZER_B_produkt-surface.html`: dasselbe Prinzip, ein Verlauf aus `mix()` ueber `vUv`, aber als Produkt-Surface in der Lumen-App. Derselbe Vertrag, anderer Rahmen.

Beide laufen ohne Build. Doppelklick oder ueber einen kleinen lokalen Server. Beim ersten Start braucht ihr Internet, danach liegt Three.js im Cache.

Macht der Reihe nach genau das, und schaut jedes Mal hin:

1. Stellt im Playground (A) zwei deutlich verschiedene Farben fuer unten und oben ein. Beobachtet, dass die Mitte der Flaeche sauber die Mischfarbe zeigt, obwohl ihr nur zwei Endfarben gewaehlt habt. Das ist `mix(unten, oben, vUv.y)` plus die Interpolation aus Teil 1 in einem Bild.
2. Sucht im Code-Spiegel die Zeile `vUv = uv;`. Stellt euch vor, sie fehlt. Ohne sie bleibt der Kanal leer und der Verlauf kollabiert.
3. Schaut auf das Seitenpanel mit den eingebauten Variablen. Das ist die Liste dessen, was `ShaderMaterial` euch hinlegt. Merkt euch: genau diese Liste liefert die nackte Variante in der Lecture nicht.
4. Wechselt jetzt zu B, der Produkt-Surface. Zieht dort den `uColor`-Regler und den `uTime`-Regler. Es ist dieselbe Art von Fragment-Funktion wie links, ein Verlauf aus `mix()` ueber `vUv`, nur sitzt sie hier hinter echtem Produkt-Text. Das ist der ganze Punkt des Tages: ein Shader ist kein Sonderfall, er ist eine Schicht in eurer App.

Wenn ihr nach diesen Schritten sagen koennt, **warum** die Mitte der Flaeche eine Mischfarbe zeigt, obwohl nur zwei Endfarben gesetzt sind, hat der Warmup seinen Zweck erfuellt.

---

## Teil 3 — Zwei Fragen (4 Minuten schreiben)

Schreibt eure Antworten auf, je ein Satz. Ihr lest sie in der Stunde vor.

**Frage 1.** Ihr habt zwei Farben gesetzt und einen weichen Verlauf ueber die ganze Flaeche bekommen. Wer hat die Farben dazwischen berechnet, und warum passiert das, ohne dass ihr „Verlauf" programmiert habt?

**Frage 2.** Der Vertrag zwischen JavaScript und GLSL ist nicht erzwungen. Was bedeutet das konkret fuer euer Vorgehen, wenn eine Shader-Flaeche falsch aussieht, aber die Konsole keinen Fehler zeigt?

---

## Selbstcheck vor der Lecture

- [ ] Ich kann `attribute`, `uniform` und `varying` mit Richtung und „pro was" in je einem Satz erklaeren
- [ ] Ich verstehe, dass ein `varying` im Vertex-Shader geschrieben und im Fragment-Shader interpoliert gelesen wird
- [ ] Ich kann erklaeren, warum die Mitte einer Gradient-Flaeche eine Mischfarbe zeigt, obwohl nur Eckwerte gesetzt sind
- [ ] Ich weiss, dass `ShaderMaterial` mir `position`, `normal`, `uv` und die Matrizen automatisch hinlegt
- [ ] Ich habe beide Visualizer nebeneinander laufen lassen und den Unterschied zwischen Kunst-Canvas und Produkt-Surface gesehen
- [ ] Ich kenne den Begriff **Hyrum's Law** und kann ihn am Vertrag zwischen CPU und GPU erklaeren

**6 Haekchen:** bereit fuer die Lecture. **4 bis 5:** lasst die offenen Punkte in der Stunde klaeren. **Unter 4:** schreibt kurz im Chat, wir gehen die Stelle gemeinsam durch.

---

> „A fragment shader [...] runs in parallel for every pixel."
>
> — Patricio González Vivo und Jen Lowe, *The Book of Shaders*, Kapitel „What is a shader?"

---

*Warmup Selbststudium | Dienstag 23.06.2026 | Three.js Deep Dive, Woche 3, Tag 2 | Morphos GmbH*
