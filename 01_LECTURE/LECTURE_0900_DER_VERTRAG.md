> [!WARNING]
> Bitte gerendert lesen, nicht als Rohtext. In VSCode mit `Strg+Shift+V` (Windows) oder `Cmd+Shift+V` (Mac).

---

# Lecture — Dienstag 23.06.2026
## Der Vertrag: GLSL-Shader als Produkt-Schicht | 09:00 bis 12:30
### Three.js Deep Dive, Woche 3, Tag 2 | Morphos GmbH

Heute arbeitet ihr als Webapp-Entwickler. Ein Shader ist fuer uns kein dekoratives Nebenprojekt, sondern eine Rendering-Schicht in einer App, die echte Produktarbeit leistet: ein Hero, ein Auth-Hintergrund, ein Loading-Shimmer, ein Empty-State, eine CTA-Flaeche, ein Kartenlayer, ein Editorfilter.

Wenn eine Oberflaeche ruckelt, weil CSS, DOM und JavaScript zu viele Einzelteile bewegen, ist die richtige Frage nicht „mehr Animation". Die Frage ist: Welche Arbeit gehoert auf die CPU, welche Arbeit gehoert auf die GPU, und wie sieht der Vertrag zwischen beiden aus? Wer diese Frage beantworten kann, hebt sich von generischen Frontend-Entwicklern ab. Diese Nische, Three.js zusammen mit eigenen Shadern, ist duenn besetzt und gut bezahlt.

Wir bauen heute alles in einer vorbereiteten SaaS-App namens **Lumen**, einer Produkt-Analytics- und Deployment-Plattform. Die Shader-Flaeche sitzt im Hero, als Produkt-Surface. Sie ist nicht die App, sie dient der App.

**Roter Faden:** erst der Vertrag in einem Bild, dann die Flaeche von Hand mit `ShaderMaterial`, dann eine Live-Produktfarbe ueber ein `uniform`, dann der Moment, in dem wir den Vertrag absichtlich brechen und sehen, wie still er bricht. Danach nehmen wir `ShaderMaterial` einmal komplett weg und bauen dieselbe Flaeche nackt, damit ihr seht, was die Abstraktion die ganze Zeit fuer euch erledigt. Zum Schluss bewegt sich die Flaeche, mit einer einzigen Zahl pro Frame.

---

## 1. Wo Shader in echten Produkten leben

Bevor wir tippen, der berufliche Rahmen, weil er die ganze Stunde traegt.

Ein Shader ist ein Performance-Werkzeug. Das JavaScript schickt wenige Werte, die GPU berechnet daraus Millionen Pixel, parallel, sechzigmal pro Sekunde. Das ist der Hebel. Eine grosse animierte Flaeche ueber viele DOM-Knoten kostet Layout, Paint und Zeit auf dem Main-Thread. Dieselbe Flaeche in einem Fragment-Shader kostet die CPU fast nichts.

Wo das landet, ist kein Nischenwissen:

- **Gradient-Heroes** bei Stripe, Linear und Vercel, die nicht nur Stimmung tragen, sondern Status, Segment oder Theme.
- **Auth- und Hintergrund-Flaechen**, die ruhig leben, statt ein statisches Bild zu sein.
- **Loading-Shimmer und Skeletons**, eine Flaeche statt zwanzig pulsierende DOM-Knoten.
- **Page-Transitions**, weiche Uebergaenge ueber die GPU.
- **Kartenlayer** (Mapbox und aehnliche), die riesige Datenmengen als GPU-Schicht zeichnen.
- **Web-Editoren** mit Bild- und Videofiltern in Echtzeit.
- **Datenvisualisierung**, bei der CSS und DOM ab einer gewissen Punktzahl zu teuer werden.

Der gemeinsame Nenner ist immer derselbe: das JavaScript besitzt den Produktzustand, die GPU besitzt die Pixelarbeit, und dazwischen liegt ein schmaler Kanal aus `uniform`-Werten. Diesen Kanal schreibt ihr heute selbst.

---

## 2. Der Vertrag: CPU, Vertex-Shader, Fragment-Shader

Ein Shader-Setup in Three.js hat drei Seiten.

| Seite | Aufgabe |
|---|---|
| JavaScript (CPU) | erstellt Geometrie, Material, Uniforms, Renderer |
| Vertex-Shader | laeuft pro Vertex und setzt `gl_Position` |
| Fragment-Shader | laeuft pro Pixel und setzt `gl_FragColor` |

Daten fliessen ueber drei Kanaele, und das Wort Vertrag ist woertlich gemeint. Name, Typ und Richtung zaehlen.

| Kanal | Richtung | Beispiel |
|---|---|---|
| `attribute` | Geometrie zur GPU, pro Vertex | `position`, `uv`, `normal` |
| `uniform` | JavaScript zur GPU, pro Draw-Call | `uColor`, `uTime`, `projectionMatrix` |
| `varying` | Vertex-Shader zum Fragment-Shader, interpoliert | `vUv` |

Der `varying`-Kanal ist der wichtigste heute. Der Vertex-Shader legt an jedem Eckpunkt einen Wert hinein, die GPU verschmiert ihn weich ueber die Flaeche (sie interpoliert), und der Fragment-Shader liest ihn pro Pixel wieder heraus. So wird aus drei Eckwerten eine ganze Flaeche. Das ist die Antwort auf die Frage aus dem Warmup.

Das Entscheidende: die zwei Shader sind getrennte Programme. Sie reden ausschliesslich ueber diese deklarierten Draehte. Benennt ihr einen Draht im einen Programm anders als im anderen, passt er nicht, und es gibt keine sanfte Warnung. Genau wie eine Grenze zwischen zwei Diensten mit einem Datenvertrag.

---

## 3. Die erste Produkt-Surface mit `ShaderMaterial`

Wir bauen jetzt die Flaeche, die im Lumen-Hero liegt. Die Geometrie ist eine `PlaneGeometry`, sie bringt `uv`-Werte von `0.0` bis `1.0` ueber die Flaeche mit.

```js
const geometry = new THREE.PlaneGeometry(2, 2)
```

Der Vertex-Shader ist kurz, und der Grund dafuer ist der zentrale Fakt des Tages.

```glsl
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

Drei Dinge passieren hier. `uv` kommt als `attribute` aus der Geometrie. `vUv` ist das `varying`, das den Wert an den Fragment-Shader weitergibt. Und `projectionMatrix`, `modelViewMatrix` und `position` sind verfuegbar, obwohl ihr sie nirgends deklariert habt. Three.js schreibt sie vor euren Code. `ShaderMaterial` prependet die eingebauten Matrizen, die Geometrie-Attribute und die `precision`-Zeile. Ihr schreibt eine Zeile und benutzt sechs Dinge, die jemand anders hingestellt hat. Merkt euch das, in einer halben Stunde nehmen wir genau diesen Block weg.

Der Fragment-Shader liest `vUv` pro Pixel und baut daraus den Verlauf.

```glsl
precision mediump float;

uniform vec3 uColorBottom;
uniform vec3 uColorTop;
varying vec2 vUv;

void main() {
  vec3 color = mix(uColorBottom, uColorTop, vUv.y);
  gl_FragColor = vec4(color, 1.0);
}
```

`mix(a, b, t)` ist lineare Interpolation: bei `t = 0.0` kommt `a`, bei `t = 1.0` kommt `b`, dazwischen die Mischung. `vUv.y` laeuft von unten nach oben, also ein vertikaler Verlauf. Wichtig: alle Zahlen tragen einen Dezimalpunkt, `1.0`, nicht `1`. GLSL ist streng, eine `1` an einer Float-Stelle ist ein Typfehler.

```js
const uniforms = {
  uColorBottom: { value: new THREE.Color('#172033') },
  uColorTop: { value: new THREE.Color('#5ee0b5') },
}

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
})
```

Der Verlauf kommt nicht aus CSS und nicht aus einer Textur. Er kommt aus einer Funktion, die pro Pixel laeuft. Das ist die Basis-Surface, und genau so sieht euer Starter aus, wenn ihr ihn das erste Mal oeffnet.

---

## 4. `uColor`: das JavaScript steuert die GPU

Jetzt bekommt die Flaeche eine Live-Farbe, die aus der App kommt. In einem echten Produkt kann das eine Brand-Farbe sein, ein Team-Status, ein Kundensegment oder ein Theme-Wert. Technisch ist es ein weiteres `uniform`.

```js
const uniforms = {
  uColorBottom: { value: new THREE.Color('#172033') },
  uColorTop: { value: new THREE.Color('#5ee0b5') },
  uColor: { value: new THREE.Color('#ffffff') },
}
```

Im Fragment-Shader wird der Wert deklariert und in die Farbe eingerechnet. Weiss bedeutet unveraendert, jede andere Farbe toent die Flaeche.

```glsl
uniform vec3 uColor;

void main() {
  vec3 color = mix(uColorBottom, uColorTop, vUv.y);
  color *= uColor;
  gl_FragColor = vec4(color, 1.0);
}
```

Und hier ist der Kanal von der CPU zur GPU, den ihr selbst verlegt. Ein Color-Input im Hero schreibt nicht den Shader neu, er aendert nur den Uniform-Wert.

```js
colorInput.addEventListener('input', (event) => {
  material.uniforms.uColor.value.set(event.target.value)
})
```

Beachtet die Form. Ihr schreibt in `material.uniforms.uColor.value`, nie in `material.uniforms.uColor` direkt. Wuerdet ihr das Objekt ersetzen, reisst die Bindung still ab. Das ist der Webapp-Skill in einem Bild: die UI bleibt klein, die CPU schickt eine Farbe, die GPU faerbt die ganze Flaeche.

---

## 5. Hyrum's Law am schwarzen Schirm

Jetzt beweise ich euch die wichtigste Sache des Tages, und ich tue es, indem ich etwas kaputt mache.

Ich benenne das `uniform` auf einer Seite um. Im JavaScript bleibt es `uColor`, im GLSL schreibe ich `uColour`, ein Buchstabe Unterschied. Schaut auf den Bildschirm. Es gibt keine hilfreiche Fehlermeldung im DOM. Die App startet, der Shader kompiliert, und das Bild ist trotzdem falsch, weil das `uColor` aus dem JavaScript nirgendwo ankommt. Ihr debuggt dann nicht „die Farbe". Ihr debuggt den Vertrag.

Das hat einen Namen, und er kommt von einem Ingenieur bei Google, Hyrum Wright.

> **Hyrum's Law:** Bei genuegend Nutzern einer Schnittstelle ist es egal, was im Vertrag steht, jedes beobachtbare Verhalten wird sich auf irgendjemanden verlassen.
>
> — Hyrum Wright, hyrumslaw.com

Die Kehrseite, die ihr gerade gefuehlt habt: der Vertrag wird nicht freundlich erzwungen. Three.js verspricht euch nirgends, dass es prueft, ob eure Namen auf beiden Seiten zusammenpassen. Es haelt sich an das, was beobachtbar passiert, und wenn ihr euch vertippt, bekommt ihr kein hilfreiches „Name stimmt nicht", ihr bekommt ein falsches Bild und sucht.

Deshalb hat ein schwarzer oder falscher Shader eine feste Reihenfolge, in der ihr ihn prueft, nicht raten, sondern den Vertrag durchgehen:

1. Stimmen die `uniform`-Namen in JavaScript und GLSL Zeichen fuer Zeichen?
2. Hat jedes `uniform` die Form `{ value: ... }`?
3. Wird `.value` aktualisiert, statt das Uniform-Objekt zu ersetzen?
4. Stimmen `varying`-Name und -Typ in beiden Shadern?
5. Schreibt der Vertex-Shader das `varying`, bevor der Fragment-Shader es liest?

Wer diese eine Sache verinnerlicht, dass der Vertrag unerzwungen ist und still bricht, debuggt einen falschen Shader in dreissig Sekunden statt in einer Stunde. Genau das ist der Unterschied zwischen einem Tagessatz oben und unten.

---

## 6. `RawShaderMaterial`: dieselbe Flaeche ohne Schutzschicht

Jetzt machen wir ein Experiment, das ihr nur einmal im Leben machen muesst, aber dieses eine Mal veraendert es, wie ihr Shader seht.

Ich nehme genau den Code von gerade, die funktionierende Flaeche, und aendere ein einziges Wort. `ShaderMaterial` wird zu `RawShaderMaterial`. Sonst nichts. Das Bild wird schwarz, und die Konsole fuellt sich mit Fehlern: `position` ist nicht deklariert, `projectionMatrix` ist nicht deklariert, keine Praezision angegeben. Derselbe Code, der vor einer Minute lief, ist jetzt kaputt. Der Grund: `RawShaderMaterial` prependet nichts. Den unsichtbaren Block, den `ShaderMaterial` vor euren Code geschrieben hat, habe ich gerade weggenommen. Jetzt seht ihr, was er enthielt.

Wir bauen ihn von Hand wieder auf. In GLSL ES 1.0 deklariere ich selbst, was vorher da war.

```glsl
precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

Der Fragment-Shader braucht ebenfalls seine eigene `precision`-Zeile, der Rest bleibt gleich.

```glsl
precision mediump float;

uniform vec3 uColorBottom;
uniform vec3 uColorTop;
uniform vec3 uColor;
varying vec2 vUv;

void main() {
  vec3 color = mix(uColorBottom, uColorTop, vUv.y);
  color *= uColor;
  gl_FragColor = vec4(color, 1.0);
}
```

```js
const rawMaterial = new THREE.RawShaderMaterial({
  vertexShader: rawVertexShader,
  fragmentShader: rawFragmentShader,
  uniforms,
})
```

Speichern, und das Bild ist zurueck. Derselbe Verlauf, dieselbe Flaeche, exakt dasselbe Ergebnis. Aber schaut auf die Zeilenzahl. Das ist deutlich mehr Code fuer das identische Bild.

Das ist die Lektion, die weit ueber Shader hinausgeht.

> **Tesler's Law (Gesetz der undichten Abstraktionen):** Jede Anwendung hat ein Mass an Komplexitaet, das nicht verschwindet. Die Frage ist nur, wer es traegt.

Die Komplexitaet ist nicht verschwunden, als wir `ShaderMaterial` benutzt haben. Sie war nur woanders, in Three.js versteckt. In dem Moment, wo ihr die Abstraktion wegnehmt, taucht sie wieder auf, als Code, den ihr selbst schreibt. Eine gute Abstraktion laesst die Arbeit nicht verschwinden, sie verlegt sie nur dorthin, wo ihr sie nicht sehen muesst. Genau deshalb arbeiten wir den Rest der Woche mit `ShaderMaterial`. Ihr habt jetzt einmal gesehen, was darunter liegt. Das reicht. Ab morgen lasst ihr Three.js diesen Block wieder schreiben, aber ihr wisst, was drinsteht.

Wer es spaeter ganz modern mag: mit der Material-Eigenschaft `glslVersion: THREE.GLSL3` wechselt die Sprache auf GLSL ES 3.0, dann heisst `attribute` zu `in`, `varying` zu `out` (im Vertex) und `in` (im Fragment), und statt `gl_FragColor` deklariert ihr einen eigenen `out vec4`. Das ist Zugabe, die ES-1.0-Variante traegt die Lektion allein.

---

## 7. `uTime`: eine Zahl bewegt die Surface

Jetzt bekommt die Flaeche Bewegung, und das ist die Bruecke zu morgen.

Bisher war der Verlauf statisch. Ich fuege ein `uniform float uTime` hinzu und zaehle es im Render-Loop einmal pro Frame hoch.

```js
const clock = new THREE.Clock()

renderer.setAnimationLoop(() => {
  material.uniforms.uTime.value = clock.getElapsedTime()
  renderer.render(scene, camera)
})
```

Im Fragment-Shader laesst die Zeit die Misch-Achse leicht wandern.

```glsl
uniform float uTime;

void main() {
  float wave = sin(vUv.x * 8.0 + uTime * 1.2) * 0.05;
  float axis = clamp(vUv.y + wave, 0.0, 1.0);
  vec3 color = mix(uColorBottom, uColorTop, axis);
  color *= uColor;
  gl_FragColor = vec4(color, 1.0);
}
```

Schaut auf den Bildschirm. Die Flaeche atmet. Und hier ist der Teil, der das ganze Thema traegt: kein einziger Punkt bewegt sich auf eurem Prozessor. Euer JavaScript setzt genau eine Zahl pro Frame, die Zeit. Das ist alles. Die GPU nimmt diese eine Zahl, und Millionen Pixel rechnen gleichzeitig das neue Bild. Die App sieht lebendig aus, aber der DOM bleibt ruhig. Das ist der Grund, warum Shader in Produktteams nicht nur visuell interessant sind, sie sind eine Architekturentscheidung.

---

## 8. Derselbe Vertrag, ueberall

Eine Gradient-Hero-Flaeche bei einem SaaS-Produkt ist nicht nur Stimmung. Sie kann Kundensegment, Status, Theme oder Tageszeit darstellen. Ein Loading-Shimmer kann ueber einen Shader laufen, statt zwanzig DOM-Knoten zu bewegen. Eine Karte kann grosse Datenmengen als GPU-Layer zeichnen. Ein Editor kann Bildfilter in Echtzeit anwenden. Ein Dashboard kann viele Punkte aggregiert sichtbar machen.

Der gemeinsame Nenner ist der Vertrag von heute: das JavaScript besitzt den Produktzustand, die GPU besitzt die Pixelarbeit, die Uniforms sind der schmale Kanal dazwischen. Ihr habt heute beide Seiten dieses Vertrags mit den Haenden gebaut, die unerzwungene Garantie (Hyrum) und die verschobene Komplexitaet (Tesler).

> „A fragment shader [...] runs in parallel for every pixel."
>
> — Patricio González Vivo und Jen Lowe, *The Book of Shaders*, Kapitel „What is a shader?"

Das ist der ehrlichste Satz zu dem Thema. Ein Shader ist eine Funktion, die fuer jedes Pixel laeuft, gleichzeitig. Wer das verinnerlicht hat, denkt bei jeder Animation zuerst: was ist der eine Wert, der sich aendert, und kann die GPU den Rest tragen?

---

## 9. Was ihr gleich in die Hand nehmt

Im In-Class-Project baut ihr genau diese Surface in den Lumen-Hero und in den Empty-State: `uColor` fuer den Produktzustand, `uTime` fuer die Bewegung. Sie bleibt in der App, neben echten UI-Elementen. Danach erweitert ihr als Hausaufgabe eure eigene Produkt-Surface und deployed sie live.

Das Ergebnis ist kein Shader-Bild. Es ist eine Webapp-Oberflaeche mit einer GPU-Schicht, die ihr begruenden, debuggen und deployen koennt. Genau das unterscheidet die wenigen, die diese Nische bedienen, von den vielen, die Code kopieren und hoffen.

---

*Lecture | Dienstag 23.06.2026 | Woche 3, GLSL-Shader, Der Vertrag | Three.js Deep Dive | Morphos GmbH*
