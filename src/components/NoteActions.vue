<template>
  <button
    class="btn btn-primary text-success mr-2 mb-2"
    type="button"
    @click="callModalDialog('save')"
  >
    Save
  </button>
  <button
    class="btn btn-primary text-info mr-2 mb-2"
    type="button"
    @click="callModalDialog('cancel')"
  >
    Cancel
  </button>
  <button
    class="btn btn-primary text-danger mr-2 mb-2"
    type="button"
    @click="callModalDialog('delete')"
  >
    Delete
  </button>
  <modal-window :show="showModal" @onClose="closeModal">
    <template v-slot:modal-header>
      <h2 class="h6 modal-title mb-0" id="modal-title-default">
        {{ modalTitle }}
      </h2>
    </template>
    <template v-slot:modal-body>
      <p>{{ modalBody }}</p>
    </template>
    <template v-slot:modal-actions
      ><button
        type="button"
        class="btn btn-primary text-success"
        @click="Confirm(true)"
      >
        Confirm
      </button>
      <button
        type="button"
        class="btn btn-primary text-danger ml-auto"
        @click="Confirm(false)"
      >
        Cancel
      </button></template
    >
  </modal-window>
</template>

<script lang="ts">
  import { defineComponent, computed, ref } from "vue"
  import store from "@/store"
  import router from "@/router"
  import ModalWindow from "./ModalWindow.vue"

  export default defineComponent({
    name: "NoteActions",
    components: {
      ModalWindow
    },
    setup() {
      const note = computed(() => store.state.currentNote)

      const showModal = ref(false)
      const modalTitle = ref("Modal Title")
      const modalBody = ref("Modal Body")
      const action = ref("")

      const Confirm = (permission: boolean) => {
        if (permission) {
          switch (action.value) {
            case "delete":
              deleteNote()
              break

            case "save":
              router.push("/")
              break
            case "cancel":
              cancelEdit()
              break
            default:
              console.error("Error! No action selected!")
              break
          }
        }
        closeModal()
      }

      const callModalDialog = (value: string) => {
        action.value = value
        showModal.value = true
        switch (value) {
          case "delete":
            modalTitle.value = "Do you realy want to delete this Note?"
            modalBody.value = "You will be redirected to main page after this."
            break

          case "save":
            modalTitle.value = "Your Note is saved!"
            modalBody.value =
              "Do you want to exit to the main page? To continue edit this note, please click Cancel!"
            saveNote()
            break

          case "cancel":
            modalTitle.value = "Do you realy want to cancel this Note?"
            modalBody.value = "All unsaved changes will be lost!"
            break

          default:
            console.error("Error! No action selected!")
            break
        }
      }
      const closeModal = () => {
        showModal.value = false
        action.value = ""
        modalTitle.value = ""
        modalBody.value = ""
      }

      const saveNote = () => {
        store.dispatch("saveNote")
      }
      const deleteNote = () => {
        store.commit("deleteNote", note)
        router.push("/")
      }
      const cancelEdit = () => {
        router.push("/")
      }
      return {
        saveNote,
        deleteNote,
        cancelEdit,
        showModal,
        modalTitle,
        modalBody,
        Confirm,
        callModalDialog,
        closeModal
      }
    }
  })
</script>
