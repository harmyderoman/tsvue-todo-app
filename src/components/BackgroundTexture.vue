<template>
  <div class="tide" aria-hidden="true">
    <svg class="tide__texture" width="100%" height="100%">
      <defs>
        <linearGradient :id="fadeId">
          <stop offset="0" stop-color="white" />
          <stop offset="1" stop-color="black" />
        </linearGradient>
        <mask :id="seamId" maskUnits="userSpaceOnUse" x="0" y="0" :width="seamWidth" :height="tileHeight">
          <rect :width="seamWidth" :height="tileHeight" :fill="`url(#${fadeId})`" />
        </mask>
        <!-- Repeat along the diagonal bands, so their edges stay continuous. -->
        <pattern :id="patternId" patternUnits="userSpaceOnUse" :width="tileWidth" :height="tileHeight" :patternTransform="`rotate(${-angle})`">
          <image :id="imageId" :href="texture" width="1080" height="1350" :transform="imageTransform" />
          <g :mask="`url(#${seamId})`">
            <use :href="`#${imageId}`" :transform="`translate(${-tileWidth},0)`" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" :fill="`url(#${patternId})`" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import texture from '@/assets/reference-background.webp'

// Sample a strip parallel to the reference's bands, then turn the repeating
// grid with those bands. Scale affects detail size without changing alignment.
const scale = .5
const angle = 43.52
const tileWidth = 420 * scale
const tileHeight = 700 * scale
const seamWidth = 32 * scale
const imageTransform = `translate(${180 * scale},${-360 * scale}) rotate(${angle}) scale(${scale})`
const patternId = useId()
const imageId = useId()
const fadeId = useId()
const seamId = useId()
</script>
