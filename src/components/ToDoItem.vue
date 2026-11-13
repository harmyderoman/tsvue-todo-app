<template>
  <li ref="todoItem" class="todo well">
    <div class="todo__main">
      <span class="check-bead">
        <input
          v-model="checked"
          class="check"
          type="checkbox"
          aria-label="Mark as done"
        />
        <glass-icon name="check" />
      </span>

      <button
        v-if="!editable"
        ref="displayRef"
        type="button"
        class="todo__text"
        :class="{
          completed: todo.completed && todo.text,
          'is-placeholder': !todo.text
        }"
        @click="editable = true"
      >
        {{ todo.text ? todo.text : "Click to edit Todo" }}
      </button>
      <!-- keydown, not keyup: the Enter that opened the field must not close it.
           Escape only closes the field; .stop keeps it from closing the note too. -->
      <input
        v-else
        ref="textInput"
        class="todo__input"
        type="text"
        aria-label="Todo text"
        :value="todo.text"
        @input="onTextChange"
        @keydown.enter="finishWithKeyboard"
        @keydown.esc.stop="stopEditing"
      />
    </div>

    <div class="todo__actions">
      <button
        type="button"
        class="btn btn--icon btn--sm"
        :class="editable ? 'btn--accent' : 'btn--quiet'"
        :aria-label="editable ? 'Save todo' : 'Edit todo'"
        :data-tip="editable ? 'Save todo' : 'Edit todo'"
        @click="editable = !editable"
      >
        <glass-icon :name="editable ? 'save' : 'pencil'" />
      </button>
      <button
        type="button"
        class="btn btn--icon btn--sm btn--quiet btn--danger"
        aria-label="Delete todo"
        data-tip="Delete todo"
        @click="$emit('remove-todo', todo)"
      >
        <glass-icon name="trash" />
      </button>
    </div>
  </li>
</template>

<script lang="ts">
  import { defineComponent, nextTick, onMounted, PropType, ref, watch } from "vue"
  import ToDo from "@/models/ToDoModel"
  import { onClickOutside } from "@vueuse/core"
  import GlassIcon from "./GlassIcon.vue"

  export default defineComponent({
    name: "TodoItem",
    components: { GlassIcon },
    props: {
      todo: {
        type: Object as PropType<ToDo>,
        required: true
      },
      /** Open the text field straight away: used for a row that was just added. */
      startEditing: {
        type: Boolean,
        default: false
      }
    },
    emits: ["remove-todo", "update-todo", "checkbox-click", "add-next"],
    setup(props, { emit }) {
      const todoItem = ref<HTMLElement | null>(null)
      const textInput = ref<HTMLInputElement | null>(null)
      const displayRef = ref<HTMLButtonElement | null>(null)
      const editable = ref(props.startEditing)

      onMounted(() => {
        if (editable.value) textInput.value?.focus()
      })

      onClickOutside(todoItem, () => {
        if (editable.value) {
          editable.value = false
        }
      })

      watch(editable, async (isEditable) => {
        if (!isEditable) return
        await nextTick()
        textInput.value?.focus()
      })

      // Commit the row before the parent mounts and focuses the next one.
      const finishWithKeyboard = async (event: KeyboardEvent) => {
        if (event.isComposing || event.repeat) return
        event.preventDefault()
        editable.value = false
        await nextTick()
        displayRef.value?.focus()
        if (props.todo.text !== "") emit("add-next")
      }

      // Escape: close the field and stay on the row, without starting a new one.
      const stopEditing = async () => {
        editable.value = false
        await nextTick()
        displayRef.value?.focus()
      }

      return { todoItem, textInput, displayRef, editable, finishWithKeyboard, stopEditing }
    },
    methods: {
      onTextChange(e: Event) {
        this.$emit("update-todo", (e.target as HTMLInputElement).value)
      }
    },
    computed: {
      checked: {
        get(): boolean {
          return this.todo.completed
        },
        set(value: boolean) {
          this.$emit("checkbox-click", value)
        }
      }
    }
  })
</script>
