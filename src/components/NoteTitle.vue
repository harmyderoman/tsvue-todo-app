<template>
  <h3
    v-if="!editable"
    class="note-title"
    :class="{ 'is-placeholder': !title }"
    @click="editable = true"
  >
    {{ title ? title : "Click to edit Title" }}
  </h3>
  <input
    v-else
    ref="titleRef"
    class="note-title"
    type="text"
    aria-label="Note title"
    :value="title"
    @input="onTextChange"
    @keyup.enter="editable = false"
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

      return { titleRef, editable }
    },
    methods: {
      onTextChange(e: Event) {
        this.$emit("update-title", (e.target as HTMLInputElement).value)
      }
    }
  })
</script>
