<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const executeCheck = () => {
  router.push('/executeCheck')
}
const manageCheck = () => {
  router.push('/manageCheck')
}
const manageStrategy = () => {
  router.push('/manageStrategy')
}
</script>

<template>
  <q-page class="q-pa-md">
    <q-btn @click="executeCheck">执行核查</q-btn>
    <q-btn @click="manageCheck">核查管理</q-btn>
    <q-btn @click="manageStrategy">策略管理</q-btn>
  </q-page>
</template>

<style scoped></style>
