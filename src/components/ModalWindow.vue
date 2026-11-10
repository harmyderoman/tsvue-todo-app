<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="show"
        class="modal"
        role="dialog"
        aria-modal="true"
        @click.self="$emit('onClose')"
      >
        <div class="modal__dialog glass">
          <div class="modal__head">
            <h2 class="modal__title">
              <slot name="modal-header">Are you sure?</slot>
            </h2>
            <button
              type="button"
              class="modal__close"
              aria-label="Close"
              @click="$emit('onClose')"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <p class="modal__body">
            <slot name="modal-body"></slot>
          </p>
          <div class="modal__actions">
            <slot name="modal-actions"></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import { useEventListener } from "@vueuse/core"

  export default defineComponent({
    name: "ModalDialog",
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    emits: ["onClose"],
    setup(props, { emit }) {
      useEventListener(document, "keydown", (event: KeyboardEvent) => {
        if (props.show && event.key === "Escape") emit("onClose")
      })
    }
  })
</script>
