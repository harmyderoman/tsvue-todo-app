<template>
  <div class="" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="h6 modal-title mb-0" id="modal-title-default">
            {{ title }}
          </h2>
          <button type="button" class="close" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="modal-body">
          <p>
            {{ text }}
          </p>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary text-success"
            @click="accept"
          >
            Confirm
          </button>
          <button
            type="button"
            class="btn btn-primary text-danger ml-auto"
            @click="reject"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"

  export default defineComponent({
    name: "ModalWindow",
    props: {
      title: String,
      text: String
    },
    methods: {
      close() {
        this.$emit("close")
      },
      accept() {
        this.$emit("confirm", true)
      },
      reject() {
        this.$emit("confirm", false)
      }
    }
  })
</script>
