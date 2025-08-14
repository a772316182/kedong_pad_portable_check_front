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
  <!-- 1. 使用 class 来应用背景样式 -->
  <q-page class="page-background flex flex-center q-pa-md">
    <div class="login-form-container">
      <!-- 3. 增加一个标题，使其看起来更完整 -->
      <h4 class="text-primary text-center q-mb-md">国家电网管理系统登录</h4>

      <q-card flat class="login-card">
        <q-card-section>
          <q-input
            class="q-mb-md"
            v-model="username"
            label="用户名"
            placeholder="请输入用户名"
            outlined
            dark
          >
            <!-- 2. 为用户名输入框添加图标 -->
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="密码"
            placeholder="请输入密码"
            type="password"
            outlined
            dark
          >
            <!-- 2. 为密码输入框添加图标 -->
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <q-card-actions align="center" class="q-mt-md">
            <q-btn
              label="登录"
              color="primary"
              @click="login"
              style="width: 100%;"
              size="lg"
            />
          </q-card-actions>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
/* 应用于整个页面的背景 */
.page-background {
  /* 深色底色 */
  background-color: rgb(41, 42, 45);

  /* 使用 CSS Gradient 创建的微妙的斜向线条纹理 */
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.03) 1px,
    transparent 1px,
    transparent 20px
  );
}

/* 登录表单的容器，用于限制最大宽度 */
.login-form-container {
  width: 100%;
  max-width: 400px;
}

/* 针对标题 h4 增大字体 */
.login-form-container h4 {
  font-size: 2.2rem; /* 增大标题字体 */
  font-weight: 500;
}

/* 登录卡片的样式 */
.login-card {
  /* 卡片背景色 */
  background: rgba(79, 79, 79, 0.8);

  /* 毛玻璃效果，让背景模糊，突出卡片 */
  backdrop-filter: blur(5px);

  /* 内边距 */
  padding: 24px;

  /* 圆角 */
  border-radius: 8px;

  /* 增加一个细微的边框，让卡片轮廓更清晰 */
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/*
  【关键修改】
  使用 :deep() 穿透组件作用域，直接修改内部元素的样式
*/

/* 统一增大 q-input 内部所有文字（包括标签和输入内容）的字体 */
.login-card :deep(.q-field) {
  font-size: 1.1rem;
}

/* 增大 q-btn 内部文字的字体 */
.login-card :deep(.q-btn .q-btn__content) {
  font-size: 1.4rem;
  font-weight: bold;
}
</style>
