<template>
  <div v-if="selectedSticker !== null && selectedSticker?.variants?.length > 0" class="sticker-controls">
    <h4>Sticker Einstellungen</h4>
    <div class="control-group" v-if="selectedSticker?.variants?.filter(v => v.name === 'Farbe')[0]">
      <label>
        Farbe: <b v-html="getSelectedColor(selectedSticker.variantId, selectedSticker.variants[0].variants)"></b>
      </label>
      <div class="control-group--select-option" v-for="color in selectedSticker.variants[0].variants">
        <input type="radio">
        <div class="control-group--select-square" v-html="color.title"></div>
      </div>
    </div>
  </div>
</template>
<script>
import {computed, ref} from "vue";

export default {
  name: 'StickerCustomizer',
  props: {
    selectedSticker: {
      type: Object,
      required: true
    }
  },
  methods: {
    getSelectedColor(id, variants) {
      const color = variants.filter(v => v.id = id)[0];
      console.log(id, variants)
      console.log(color)
      return color.title
    }
  }
}
</script>

<style lang="scss" scoped>
.sticker-controls {
  margin-top: 20px;
  padding: 20px;
  background: #000;
  border: 1px solid #fff;
}

.sticker-controls h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.control-group input[type="range"] {
  width: 100%;
}
</style>