import { createApp } from 'vue'
import StickerConfigurator from './components/StickerConfigurator.vue'

// Globale Initialisierung für Shopify
window.initStickerConfigurator = function(config) {
  const mountPoint = document.getElementById('sticker-configurator-mount')
  
  if (mountPoint) {
    const app = createApp(StickerConfigurator, {
      productId: config.productId,
      productTitle: config.productTitle,
      productImage: config.productImage,
      variantId: config.variantId,
      stickers: config.stickers || [],
      canvasWidth: config.canvasWidth || 400,
      canvasHeight: config.canvasHeight || 500
    })
    
    app.mount(mountPoint)
    
    return app
  }
}
