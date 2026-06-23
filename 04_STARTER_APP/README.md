# Lumen Auth-Surface

Eine kleine zero-build Webapp fuer eine glaubwuerdige Produkt-Situation: Lumen Analytics zeigt einen Login-Screen. Die grosse Auth-Hintergrundflaeche ist eine Three.js-Shader-Surface, die ueber `uColor` und `uTime` aus JavaScript gesteuert wird.

## App-Situation

Ich habe die Surface als Auth-Hintergrund in einer Analytics-App gebaut. Die Flaeche liegt hinter einem Login-Formular und bleibt ruhig, tief und einladend. Sie ist kein einzelnes Shader-Bild, sondern dient dem App-Screen: Produkttext, Formular, Button und Color-Input liegen direkt im Kontext der Surface.

## Was die Surface macht

Der Vertex-Shader reicht `vUv` als `varying` an den Fragment-Shader weiter. Der Fragment-Shader nutzt `mix(uColorBottom, uColorTop, axis)` fuer den Verlauf, verschiebt die Achse mit `uTime` und multipliziert das Ergebnis mit der live steuerbaren Produktfarbe `uColor`.

Die CPU setzt nur Werte: die Farbe bei Aenderung des Inputs und einmal pro Frame die Zeit. Die Pixelarbeit passiert im Fragment-Shader auf der GPU.

## Engineer-Note

### 1. Was injiziert `ShaderMaterial`?

`ShaderMaterial` gibt mir in Three.js schon typische Shader-Bausteine mit, zum Beispiel `projectionMatrix`, `modelViewMatrix`, `position` und `uv`. Ich kann diese Namen im Shader benutzen, ohne sie selbst als Attribute oder Uniforms zu deklarieren. Dadurch bleibt der eigene Shader kuerzer und ich kann mich auf die Surface-Logik konzentrieren.

### 2. Was laesst `RawShaderMaterial` offen?

Bei `RawShaderMaterial` muesste ich diese Grundlagen selbst schreiben. Dazu gehoeren unter anderem `precision`, Attribute wie `position` und `uv` sowie die Matrix-Uniforms, die aus dem 3D-Modell eine Position auf dem Bildschirm machen. Die Bibliothek nimmt mir dann weniger ab, also wandert mehr Verantwortung in meinen Shader-Code.

### 3. Worueber reden Vertex- und Fragment-Shader miteinander?

Vertex- und Fragment-Shader reden ueber `varying`-Werte miteinander. In dieser App setzt der Vertex-Shader `vUv`, die GPU interpoliert diesen Wert ueber die Flaeche, und der Fragment-Shader liest ihn pro Pixel. Wenn ein Name nicht exakt zusammenpasst, kommt der Wert nicht richtig an: der Shader kompiliert entweder nicht oder das Bild sieht falsch aus.

## Starten

Im Ordner `04_STARTER_APP` einen lokalen Server starten:

```bash
python -m http.server 5173
```

Dann im Browser oeffnen:

```text
http://localhost:5173
```

Beim ersten Start braucht die Seite Internet, weil Three.js ueber unpkg geladen wird.
