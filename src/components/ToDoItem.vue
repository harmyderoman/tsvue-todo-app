<template>
  <li
    ref="todoItem"
    class="card bg-primary border-light mt-3 p-2 pr-3 shadow-inset"
  >
    <div
      class="d-flex flex-row align-items-center w-100 justify-content-between"
    >
      <div class="d-flex flex-row align-items-center pl-2 pr-2 w-100">
        <input v-model="checked" type="checkbox" />

        <span
          :class="{ completed: todo.completed && todo.text }"
          v-if="!editable"
          @click="editable = !editable"
        >
          {{ todo.text ? todo.text : "Click to edit Todo" }}
        </span>
        <input
          class="form-control todo-text-input"
          v-else
          type="text"
          :value="todo.text"
          @input="onTextChange"
          @keyup.enter="editable = !editable"
        />
      </div>

      <div class="d-flex flex-row align-items-center pl-2 pr-2">
        <button
          class="btn btn-sm btn-primary"
          @click="editable = !editable"
          :class="{ 'text-info': editable }"
        >
          {{ editable ? "Save" : "Edit" }}
        </button>
        <button
          class="btn btn-sm btn-primary text-danger ml-2"
          @click="$emit('remove-todo', todo)"
        >
          Delete
        </button>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
  import { defineComponent, PropType, ref } from "vue"
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
    setup() {
      const todoItem = ref(null)
      const editable = ref(false)

      onClickOutside(todoItem, () => {
        if (editable.value) {
          editable.value = false
        }
      })

      return { todoItem, editable }
    },
    methods: {
      onTextChange(e: { target: { value: string } }) {
        this.$emit("update-todo", e.target.value)
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

<style>
  span {
    word-wrap: none;
    padding-left: 10px;
  }
  .completed {
    text-decoration: line-through;
  }
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  .todo-text-input {
    height: 32px !important;
    border: none !important;
    border-radius: 5px !important;
  }
  .todo-body {
    display: flex;
    align-items: center;
    padding-left: 15px;
  }
  .todo-actions {
    flex-grow: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  @media screen and (max-width: 768px) {
    li {
      padding-right: 0;
    }
    .todo-text-input {
      max-width: 300px;
    }
    input[type="checkbox"] {
      margin-right: 5px;
    }
    .todo-body {
      padding-left: 5px;
    }
  }
</style>
