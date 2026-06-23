# Lumen · Starter-App

Eine kleine, echte SaaS-Oberflaeche. Der Hero ist eine Three.js-Shader-Surface auf der GPU.
Kein Build, kein npm. Three.js r184 kommt ueber eine Importmap von unpkg, der Browser laedt es direkt.

## Starten

Du brauchst einen kleinen lokalen Server (eine Shader-Datei laedt nicht sauber per Doppelklick).
Im Ordner `04_STARTER_APP`:

```bash
# Variante A (Python)
python -m http.server 5173

# Variante B (Node)
npx serve .
```

Dann im Browser oeffnen:

```text
http://localhost:5173
```

Beim ersten Start brauchst du Internet, damit Three.js von unpkg geladen wird. Danach liegt es im Cache.

## Was schon laeuft

Die Hero-Surface zeigt sofort einen ruhigen vertikalen Verlauf. Das ist die Basis:
ein echtes `ShaderMaterial`, ein `vUv`-varying, ein `mix()` zwischen zwei Farben.

## Was du heute einbaust

Fuenf markierte Stellen (`GAP 1` bis `GAP 5`) im Code. Sie machen aus der ruhigen Flaeche
eine Live-Produkt-Surface:

- die Produktfarbe `uColor`, die du oben im Hero per Color-Input steuerst,
- die Zeit `uTime`, die die Surface ruhig in Bewegung bringt.

Die genauen Schritte stehen im Brief (`02_IN_CLASS_PROJECT/`), nicht im Code. Der Code bleibt sauber.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Die Lumen-Oberflaeche (Topbar, Hero mit Canvas, Dashboard, Empty-State) |
| `styles.css` | Das Design-System (Farben, Typo, Tiefe) |
| `app.js` | Die Szene, das `ShaderMaterial` und die fuenf GAP-Stellen |
