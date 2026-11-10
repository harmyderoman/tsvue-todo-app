<template>
  <button class="btn btn--accent" type="button" @click="callModalDialog('save')">
    Save
  </button>
  <button class="btn" type="button" @click="callModalDialog('cancel')">
    Cancel
  </button>
  <button class="btn btn--danger" type="button" @click="callModalDialog('delete')">
    Delete
  </button>
  <modal-window :show="showModal" @onClose="closeModal">
    <template v-slot:modal-header>
      {{ modalTitle }}
    </template>
    <template v-slot:modal-body>
      {{ modalBody }}
    </template>
    <template v-slot:modal-actions>
      <button type="button" class="btn btn--accent" @click="Confirm(true)">
        Confirm
      </button>
      <button type="button" class="btn" @click="Confirm(false)">
        Cancel
      </button>
    </template>
  </modal-window>
</template>

<script lang="ts">
  import { defineComponent, ref } from "vue"
  import store from "@/store"
  import router from "@/router"
  import ModalWindow from "./ModalWindow.vue"

  export default defineComponent({
    name: "NoteActions",
    components: {
      ModalWindow
    },
    setup() {
      const showModal = ref(false)
      const modalTitle = ref("")
      const modalBody = ref("")
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
            modalTitle.value = "Delete this note?"
            modalBody.value = "You will go back to the list of notes."
            break

          case "save":
            modalTitle.value = "Note saved"
            modalBody.value =
              "Confirm to go back to the list of notes, or Cancel to keep editing."
            saveNote()
            break

          case "cancel":
            modalTitle.value = "Leave without saving?"
            modalBody.value = "All unsaved changes will be lost."
            break

          default:
            console.error("Error! No action selected!")
            break
        }
      }
      // Only hide the dialog here: its text must stay put while it animates out.
      const closeModal = () => {
        showModal.value = false
        action.value = ""
      }

      const saveNote = () => {
        store.dispatch("saveNote")
      }
      const deleteNote = () => {
        store.commit("deleteNote")
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
