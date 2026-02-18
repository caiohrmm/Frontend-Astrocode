<template>
  <v-app>
    <v-main>
      <v-container
        fluid
        class="auth-layout-container fill-height"
      >
        <div class="auth-layout-inner">
          <router-view />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// AuthLayout component
</script>

<style scoped>
.auth-layout-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.auth-layout-inner {
  width: 100%;
  max-width: 450px;
  min-width: 0; /* evita overflow em flex */
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>


