<template>
  <div class="sticker-configurator-modal frsn-configurator" @click.self="closeModal">
    <div class="frsn-configurator-container">
      <div class="frsn-configurator-header">
        <h2>Sticker Konfigurator</h2>
        <button class="close-btn" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6 6 18M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="frsn-configurator-body">
        <!-- Canvas Bereich -->
        <div class="canvas-section">
          <h3>{{ productTitle }}</h3>
          <div class="canvas-wrapper">
            <div
              class="canvas"
              :style="{
                backgroundImage: `url(${productImage})`,
                width: canvasWidth + 'px',
                height: canvasHeight + 'px'
              }"
              @drop="handleDrop"
              @dragover.prevent
            >
              <div
                v-for="(sticker, index) in placedStickers"
                :key="index"
                class="placed-sticker"
                :class="{ active: selectedStickerIndex === index }"
                :style="getStickerStyle(sticker)"
                @mousedown="startDrag($event, index)"
                @click="selectSticker(index)"
              >
                <img :src="sticker.image" :alt="sticker.title" draggable="false">
                <button 
                  class="remove-sticker-btn" 
                  @click.stop="removeSticker(index)"
                  title="Entfernen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6 6 18M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Steuerung für ausgewählten Sticker -->
          <StickerCustomizer v-if="selectedStickerIndex !== null" :selectedSticker="placedStickers[selectedStickerIndex]"></StickerCustomizer>
        </div>

        <!-- Sticker Auswahl -->
        <div class="sticker-selection">
          <h3>Verfügbare Sticker</h3>
          <div class="sticker-grid">
            <div
              v-for="sticker in stickers"
              :key="sticker.id"
              class="sticker-item"
              draggable="true"
              @dragstart="startStickerDrag($event, sticker)"
              @click="addSticker(sticker)"
            >
              <img :src="sticker.image" :alt="sticker.title">
              <p>{{ sticker.title }}</p>
              <p class="sticker-price">{{ formatPrice(sticker.price) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="frsn-configurator-footer">
        <div class="summary">
          <p>
            <strong>{{ placedStickers.length }}</strong> Sticker ausgewählt
          </p>
          <p class="total-price">
            Gesamtpreis: <strong>{{ formatPrice(totalPrice) }}</strong>
          </p>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" @click="clearAll">Alles löschen</button>
          <button 
            class="btn btn-primary" 
            @click="addToCart"
            :disabled="placedStickers.length === 0"
          >
            Zum Warenkorb hinzufügen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StickerCustomizer from "./StickerCustomizer.vue";

export default {
  name: 'StickerConfigurator',
  components: {StickerCustomizer},
  props: {
    productId: {
      type: String,
      required: true
    },
    productTitle: {
      type: String,
      required: true
    },
    productImage: {
      type: String,
      required: true
    },
    variantId: {
      type: String,
      required: true
    },
    stickers: {
      type: Array,
      default: () => []
    },
    canvasWidth: {
      type: Number,
      default: 400
    },
    canvasHeight: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      placedStickers: [],
      selectedStickerIndex: null,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      draggedSticker: null
    }
  },
  computed: {
    totalPrice() {
      return this.placedStickers.reduce((sum, sticker) => {
        return sum + parseFloat(sticker.price || 0)
      }, 0)
    }
  },
  methods: {
    addSticker(sticker) {
      this.placedStickers.push({
        id: sticker.id,
        variantId: sticker.variantId,
        title: sticker.title,
        image: sticker.image,
        price: sticker.price,
        width: sticker.width || 80,
        height: sticker.height || 80,
        x: this.canvasWidth / 2 - 40,
        y: this.canvasHeight / 2 - 40,
        scale: 100,
        rotation: 0,
        variants: sticker.variants,
      })
      console.log(sticker)
      this.selectedStickerIndex = this.placedStickers.length - 1
    },
    
    removeSticker(index) {
      this.placedStickers.splice(index, 1)
      if (this.selectedStickerIndex === index) {
        this.selectedStickerIndex = null
      } else if (this.selectedStickerIndex > index) {
        this.selectedStickerIndex--
      }
    },
    
    selectSticker(index) {
      this.selectedStickerIndex = index
    },
    
    getStickerStyle(sticker) {
      const scale = sticker.scale / 100
      return {
        left: sticker.x + 'px',
        top: sticker.y + 'px',
        width: sticker.width + 'px',
        height: sticker.height + 'px',
        transform: `scale(${scale}) rotate(${sticker.rotation}deg)`
      }
    },
    
    startDrag(event, index) {
      this.isDragging = true
      this.selectedStickerIndex = index
      this.dragStartX = event.clientX - this.placedStickers[index].x
      this.dragStartY = event.clientY - this.placedStickers[index].y
      
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.stopDrag)
    },
    
    onDrag(event) {
      if (this.isDragging && this.selectedStickerIndex !== null) {
        const sticker = this.placedStickers[this.selectedStickerIndex]
        const canvas = document.querySelector('.canvas')
        const rect = canvas.getBoundingClientRect()
        
        let newX = event.clientX - this.dragStartX
        let newY = event.clientY - this.dragStartY
        
        // Begrenzung auf Canvas
        newX = Math.max(0, Math.min(newX, this.canvasWidth - sticker.width))
        newY = Math.max(0, Math.min(newY, this.canvasHeight - sticker.height))
        
        sticker.x = newX
        sticker.y = newY
      }
    },
    
    stopDrag() {
      this.isDragging = false
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDrag)
    },
    
    startStickerDrag(event, sticker) {
      this.draggedSticker = sticker
      event.dataTransfer.effectAllowed = 'copy'
    },
    
    handleDrop(event) {
      event.preventDefault()
      if (this.draggedSticker) {
        const canvas = event.currentTarget
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left - 40
        const y = event.clientY - rect.top - 40
        
        this.placedStickers.push({
          id: this.draggedSticker.id,
          variantId: this.draggedSticker.variantId,
          title: this.draggedSticker.title,
          image: this.draggedSticker.image,
          price: this.draggedSticker.price,
          width: this.draggedSticker.width || 80,
          height: this.draggedSticker.height || 80,
          x: Math.max(0, Math.min(x, this.canvasWidth - 80)),
          y: Math.max(0, Math.min(y, this.canvasHeight - 80)),
          scale: 100,
          rotation: 0
        })
        
        this.draggedSticker = null
      }
    },
    
    clearAll() {
      if (confirm('Möchtest du wirklich alle Sticker entfernen?')) {
        this.placedStickers = []
        this.selectedStickerIndex = null
      }
    },
    
    async addToCart() {
      try {
        // Basis-Produkt zum Warenkorb hinzufügen
        const items = [
          {
            id: this.variantId,
            quantity: 1,
            properties: {
              '_sticker_count': this.placedStickers.length,
              '_configured': 'true'
            }
          }
        ]
        
        // Alle Sticker hinzufügen
        this.placedStickers.forEach((sticker, index) => {
          items.push({
            id: sticker.variantId,
            quantity: 1,
            properties: {
              '_parent_product': this.productTitle,
              '_position_x': Math.round(sticker.x),
              '_position_y': Math.round(sticker.y),
              '_scale': sticker.scale,
              '_rotation': sticker.rotation,
              '_sticker_index': index + 1
            }
          })
        })
        
        // Shopify Cart API verwenden
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items })
        })
        
        if (response.ok) {
          // Warenkorb aktualisieren
          if (window.Shopify && window.Shopify.theme) {
            // Theme-spezifische Warenkorb-Aktualisierung
            document.dispatchEvent(new CustomEvent('cart:updated'))
          }
          
          alert('Produkt wurde zum Warenkorb hinzugefügt!')
          this.closeModal()
        } else {
          throw new Error('Fehler beim Hinzufügen zum Warenkorb')
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        alert('Es gab einen Fehler beim Hinzufügen zum Warenkorb. Bitte versuche es erneut.')
      }
    },
    
    closeModal() {
      this.$emit('close')
      // Entferne das Modal aus dem DOM
      const modal = document.getElementById('sticker-configurator-mount')
      if (modal) {
        modal.innerHTML = ''
      }
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }
  }
}
</script>

<style scoped lang="scss">
.frsn-configurator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  &-container {
    background: #000;
    max-width: 1200px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #fff;
  }
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    h2 {
      margin: 0;
      font-size: 24px;
    }
  }
  &-body {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 30px;
    padding: 30px;
    overflow-y: scroll;
    flex: 1;
    .sticker-selection,
    .canvas-section {
      h3 {
        margin: 0 0 20px 0;
        font-size: 18px;
      }
    }
  }
  &-footer {
    padding: 20px 30px;
    border-top: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow-y: scroll;
  }
}


.close-btn {
  background: none;
  border: none;
  font-size: 36px;
  cursor: pointer;
  color: #fff;
  line-height: 1;
  padding: 0;
  width: 36px;
  height: 36px;
}

.close-btn:hover {
  color: rgba(255, 255, 255, 0.53);
}

.canvas-wrapper {
  background: #fff;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.canvas {
  position: relative;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border: 2px dashed #ccc;
  border-radius: 8px;
}

.placed-sticker {
  position: absolute;
  cursor: move;
  user-select: none;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.placed-sticker:hover,
.placed-sticker.active {
  border-color: #007bff;
}

.placed-sticker img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.remove-sticker-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: none;
  align-items: center;
  justify-content: center;
}

.placed-sticker:hover .remove-sticker-btn,
.placed-sticker.active .remove-sticker-btn {
  display: flex;
  padding: 0;
  svg {
    width: 1rem;
    height: 1rem;
    path {stroke-width: 3px;}
  }
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.sticker-item {
  border: 1px dashed #fff;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.sticker-item:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.sticker-item img {
  height: 80px;
  object-fit: contain;
  margin-bottom: 10px;
}

.sticker-item p {
  margin: 5px 0;
  font-size: 14px;
}

.sticker-price {
  font-weight: bolder;
  color: #fff;
}

.summary {
  flex: 1;
}

.summary p {
  margin: 5px 0;
}

.total-price {
  font-size: 18px;
  color: #fff;
}

.actions {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border: 1px solid;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: rgba(255, 255, 255, 1);
  border: 1px solid #ffff;
  color: #000;
}

.btn-primary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0);
  color: #fff;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0);
  border: 1px solid rgba(255, 255, 255, 0);
  color: white;
}

.btn-secondary:hover {
  background: #fff;
  color: #000;
}

/* Responsive */
@media (max-width: 968px) {
  .frsn-configurator-body {
    grid-template-columns: 1fr;
  }
  
  .sticker-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .frsn-configurator-header {
    padding: 15px 20px;
  }
  
  .frsn-configurator-body {
    padding: 20px;
  }
  
  .sticker-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .configurator-footer {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
