<template>
  <!-- Modal Content -->
  <div class="" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="h6 modal-title mb-0" id="modal-title-default">
            Terms of Service
          </h2>
          <button type="button" class="close" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="modal-body">
          <p>
            With less than a month to go before the European Union enacts new
            consumer privacy laws for its citizens, companies around the world
            are updating their terms of service agreements to comply.
          </p>
          <p>
            The European Union’s General Data Protection Regulation (G.D.P.R.)
            goes into effect on May 25 and is meant to ensure a common set of
            data rights in the European Union. It requires organizations to
            notify users as soon as possible of high-risk data breaches that
            could personally affect them.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-sm btn-primary">I Got It</button>
          <button type="button" class="btn btn-primary text-danger ml-auto">
            Close
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
    methods: {
      close() {
        this.$emit("close")
      }
    }
  })
</script>
