<template>
  <li ref="todoItem" class="todo well">
    <div class="todo__main">
      <input
        v-model="checked"
        class="check"
        type="checkbox"
        aria-label="Mark as done"
      />

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
      <!-- keydown, not keyup: the Enter that opened the field must not close it -->
      <input
        v-else
        ref="textInput"
        class="todo__input"
        type="text"
        aria-label="Todo text"
        :value="todo.text"
        @input="onTextChange"
        @keydown.enter="finishWithKeyboard"
      />
    </div>

    <div class="todo__actions">
      <button
        type="button"
        class="btn btn--sm"
        :class="{ 'btn--accent': editable }"
        @click="editable = !editable"
      >
        {{ editable ? "Save" : "Edit" }}
      </button>
      <button
        type="button"
        class="btn btn--sm btn--danger"
        @click="$emit('remove-todo', todo)"
      >
        Delete
      </button>
    </div>
  </li>
</template>

<script lang="ts">
  import { defineComponent, nextTick, PropType, ref, watch } from "vue"
  import ToDo from "@/models/ToDoModel"
  import { onClickOutside } from "@vueuse/core"

  export default defineComponent({
    name: "TodoItem",
    props: {
      todo: {
        type: Object as PropType<ToDo>,
        required: true
      }
    },
    emits: ["remove-todo", "update-todo", "checkbox-click"],
    setup() {
      const todoItem = ref<HTMLElement | null>(null)
      const textInput = ref<HTMLInputElement | null>(null)
      const displayRef = ref<HTMLButtonElement | null>(null)
      const editable = ref(false)

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

      // Keep keyboard users where they were instead of dropping focus to <body>.
      const finishWithKeyboard = async () => {
        editable.value = false
        await nextTick()
        displayRef.value?.focus()
      }

      return { todoItem, textInput, displayRef, editable, finishWithKeyboard }
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
