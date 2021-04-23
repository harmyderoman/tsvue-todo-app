<template>
  <li ref="textInput" class="card bg-primary border-light shadow-soft">
    <div class="todo-body">
      <input v-model="checked" type="checkbox" />

      <span
        :class="{ completed: todo.completed && todo.text }"
        v-if="!editable"
        @click="editable = !editable"
      >
        {{ todo.text ? todo.text : "Click to edit Todo" }}
      </span>
      <input
        class="form-control"
        v-else
        type="text"
        :value="todo.text"
        @input="onTextChange"
        v-on:keyup.enter="editable = !editable"
      />
    </div>

    <div class="todo-actions">
      <button
        class="btn btn-sm btn-primary  mr-3"
        @click="editable = !editable"
        :class="{ 'text-info': editable }"
      >
        {{ editable ? "Save" : "Edit" }}
      </button>
      <button
        class="btn btn-sm btn-primary text-danger mr-3"
        @click="$emit('remove-todo', todo)"
      >
        Delete
      </button>
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
      const textInput = ref(null)
      const editable = ref(false)

      onClickOutside(textInput, () => {
        editable.value = false
      })

      return { textInput, editable }
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

<style scoped>
  span {
    word-wrap: none;
    padding-left: 10px;
  }
  li {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    padding-top: 0px;
    padding-left: 10px;
    padding-right: 15px;
    height: 60px;
    margin: 10px 0px;
    /**background-color: #e2e2e2;
    border-radius: 5px;*/
  }
  .completed {
    text-decoration: line-through;
  }
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  input[type="text"] {
    width: auto;
    max-width: 300px;
    height: 30px;
    padding: 0px 10px;
    border: none;
    border-radius: 5px;
    /**font-family: cursive, sans-serif;
    color: #8a8a8a;*/
  }
  div {
    display: flex;
    justify-content: flex-start;
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
    input[type="text"] {
      max-width: 150px;
    }
    input[type="text"] {
      max-width: 150px;
    }
    input[type="checkbox"] {
      margin-right: 5px;
    }
    .todo-body {
      padding-left: 5px;
    }
  }
</style>
