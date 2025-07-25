<script setup>
// const ipcHandle = () => window.electron.ipcRenderer.send('ping')
function refreshEverything() {
  window.location.reload()
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="80">

    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="refresh" color="accent" @click="refreshEverything" />
    </q-page-sticky>
  </q-layout>
</template>
