# Sticker Konfigurator für Shopify

Ein Vue.js basierter visueller Konfigurator für Shopify, mit dem Kunden Sticker auf Basis-Produkten (T-Shirts, Longsleeves, etc.) platzieren können.

## Features

- ✅ Drag & Drop Sticker-Platzierung
- ✅ Sticker skalieren, rotieren und verschieben
- ✅ Visuelles Echtzeit-Feedback
- ✅ Automatische Preisberechnung
- ✅ Direkte Shopify Cart Integration
- ✅ Responsive Design
- ✅ Modal-basierte Benutzeroberfläche

## Installation & Entwicklung

### 1. Projekt Setup

```bash
cd sticker-configurator
npm install
```

### 2. Entwicklungsserver starten

```bash
npm run dev
```

Der Konfigurator läuft dann auf `http://localhost:5173`

### 3. Production Build erstellen

```bash
npm run build
```

Die kompilierten Dateien befinden sich dann im `dist/` Ordner:
- `sticker-configurator.iife.js` - Haupt-JavaScript Bundle
- `assets/` - CSS und andere Assets

## Integration in Shopify Theme

### Schritt 1: Dateien hochladen

1. **Shopify Admin öffnen**: Gehe zu `Online Store > Themes > Actions > Edit code`

2. **JavaScript hochladen**:
   - Erstelle einen neuen Asset: `Assets > Add a new asset`
   - Lade `dist/sticker-configurator.iife.js` hoch
   - Benenne es um zu `sticker-configurator.js`

3. **CSS hochladen**:
   - Lade alle Dateien aus `dist/assets/` hoch
   - Oder integriere das CSS direkt in dein Theme

### Schritt 2: Snippet erstellen

Erstelle ein neues Snippet: `snippets/sticker-configurator.liquid`

```liquid
{% comment %}
  Sticker Konfigurator Snippet
  
  Parameter:
  - product: Das aktuelle Produkt-Objekt
  - current_variant: Die aktuelle Variante
{% endcomment %}

<!-- Mount Point für Vue.js -->
<div id="sticker-configurator-mount"></div>

<!-- Konfigurator öffnen Button -->
<button 
  id="open-sticker-configurator" 
  class="btn btn-primary"
  style="margin: 20px 0;"
>
  Mit Stickern personalisieren
</button>

<script>
(function() {
  // Sticker-Produkte aus Shopify laden
  async function loadStickers() {
    try {
      // Alle Produkte mit Tag "Sticker" abrufen
      const response = await fetch('/collections/all/products.json?limit=250');
      const data = await response.json();
      
      // Nur Sticker-Produkte filtern
      const stickers = data.products
        .filter(product => {
          return product.tags.includes('Sticker') || 
                 product.tags.includes('sticker') ||
                 product.product_type === 'Sticker';
        })
        .map(product => {
          const variant = product.variants[0];
          return {
            id: product.id.toString(),
            variantId: variant.id.toString(),
            title: product.title,
            image: product.images[0]?.src || '',
            price: parseFloat(variant.price),
            // Versuche Maße aus Metafields zu laden, sonst Standardwerte
            width: product.metafields?.custom?.width || 80,
            height: product.metafields?.custom?.height || 80
          };
        });
      
      return stickers;
    } catch (error) {
      console.error('Fehler beim Laden der Sticker:', error);
      return [];
    }
  }

  // Konfigurator initialisieren
  document.getElementById('open-sticker-configurator').addEventListener('click', async function() {
    // Sticker laden
    const stickers = await loadStickers();
    
    // Konfigurator öffnen
    if (window.initStickerConfigurator) {
      window.initStickerConfigurator({
        productId: '{{ product.id }}',
        productTitle: '{{ product.title | escape }}',
        productImage: '{{ product.featured_image | img_url: '800x' }}',
        variantId: '{{ current_variant.id }}',
        canvasWidth: 400,
        canvasHeight: 500,
        stickers: stickers
      });
    } else {
      alert('Konfigurator konnte nicht geladen werden. Bitte lade die Seite neu.');
    }
  });
})();
</script>
```

### Schritt 3: Theme Layout anpassen

Füge in `layout/theme.liquid` (vor dem schließenden `</body>` Tag) ein:

```liquid
<!-- Sticker Konfigurator -->
{{ 'sticker-configurator.js' | asset_url | script_tag }}
```

### Schritt 4: Product Template anpassen

Öffne dein Product Template (z.B. `sections/product-template.liquid` oder `templates/product.liquid`)

Füge das Snippet an der gewünschten Stelle ein (z.B. nach dem "In den Warenkorb"-Button):

```liquid
{% if product.tags contains 'configurable' or product.type == 'Basic' %}
  {% render 'sticker-configurator', 
    product: product, 
    current_variant: current_variant 
  %}
{% endif %}
```

## Sticker-Produkte einrichten

### 1. Produkt-Tags

Alle Sticker-Produkte müssen mit dem Tag `Sticker` versehen werden:

1. Gehe zu `Products > [Dein Sticker-Produkt]`
2. Füge den Tag `Sticker` hinzu
3. Speichern

### 2. Sticker-Maße als Metafields (Optional aber empfohlen)

Für exakte Maße kannst du Metafields verwenden:

1. **Metafield-Definition erstellen**:
   - Gehe zu `Settings > Custom data > Products`
   - Klicke auf "Add definition"
   - Name: `Width` / Namespace: `custom.width` / Type: `Number (Integer)`
   - Wiederhole für `Height` / Namespace: `custom.height`

2. **Maße für Sticker eintragen**:
   - Öffne ein Sticker-Produkt
   - Scrolle zu "Metafields"
   - Trage Breite und Höhe in Pixeln ein (z.B. 80 x 80)

### 3. Basis-Produkte taggen

Produkte, die konfigurierbar sein sollen (T-Shirts, Longsleeves):

1. Füge den Tag `configurable` hinzu, ODER
2. Setze den Product Type auf `Basic`

## Anpassung an dein gekauftes Theme

### Methode 1: Theme Editor nutzen (empfohlen)

Viele gekaufte Themes haben Custom Sections. Du kannst:

1. Eine neue Section erstellen: `sections/product-configurator.liquid`
2. Das Snippet dort einbinden
3. Die Section im Theme Editor zur Produktseite hinzufügen

```liquid
{% schema %}
{
  "name": "Sticker Konfigurator",
  "settings": [
    {
      "type": "text",
      "id": "button_text",
      "label": "Button Text",
      "default": "Mit Stickern personalisieren"
    }
  ]
}
{% endschema %}

{% render 'sticker-configurator', 
  product: product, 
  current_variant: current_variant 
%}
```

### Methode 2: App Block (für Online Store 2.0 Themes)

Wenn dein Theme Online Store 2.0 unterstützt:

```liquid
{% schema %}
{
  "name": "Sticker Konfigurator",
  "target": "section",
  "templates": ["product"],
  "settings": []
}
{% endschema %}
```

### Methode 3: JavaScript Injection (Theme-agnostisch)

Wenn du den Theme-Code nicht ändern möchtest:

1. Erstelle ein Snippet: `snippets/configurator-inject.liquid`

```liquid
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Finde den "In den Warenkorb" Button
  const addToCartButton = document.querySelector('[name="add"]');
  
  if (addToCartButton && {{ product.tags | json }}.includes('configurable')) {
    // Erstelle Konfigurator Button
    const configuratorBtn = document.createElement('button');
    configuratorBtn.id = 'open-sticker-configurator';
    configuratorBtn.className = addToCartButton.className;
    configuratorBtn.textContent = 'Mit Stickern personalisieren';
    configuratorBtn.type = 'button';
    
    // Füge nach dem Warenkorb-Button ein
    addToCartButton.parentNode.insertBefore(configuratorBtn, addToCartButton.nextSibling);
    
    // Event Listener (siehe Snippet oben)
    // ... [kompletter Code vom Snippet]
  }
});
</script>
```

Füge in `layout/theme.liquid` ein:
```liquid
{% render 'configurator-inject' %}
```

## Warenkorb-Properties

Die Konfigurator-Daten werden als Line Item Properties gespeichert:

**Basis-Produkt Properties:**
```javascript
{
  '_sticker_count': 3,      // Anzahl der Sticker
  '_configured': 'true'      // Markierung als konfiguriert
}
```

**Sticker Properties:**
```javascript
{
  '_parent_product': 'Basic T-Shirt',  // Referenz zum Basis-Produkt
  '_position_x': 150,                   // X-Position in Pixeln
  '_position_y': 200,                   // Y-Position in Pixeln
  '_scale': 100,                        // Skalierung in %
  '_rotation': 45,                      // Rotation in Grad
  '_sticker_index': 1                   // Reihenfolge
}
```

Diese Daten kannst du in Order-Templates, Benachrichtigungen oder für die Produktion nutzen.

## Styling anpassen

### CSS-Variablen überschreiben

Füge in dein Theme-CSS ein:

```css
/* In deiner theme.css oder custom.css */
.sticker-configurator-modal {
  --primary-color: #your-brand-color;
  --secondary-color: #your-secondary-color;
}

.btn-primary {
  background: var(--primary-color) !important;
}
```

### Komplettes Re-Styling

Da der Konfigurator scoped CSS nutzt, kannst du globale Overrides hinzufügen:

```css
/* Theme-spezifische Anpassungen */
#sticker-configurator-mount .configurator-container {
  border-radius: 0; /* Keine abgerundeten Ecken */
  box-shadow: 0 10px 40px rgba(0,0,0,0.3); /* Größerer Schatten */
}

#sticker-configurator-mount .btn {
  text-transform: uppercase; /* Großbuchstaben */
  font-weight: bold;
}
```

## Erweiterte Konfiguration

### Canvas-Größe anpassen

Je nach Produktbild-Größe kannst du die Canvas-Maße anpassen:

```javascript
window.initStickerConfigurator({
  // ...
  canvasWidth: 600,   // Breiter für Hoodies
  canvasHeight: 700,  // Höher für Kleider
});
```

### Verschiedene Canvas-Größen pro Produkttyp

```liquid
{% assign canvas_width = 400 %}
{% assign canvas_height = 500 %}

{% if product.type == 'Hoodie' %}
  {% assign canvas_width = 600 %}
  {% assign canvas_height = 700 %}
{% elsif product.type == 'Longsleeve' %}
  {% assign canvas_width = 450 %}
  {% assign canvas_height = 550 %}
{% endif %}

<script>
  // Nutze {{ canvas_width }} und {{ canvas_height }}
</script>
```

## Produktions-Workflow

### 1. Konfigurationen in Order-Details anzeigen

Erstelle ein Snippet: `snippets/order-line-item-property.liquid`

```liquid
{% if property.first == '_position_x' %}
  <strong>Position X:</strong> {{ property.last }}px<br>
{% elsif property.first == '_position_y' %}
  <strong>Position Y:</strong> {{ property.last }}px<br>
{% elsif property.first == '_scale' %}
  <strong>Größe:</strong> {{ property.last }}%<br>
{% elsif property.first == '_rotation' %}
  <strong>Rotation:</strong> {{ property.last }}°<br>
{% endif %}
```

### 2. Produktionsdaten exportieren

Du kannst die Properties über die Shopify API oder Apps wie "Order Printer" nutzen, um Produktionsdateien zu generieren.

## Troubleshooting

### Konfigurator öffnet sich nicht

1. Prüfe Browser Console auf Fehler
2. Stelle sicher, dass `sticker-configurator.js` geladen wird
3. Prüfe, ob `window.initStickerConfigurator` definiert ist

```javascript
console.log(typeof window.initStickerConfigurator); // sollte 'function' sein
```

### Sticker werden nicht geladen

1. Prüfe, ob Produkte korrekt getaggt sind (`Sticker`)
2. Teste die API: `/collections/all/products.json?limit=10`
3. Öffne Browser Console und prüfe Network-Tab

### Styling-Konflikte

Wenn dein Theme das Modal überschreibt:

```css
/* Höhere Spezifität erzwingen */
.sticker-configurator-modal {
  all: initial;
  * { all: unset; }
}
```

### Warenkorb wird nicht aktualisiert

Manche Themes nutzen eigene Cart-Systeme. Füge hinzu:

```javascript
// Nach erfolgreichem Cart-Add
fetch('/cart.js')
  .then(res => res.json())
  .then(cart => {
    // Theme-spezifische Cart-Update-Funktion aufrufen
    if (window.theme && window.theme.updateCart) {
      window.theme.updateCart(cart);
    }
  });
```

## Performance-Optimierung

### 1. Lazy Loading

Lade den Konfigurator erst, wenn der Button geklickt wird:

```liquid
<script>
let configuratorLoaded = false;

document.getElementById('open-sticker-configurator').addEventListener('click', function() {
  if (!configuratorLoaded) {
    const script = document.createElement('script');
    script.src = '{{ 'sticker-configurator.js' | asset_url }}';
    script.onload = () => {
      configuratorLoaded = true;
      openConfigurator();
    };
    document.body.appendChild(script);
  } else {
    openConfigurator();
  }
});
</script>
```

### 2. Image Optimization

Nutze Shopify's Image CDN:

```liquid
productImage: '{{ product.featured_image | img_url: '800x', crop: 'center' }}',
```

## Support & Weiterentwicklung

### Mögliche Erweiterungen

- [ ] Mehrere Druckbereiche (Vorder- und Rückseite)
- [ ] Text-Tool zum Hinzufügen eigener Texte
- [ ] Bild-Upload für eigene Designs
- [ ] Vorschau-Bilder generieren
- [ ] Gespeicherte Designs laden
- [ ] Größenabhängige Druckbereiche

## Lizenz

Dieses Projekt kannst du frei für deine Shopify-Shops nutzen und anpassen.
