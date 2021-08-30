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
  </div>
</template>

<script>
  export default {
    name: "App"
  }
</script>

<style>
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

  .router-link-exact-active {
    cursor: auto !important;
  }
</style>
