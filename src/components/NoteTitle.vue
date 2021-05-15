<template>
  <h3 v-if="!editable" @click="editable = !editable" class="title-font">
    {{ title ? title : "Click to edit Title" }}
  </h3>
  <input
    ref="titleRef"
    class="form-control title-font"
    v-else
    type="text"
    :value="title"
    @input="onTextChange"
    @keyup.enter="editable = !editable"
  />
</template>

<script lang="ts">
  import { defineComponent, ref } from "vue"
  import { onClickOutside } from "@vueuse/core"

  export default defineComponent({
    name: "NoteTitle",
    props: {
      title: {
        type: String,
        required: false
      }
    },
    setup() {
      const titleRef = ref(null)
      const editable = ref(false)

      onClickOutside(titleRef, () => {
        if (editable.value) {
          editable.value = false
        }
      })

      return { titleRef, editable }
    },
    methods: {
      onTextChange(e: { target: { value: string } }) {
        this.$emit("update-title", e.target.value)
      }
    }
  })
</script>

<style scoped>
  .title-font {
    font-size: calc(1.3rem + 0.6vw) !important;
    font-weight: 400 !important;
    padding: 0.83rem !important;
  }
</style>
