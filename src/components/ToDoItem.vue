<template>
  <li>
    <div class="todo-body">
      <input v-model="checked" type="checkbox" />
    </div>
    <div>
      <span
        :class="{ completed: todo.completed && todo.text }"
        v-if="!editable"
        @click="editable = !editable"
      >
        {{ todo.text ? todo.text : "Click to edit Todo" }}
      </span>
      <input
        v-else
        type="text"
        :value="todo.text"
        @input="onTextChange"
        v-on:keyup.enter="editable = !editable"
      />
    </div>

    <div class="todo-actions">
      <button @click="editable = !editable">
        {{ editable ? "Save" : "Edit" }}
      </button>
      <button @click="$emit('remove-todo', todo)">Delete</button>
    </div>
  </li>
</template>

<script lang="ts">
  import { defineComponent, PropType } from "vue"
  import ToDo from "@/models/ToDoModel"

  export default defineComponent({
    name: "TodoItem",
    props: {
      todo: {
        type: Object as PropType<ToDo>,
        required: true
      }
    },
    data() {
      return {
        editable: false
      }
    },
    methods: {
      // setEditFalse() {
      //   this.editable = false
      // },
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
  }
  li {
    display: flex;
    flex-wrap: nowrap;
    background-color: #e2e2e2;
    height: 36px;
    margin: 5px 0px;
    padding-top: 5px;
    padding-left: 10px;
    padding-right: 15px;
    border-radius: 5px;
  }
  .completed {
    text-decoration: line-through;
  }
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin-right: 20px;
  }
  input[type="text"] {
    width: auto;
    max-width: 180px;
    height: 25px;
    padding: 4px 10px;
    border: none;
    border-radius: 5px;
    font-family: cursive, sans-serif;
    color: #8a8a8a;
  }
  div {
    display: flex;
    justify-content: flex-start;
  }
  .todo-actions {
    flex-grow: 1;
    display: flex;
    justify-content: flex-end;
  }
  @media screen and (max-width: 375px) {
    input[type="text"] {
      max-width: 150px;
    }
  }
</style>
