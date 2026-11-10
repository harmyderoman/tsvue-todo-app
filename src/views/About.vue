<template>
  <main class="about">
    <header class="page-head">
      <h1>About</h1>
    </header>

    <article class="about__card glass">
      <p class="about__lede">
        Todo App keeps notes with todo lists. It runs entirely in your browser: there is no account to create and no
        server behind it.
      </p>

      <section>
        <h2>Your notes stay on this device</h2>
        <p>
          Notes are saved in this browser's local storage and nowhere else. The app never uploads them: they leave this
          device only when you share them yourself.
        </p>
        <p>
          The other side of that: notes don't sync between browsers or devices, and clearing this site's data in the
          browser deletes them for good.
        </p>
      </section>

      <section>
        <h2>Shared links carry the note itself</h2>
        <p>
          Share turns a note into a link with the title and todos packed inside it. The note isn't uploaded or stored
          on a server: the link is the note.
        </p>
        <ul class="about__points">
          <li>
            <strong>Anyone with the link can read the note.</strong>
            It is encoded, not encrypted, so send it only to people you'd show the note to.
          </li>
          <li>
            <strong>A link is a snapshot.</strong>
            Changes you make afterwards aren't in it. Share again to send the new version.
          </li>
          <li>
            <strong>Opening a link saves nothing.</strong>
            If the person you sent it to edits the note, they get their own copy on their device. Yours doesn't change.
          </li>
        </ul>
        <p class="about__aside">
          Like any web address, the link can be seen by the services it travels through: the messenger you send it in,
          and the web host when someone opens it.
        </p>
      </section>

      <section>
        <h2>Open source</h2>
        <p>Built with Vue 3, TypeScript, Pinia and Vite. The source code is on GitHub.</p>
        <a class="btn btn--accent" :href="REPOSITORY" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </section>
    </article>
  </main>
</template>

<script setup lang="ts">
const REPOSITORY = 'https://github.com/harmyderoman/tsvue-todo-app'
</script>
