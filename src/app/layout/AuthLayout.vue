<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height d-flex align-center justify-center">
        <div class="w-100" style="max-width: 450px;">
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
.fill-height {
  min-height: 100vh;
}
</style>


