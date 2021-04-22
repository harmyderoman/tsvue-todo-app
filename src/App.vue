<template>
  <div id="app">
    <div class="nav-wrapper position-relative">
      <ul class="nav nav-pills nav-fill flex-column flex-md-row">
        <li class="nav-item">
          <router-link
            class="nav-link mb-sm-3 mb-md-0"
            to="/"
            active-class="active"
            exact
            >List Of Notes</router-link
          >
        </li>
        <li class="nav-item">
          <router-link
            class="nav-link mb-sm-3 mb-md-0"
            to="/note"
            active-class="active"
            exact
            >Create Note</router-link
          >
        </li>
      </ul>
    </div>
    <hr />
    <router-view />
    <modal-window />
  </div>
</template>

<script>
  import ModalWindow from "./components/ModalWindow.vue"

  export default {
    components: { ModalWindow },
    name: "App"
  }
</script>

<style>
  @import "./assets/css/neumorphism.css";

  #app {
    padding: 5px 10px;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }
  @media screen and (max-width: 768px) {
    #app {
      padding: 0px 5px;
    }
  }
</style>
