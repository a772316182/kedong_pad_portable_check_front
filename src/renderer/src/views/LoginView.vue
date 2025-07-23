<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')

const login = () => {
  console.log(username.value, password.value)
  router.push('/mainview')
}
</script>

<template>
  <q-page class="q-pa-md">
    <q-card flat>
      <q-card-section>
        <q-input v-model="username" label="用户名" placeholder="请输入用户名" outlined />
        <q-input
          v-model="password"
          label="密码"
          placeholder="请输入密码"
          type="password"
          outlined
        />
        <q-card-actions align="center">
          <q-btn label="登录" color="primary" @click="login" />
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped></style>
