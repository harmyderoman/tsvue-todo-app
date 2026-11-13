<template>
  <h1 v-if="!editable" class="note-title-heading">
    <button
      ref="displayRef"
      type="button"
      class="note-title"
      :class="{ 'is-placeholder': !title }"
      @click="editable = true"
    >
      {{ title ? title : "Click to edit Title" }}
    </button>
  </h1>
  <!-- keydown, not keyup: the Enter that opened the field must not close it.
       Escape only closes the field; .stop keeps it from closing the note too. -->
  <input
    v-else
    ref="titleRef"
    class="note-title"
    type="text"
    aria-label="Note title"
    :value="title"
    @input="onTextChange"
    @keydown.enter="finishWithKeyboard"
    @keydown.esc.stop="finishWithKeyboard"
  />
</template>

<script lang="ts">
  import { defineComponent, nextTick, ref, watch } from "vue"
  import { onClickOutside } from "@vueuse/core"

  export default defineComponent({
    name: "NoteTitle",
    props: {
      title: {
        type: String,
        required: false
      }
    },
    emits: ["update-title"],
    setup() {
      const titleRef = ref<HTMLInputElement | null>(null)
      const displayRef = ref<HTMLButtonElement | null>(null)
      const editable = ref(false)

      onClickOutside(titleRef, () => {
        if (editable.value) {
          editable.value = false
        }
      })

      watch(editable, async (isEditable) => {
        if (!isEditable) return
        await nextTick()
        titleRef.value?.focus()
      })

      // Keep keyboard users where they were instead of dropping focus to <body>.
      const finishWithKeyboard = async () => {
        editable.value = false
        await nextTick()
        displayRef.value?.focus()
      }

      return { titleRef, displayRef, editable, finishWithKeyboard }
    },
    methods: {
      onTextChange(e: Event) {
        this.$emit("update-title", (e.target as HTMLInputElement).value)
      }
    }
  })
</script>
