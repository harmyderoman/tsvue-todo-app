<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="showModal" class="modal-backdrop" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-soft">
            <div class="modal-header">
              <h2 class="h6 modal-title mb-0">
                <slot name="modal-header"> default Title</slot>
              </h2>

              <button type="button" class="close" @click="$emit('onClose')">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div class="modal-body">
              <p>
                <slot name="modal-body">
                  default text
                </slot>
              </p>
            </div>
            <div class="modal-footer">
              <slot name="modal-actions">
                <p>No Actions</p>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from "vue"

  const props = {
    show: {
      type: Boolean,
      default: false
    }
  }
  const emits = ["onClose"]
  const components = {}
  export default defineComponent({
    name: "ModalDialog",
    props,
    emits,
    components,
    setup(props) {
      const showModal = ref(false)

      watch(
        () => props.show,
        (show) => {
          showModal.value = show
        }
      )

      return {
        showModal
      }
    }
  })
</script>

<style>
  .modal-backdrop {
    overflow: hidden;
    outline: 0;
    background-color: #e6e7eec0 !important;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
