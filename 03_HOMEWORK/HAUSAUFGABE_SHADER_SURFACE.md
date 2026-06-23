> [!WARNING]
> Bitte gerendert lesen, nicht als Rohtext. In VSCode mit `Strg+Shift+V` (Windows) oder `Cmd+Shift+V` (Mac).

---

# Hausaufgabe — Deine eigene Produkt-Surface
## Three.js Deep Dive, Woche 3, Tag 2 | nach dem Kurs

Heute habt ihr eine Shader-Surface in den Lumen-Hero gebaut, gesteuert ueber `uColor` und `uTime`. Jetzt baut ihr **eure eigene** Surface, fuer eine echte App-Situation eurer Wahl, und deployed sie live ins Netz. Am Ende habt ihr eine URL, die ihr verschicken koennt, und eine kurze Engineer-Note, die zeigt, dass ihr den Vertrag verstanden habt.

Das Ergebnis ist kein Shader-Bild auf einem leeren Canvas. Es ist eine Oberflaeche in einem glaubwuerdigen App-Kontext, mit etwas Produkt-Text drumherum, damit klar ist: der Shader dient der App.

---

## Schritt 0 — Startpunkt

Nehmt euren fertigen Stand aus dem Kurs (`04_STARTER_APP`) als Vorlage oder baut eine kleine eigene Seite im selben Stil. Zero-Build bleibt zero-build: eine `index.html`, Three.js per Importmap von unpkg, `three@0.184.0`. Kein Vite, kein npm noetig.

---

## Schritt 1 — Waehle eine App-Situation

Genau eine. Sie entscheidet ueber Stimmung, Farbe und Bewegung deiner Surface.

| Situation | Was die Surface traegt | Stimmung |
|---|---|---|
| **Auth-Hintergrund** | Ein Login- oder Signup-Screen, die Surface liegt hinter dem Formular | ruhig, tief, einladend |
| **Loading-Shimmer** | Ein Skeleton-Zustand, der laedt, statt zwanzig DOM-Knoten zu pulsen | sanfte, langsame Bewegung |
| **Empty-State** | „Noch keine Daten", eine Flaeche, die lebt statt leer zu wirken | kuehl, geduldig |
| **CTA-Flaeche** | Ein Call-to-Action-Block, der auf Hover oder Klick reagiert | warm, einladend, ein Impuls |
| **Onboarding-Hero** | Ein Willkommens-Screen mit einem grossen Titel | hell, freundlich, offen |

Es gibt keine bessere oder schlechtere Wahl. Nehmt die, die euch reizt.

---

## Schritt 2 — Bau die Surface

Worauf es ankommt:

- Die Surface lebt **in** einem App-Kontext. Es gibt Produkt-Text, einen Titel oder ein Formular davor oder daneben, nicht nur ein nacktes Canvas.
- Ein `varying` reicht `vUv` durch, der Fragment-Shader baut daraus einen Verlauf mit `mix`.
- Mindestens ein eigenes Farb-`uniform` (`uColor` oder ein sinnvollerer Name fuer eure Situation), das ihr aus dem JavaScript steuert.
- `uTime` bewegt die Flaeche ruhig. Eine Zahl pro Frame, der Rest passiert auf der GPU.
- Resize-korrekt: die Surface fuellt ihre Flaeche auch nach Groessenaenderung sauber.
- Sauberer Code: die uniform-Namen stimmen auf beiden Seiten Zeichen fuer Zeichen.

Mehr Geometrie als eine Plane braucht ihr nicht. Die ganze Wirkung steckt im Fragment-Shader.

---

## Schritt 3 — Die Engineer-Note

Legt eine `README.md` ins Repo und beantwortet darin drei Fragen in je zwei, drei Saetzen:

1. Was injiziert `ShaderMaterial` fuer euch, das ihr nirgends deklariert habt?
2. Was laesst `RawShaderMaterial` offen, also was muesstet ihr selbst schreiben?
3. Worueber reden Vertex- und Fragment-Shader miteinander, und was passiert, wenn ein Name nicht zusammenpasst?

Das ist der Teil, der euch von jemandem unterscheidet, der Code kopiert. Schreibt es in euren eigenen Worten.

---

## Schritt 4 — Deploy live

Bringt die Seite ins Netz, damit sie unter einer echten URL laeuft:

- **GitHub Pages**: Repo anlegen, Datei pushen, Pages aktivieren.
- oder **Vercel** / **Netlify**: Ordner verbinden oder per Drag-and-Drop hochladen.

Testet die Live-URL einmal in einem frischen Browserfenster. Three.js laedt von unpkg, das braucht beim ersten Aufruf Netz.

---

## Bonus (frei, wenn ihr Lust habt)

Baut dieselbe Surface zusaetzlich einmal als `RawShaderMaterial`, mit allen selbst deklarierten Zeilen (`precision`, die Matrizen, die Attribute). Notiert in der README einen Satz, wie viele Zeilen Code euch das gegenueber `ShaderMaterial` zusaetzlich gekostet hat. Das ist Tesler's Law in einer Zahl.

---

## Selbstcheck vor der Abgabe

- [ ] Die Surface liegt in einem glaubwuerdigen App-Kontext, nicht auf einem leeren Canvas
- [ ] Ein `varying` reicht `vUv` durch, der Verlauf entsteht mit `mix`
- [ ] Ein eigenes Farb-`uniform` wird aus dem JavaScript gesteuert
- [ ] `uTime` bewegt die Flaeche, die CPU setzt nur eine Zahl pro Frame
- [ ] Die Seite ist resize-korrekt und hat keine Fehler in der Konsole
- [ ] Die `README.md` beantwortet die drei Fragen der Engineer-Note
- [ ] Die Live-URL laeuft in einem frischen Browserfenster

---

## Abgabe

Schickt drei Dinge:

1. die **Live-URL**,
2. den **Repo-Link**,
3. eure **Engineer-Note** (steckt in der README, ein kurzer Hinweis im Chat reicht).

---

*Hausaufgabe | Dienstag 23.06.2026 | Deine eigene Produkt-Surface | Three.js Deep Dive | Morphos GmbH*
