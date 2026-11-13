<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="show" class="modal" @click.self="$emit('onClose')">
        <div
          ref="dialogRef"
          class="modal__dialog glass"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          @keydown.tab="keepFocusInside"
        >
          <div class="modal__head">
            <h2 :id="titleId" class="modal__title">
              <slot name="modal-header">Are you sure?</slot>
            </h2>
            <button
              type="button"
              class="btn btn--icon btn--sm btn--quiet modal__close"
              aria-label="Close"
              data-tip="Close (Esc)"
              @click="$emit('onClose')"
            >
              <glass-icon name="close" />
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
  import { defineComponent, onBeforeUnmount, ref, useId, watch } from "vue"
  import { useEventListener } from "@vueuse/core"
  import GlassIcon from "./GlassIcon.vue"

  const FOCUSABLE = "button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex='-1'])"

  export default defineComponent({
    name: "ModalDialog",
    components: { GlassIcon },
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    emits: ["onClose"],
    setup(props, { emit }) {
      const dialogRef = ref<HTMLElement | null>(null)
      const titleId = useId()
      let returnFocusTo: HTMLElement | null = null

      const restoreFocus = () => {
        // Skip elements that went away while the dialog was open.
        if (returnFocusTo?.isConnected) returnFocusTo.focus()
        returnFocusTo = null
      }

      // Move focus into the dialog when it opens and back when it closes.
      // The dialog itself gets focus, not a button, so a stray Enter can't
      // confirm a destructive action.
      watch(
        () => props.show,
        (show) => {
          if (show) {
            returnFocusTo = document.activeElement as HTMLElement | null
            dialogRef.value?.focus()
          } else {
            restoreFocus()
          }
        },
        { flush: "post", immediate: true }
      )
      onBeforeUnmount(restoreFocus)

      const keepFocusInside = (event: KeyboardEvent) => {
        const dialog = dialogRef.value
        if (!dialog) return
        const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)]
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement
        if (event.shiftKey && (active === first || active === dialog)) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }

      useEventListener(document, "keydown", (event: KeyboardEvent) => {
        if (props.show && event.key === "Escape") emit("onClose")
      })

      return { dialogRef, titleId, keepFocusInside }
    }
  })
</script>
