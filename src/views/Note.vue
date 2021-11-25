<template>
	<div class="card shadow-inset bg-primary border-light p-4 rounded">
		<div class="d-flex justify-content-start mb-3">
			<div class="col">
				<button
					class="btn btn-primary text-success mr-2 mb-2"
					type="button"
					@click="undo"
					:disabled="!canUndo"
				>
					Undo
				</button>
				<button
					class="btn btn-primary text-info mr-2 mb-2"
					type="button"
					@click="redo"
					:disabled="!canRedo"
				>
					Redo
				</button>
			</div>
		</div>

		<div class="card bg-primary border-light shadow-soft p-4">
			<note-title :title="note.title" @update-title="updateTitle" />

			<ul>
				<TodoItem
					v-for="(todo, index) in note.todos"
					:todo="todo"
					:key="index"
					@remove-todo="onRemoveTodo(index)"
				/>
			</ul>

			<div>
				<button class="btn btn-primary text-info ml-2 mb-2" @click="addNewTodo">
					Add New Todo
				</button>
			</div>
		</div>

		<div class="mt-4 d-flex justify-content-end">
			<note-actions />
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, onMounted, nextTick, onUnmounted, ref } from 'vue'
	import { useDebouncedRefHistory } from '@vueuse/core'

	import TodoItem from '@/components/ToDoItem.vue'
	import NoteActions from '@/components/NoteActions.vue'
	import NoteTitle from '@/components/NoteTitle.vue'

	import ToDo from '@/models/ToDoModel'

	import router from '@/router'
	import { useNotes } from '@/store/notes'

	import { storeToRefs } from 'pinia'

	export default defineComponent({
		name: 'Note',
		components: {
			TodoItem,
			NoteActions,
			NoteTitle,
		},
		setup() {
			const store = useNotes()
			const { addNote, updateNote, deleteNote, getNoteById } = store
			const { notes, currentNote, currentNoteId, getIdOfLastNote } =
				storeToRefs(store)

			const { history, undo, redo, canUndo, canRedo, clear } =
				useDebouncedRefHistory(currentNote, {
					deep: true,
					clone: true,
					debounce: 300,
				})

			const { currentRoute } = router
			const fetchNote = async () => {
				if (currentRoute.value.params.id) {
					const routeId: number = +currentRoute.value.params.id
					currentNoteId.value = routeId
					const fetchedNote = getNoteById(routeId)
					if (fetchedNote) currentNote.value = fetchedNote
				}
			}
			onMounted(fetchNote)
			onUnmounted(clear)

			const updateTitle = (title: string) => {
				currentNote.value.title = title
			}

			const addNewTodo = () => {
				currentNote.value.todos.push({} as ToDo)
			}

			const onRemoveTodo = (index: number) => {
				currentNote.value.todos.splice(index, 1)
			}

			const clearNote = () => {
				currentNote.value.todos = []
				currentNote.value.title = ''
				currentNoteId.value = getIdOfLastNote.value + 1
			}

			return {
				note: currentNote,
				addNewTodo,
				onRemoveTodo,
				clearNote,
				updateTitle,
				undo,
				redo,
				canUndo,
				canRedo,
				clear,
			}
		},
		beforeRouteLeave(to, from, next) {
			this.clearNote()
			this.clear()
			next()
		},
	})
</script>

<style>
	.new-todo {
		display: flex;
		justify-content: flex-start;
		background-color: #e2e2e2;
		height: 36px;
		margin: 5px 0px;
		padding-top: 4px;
		padding-left: 10px;
		padding-right: 15px;
		border-radius: 5px;
	}
	ul {
		padding-inline-start: 5px;
	}
</style>
