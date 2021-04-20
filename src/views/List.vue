<template>
  <h2>List of Notes</h2>
  <hr />
  <div
    class="card bg-primary border-light shadow-soft mb-4"
    v-for="note in notes"
    :key="note.id"
  >
    <div class="card-body">
      <h2>{{ note.title }}</h2>
      <ul>
        <li
          :class="{ completed: todo.completed }"
          v-for="(todo, index) in note.todos"
          :key="index"
        >
          {{ todo.text }}
        </li>
      </ul>
      <button
        class="btn btn-sm btn-primary mr-3"
        @click="$router.push(`/note/${note.id}`)"
      >
        Go to note
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    computed: {
      notes() {
        return this.$store.state.notes
      }
    }
  }
</script>

<style>
  .completed {
    text-decoration: line-through;
  }
</style>
