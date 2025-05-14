<template>
  <div id="app">
    <header-nav />
    <div class="main-container">
      <router-view />
    </div>
    <footer-bar />
  </div>
</template>

<script>
import HeaderNav from '@/components/layout/HeaderNav.vue'
import FooterBar from '@/components/layout/FooterBar.vue'

export default {
  name: 'App',
  components: {
    HeaderNav,
    FooterBar
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f7f8fa;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.text-center {
  text-align: center;
}

.mt-20 {
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.container {
  padding: 20px;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>