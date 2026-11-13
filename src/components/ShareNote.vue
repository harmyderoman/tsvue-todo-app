<template>
  <button
    class="btn btn--icon btn--share"
    :class="{ 'btn--sm': small }"
    type="button"
    aria-label="Share note"
    :disabled="isEmpty"
    :title="isEmpty ? 'Add a title or a todo first' : `Share ${target.title || 'this note'}`"
    @click="share"
  >
    <glass-icon name="share" />
  </button>
  <modal-window :show="showLink" @onClose="showLink = false">
    <template #modal-header>Share this note</template>
    <template #modal-body>
      Anyone with this link can view this snapshot of your note.
      <label class="share-link">Link
        <input :value="link" readonly aria-label="Shared note link" @focus="selectLink" />
      </label>
      <span v-if="status" class="share-link__status" role="status">{{ status }}</span>
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
import { useNotesStore, type Draft } from '@/store'
import { sharedUrl } from '@/sharing'
import ModalWindow from './ModalWindow.vue'
import GlassIcon from './GlassIcon.vue'

// Shares the given note, or the one open in the editor when none is given.
const props = defineProps<{ note?: Draft; small?: boolean }>()

const store = useNotesStore()
const target = computed(() => props.note ?? store.currentNote)
const isEmpty = computed(() =>
  target.value.title.trim() === '' && target.value.todos.every(todo => todo.text.trim() === ''))

const showLink = ref(false)
const link = ref('')
const status = ref('')
const emailLink = computed(() => `mailto:?subject=${encodeURIComponent(target.value.title || 'Shared note')}&body=${encodeURIComponent(link.value)}`)
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
  link.value = sharedUrl(target.value)
  if (navigator.share) {
    try {
      await navigator.share({ title: target.value.title || 'Shared note', url: link.value })
      return
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
    }
  }
  showLink.value = true
}
</script>
