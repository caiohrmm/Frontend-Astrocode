<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" sm="8" md="6" lg="4">
            <router-view />
          </v-col>
        </v-row>
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


