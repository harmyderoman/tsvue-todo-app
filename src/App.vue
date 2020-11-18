<template>
  <div id="app">
    <div class="nav-wrapper position-relative">
      <ul class="nav nav-pills nav-fill flex-column flex-md-row">
        <li class="nav-item">
          <router-link
            class="nav-link mb-sm-3 mb-md-0"
            data-toggle="tab"
            to="/"
            active-class="active"
            exact
            >List Of Notes</router-link
          >
        </li>
        <li class="nav-item">
          <router-link
            class="nav-link mb-sm-3 mb-md-0"
            data-toggle="tab"
            to="/note"
            active-class="active"
            exact
            >Create Note</router-link
          >
        </li>
      </ul>
    </div>
    <nav>
      <router-link class="router-link" to="/" exact>List Of Notes</router-link>
      <router-link class="router-link" to="/note" exact
        >Create Note</router-link
      >
    </nav>
    <hr />
    <router-view />
  </div>
</template>

<script>
  export default {
    name: "App"
  }
</script>

<style>
  @import "./assets/css/neumorphism.css";
</style>
