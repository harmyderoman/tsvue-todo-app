<template>
  <button class="btn btn--quiet btn--share" type="button" @click="share">Share</button>
  <span v-if="status" role="status">{{ status }}</span>
  <modal-window :show="showLink" @onClose="showLink = false">
    <template #modal-header>Share this note</template>
    <template #modal-body>
      Anyone with this link can view this snapshot of your note.
      <label class="share-link">Link
        <input :value="link" readonly aria-label="Shared note link" @focus="selectLink" />
      </label>
    </template>
    <template #modal-actions>
      <button class="btn" type="button" @click="copy">Copy link</button>
      <a class="btn btn--quiet" :href="emailLink">Email</a>
      <button class="btn btn--quiet" type="button" @click="showLink = false">Close</button>
    </template>
  </modal-window>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotesStore } from '@/store'
import { sharedUrl } from '@/sharing'
import ModalWindow from './ModalWindow.vue'

const store = useNotesStore()
const showLink = ref(false)
const link = ref('')
const status = ref('')
const emailLink = computed(() => `mailto:?subject=${encodeURIComponent(store.currentNote.title || 'Shared note')}&body=${encodeURIComponent(link.value)}`)
const selectLink = (event: FocusEvent) => (event.target as HTMLInputElement).select()
async function copy() {
  try {
    await navigator.clipboard.writeText(link.value)
    status.value = 'Link copied'
  } catch {
    status.value = 'Select the link and copy it manually.'
  }
}
async function share() {
  status.value = ''
  link.value = sharedUrl(store.currentNote)
  if (navigator.share) {
    try {
      await navigator.share({ title: store.currentNote.title || 'Shared note', url: link.value })
      return
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
    }
  }
  showLink.value = true
}
</script>
