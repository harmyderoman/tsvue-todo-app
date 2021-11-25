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
	<modal-window ref="focusTarget" :show="showModal" @onClose="closeModal">
		<template v-slot:modal-header>
			{{ modalTitle }}
		</template>
		<template v-slot:modal-body>
			{{ modalBody }}
		</template>
		<template v-slot:modal-actions>
			<button
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
			</button>
		</template>
	</modal-window>
</template>

<script lang="ts">
	import { defineComponent, ref } from 'vue'
	import router from '@/router'
	import ModalWindow from './ModalWindow.vue'
	import { useConfirmDialog } from '../composables/useConfirmDialog'

	import { useNotes } from '@/store/notes'

	export default defineComponent({
		name: 'NoteActions',
		components: {
			ModalWindow,
		},
		setup() {
			const showModal = ref(false)
			const modalTitle = ref('Modal Title')
			const modalBody = ref('Modal Body')
			const action = ref('')
			const focusTarget = ref()
			const store = useNotes()

			const {
				showDialog,
				confirm: Confirm,
				cancel: closeModal,
				onConfirm,
				onCancel,
			} = useConfirmDialog(showModal, () => console.log('Modal!'))

			const clearModalMessages = () => {
				action.value = ''
				modalTitle.value = ''
				modalBody.value = ''
			}

			onConfirm((permission: boolean) => {
				if (permission) {
					switch (action.value) {
						case 'delete':
							deleteNote()
							break

						case 'save':
							router.push('/')
							break
						case 'cancel':
							cancelEdit()
							break
						default:
							console.error('Error! No action selected!')
							break
					}
				}
				clearModalMessages()
			})

			onCancel(() => {
				clearModalMessages()
			})

			const callModalDialog = (value: string) => {
				action.value = value

				switch (value) {
					case 'delete':
						modalTitle.value = 'Do you really want to delete this Note?'
						modalBody.value = 'You will be redirected to main page after this.'
						break

					case 'save':
						modalTitle.value = 'Your Note is saved!'
						modalBody.value =
							'Do you want to exit to the main page? To continue edit this note, please click Cancel!'
						saveNote()
						break

					case 'cancel':
						modalTitle.value = 'Do you really want to cancel this Note?'
						modalBody.value = 'All unsaved changes will be lost!'
						break

					default:
						console.error('Error! No action selected!')
						break
				}
				showDialog()
			}
			const saveNote = () => {
				store.updateNote()
			}
			const deleteNote = () => {
				store.deleteNote(store.currentNoteId)
				router.push('/')
			}
			const cancelEdit = () => {
				router.push('/')
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
				closeModal,
			}
		},
	})
</script>
