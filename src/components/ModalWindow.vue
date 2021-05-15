<template>
  <teleport to="body">
    <div v-if="showModal" class="modal-backdrop" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-soft">
          <div class="modal-header">
            <slot name="modal-header">
              <h2 class="h6 modal-title mb-0" id="modal-title-default">
                default Title
              </h2>
            </slot>
            <button type="button" class="close" @click="$emit('onClose')">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body">
            <slot name="modal-body">
              <p>
                default text
              </p>
            </slot>
          </div>
          <div class="modal-footer">
            <slot name="modal-actions">
              <p>No Actions</p>
            </slot>
          </div>
        </div>
      </div>
    </div>
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
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1050;
    width: 100%;
    height: 100%;
    overflow: hidden;
    outline: 0;
  }
</style>
