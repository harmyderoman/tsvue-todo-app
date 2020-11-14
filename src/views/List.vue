<template>
  <h2>List of Notes</h2>
  <hr />
  <div v-for="note in notes" :key="note.id" :to="`/note/${note.id}`">
    <h2>{{ note.title }}</h2>
    <h3>{{ note.id }}</h3>
    <ul>
      <li
        :class="{ completed: todo.completed }"
        v-for="(todo, index) in note.todos"
        :key="index"
      >
        {{ todo.text }}
      </li>
    </ul>
    <button @click="$router.push(`/note/${note.id}`)">Go to note</button>
    <hr />
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
