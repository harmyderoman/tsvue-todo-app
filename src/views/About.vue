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
        <h2>Design</h2>
        <p>
          The interface is made of liquid glass: translucent panes floating over an embossed backdrop. Nothing is a
          flat fill. Depth comes from blur, from light caught on the edges and from shadow.
        </p>
        <ul class="about__points">
          <li>
            <strong>One light source.</strong>
            Light enters every surface at the top left and leaves at the bottom right, so rims, highlights and shadows
            agree across the page.
          </li>
          <li>
            <strong>Glass that behaves like glass.</strong>
            The lens on the theme switch bends whatever passes under it, buttons are tinted glass that lets the page
            show through, and the logo ripples like water when you press it.
          </li>
          <li>
            <strong>Two themes, one palette.</strong>
            Dark and light use the same colours: lagoon for actions, blue for sharing, rose for deleting and slate for
            everything secondary.
          </li>
          <li>
            <strong>Motion you can switch off.</strong>
            Animations are short and springy, and they stay still when your system asks for reduced motion.
          </li>
        </ul>
        <p class="about__aside">
          Set in Bricolage Grotesque and Instrument Sans. The theme switch is modelled on the
          <a :href="SWITCH_CONCEPT" target="_blank" rel="noopener noreferrer">Liquid Glass Switch</a> concept on
          Dribbble.
        </p>
      </section>

      <section>
        <h2>Author and source</h2>
        <p>
          Designed and built by
          <a :href="AUTHOR" target="_blank" rel="noopener noreferrer">Roman Harmyder</a>
          with Vue 3, TypeScript, Pinia and Vite. The code is open source under the MIT License.
        </p>
        <a class="btn btn--accent" :href="REPOSITORY" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </section>
    </article>
  </main>
</template>

<script setup lang="ts">
const AUTHOR = 'https://github.com/harmyderoman'
const REPOSITORY = 'https://github.com/harmyderoman/tsvue-todo-app'
const SWITCH_CONCEPT = 'https://dribbble.com/shots/26295473-Liquid-Glass-Switch'
</script>
