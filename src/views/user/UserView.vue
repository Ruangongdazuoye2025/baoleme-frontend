<script lang="ts" setup>
import { getUser } from '@/api/user'
import { useTokenStore } from '@/stores/token'
import {
  getDisplayUserName,
  getDisplayUserRole,
  type UserData,
  type UserProfile
} from '@/types/user'
import { AxiosError } from 'axios'
import {
  NCard,
  NFlex,
  NAvatar,
  NLayout,
  NLayoutSider,
  NList,
  NListItem,
  NButton,
  useMessage,
  NModal,
  NIcon,
  NEmpty,
  NSkeleton
} from 'naive-ui'
import AvatarUploader from './AvatarUploader.vue'
import ProfileEditor from './ProfileEditor.vue'
import EmailEditor from './EmailEditor.vue'
import { computed, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { HistoryOutlined, StarOutlined } from '@vicons/antd'

interface Props {
  userId: string
}
const props = defineProps<Props>()
const tokenStore = useTokenStore()
const emptyDescription = ref('')
const isError = computed(() => {
  return emptyDescription.value !== ''
})

const isCurrentUser = computed(() => {
  return props.userId === tokenStore.userId
})

let userData: Ref<UserData | null> = ref(null)
const message = useMessage()
const router = useRouter()

const displayData = computed(() => {
  if (!userData.value) {
    return {
      昵称: '',
      简介: '',
      身份: '',
      ID: '',
      邮箱: '',
      注册时间: ''
    }
  }
  return {
    昵称: getDisplayUserName(userData.value.name, userData.value.id),
    简介: userData.value.description,
    身份: getDisplayUserRole(userData.value.role),
    ID: userData.value.id,
    邮箱: userData.value.emailVisible ? userData.value.email : '未公开',
    注册时间:
      userData.value.createdAtVisible && userData.value.createdAt
        ? new Date(userData.value.createdAt).toLocaleDateString()
        : '未公开'
  }
})

getUser(props.userId)
  .then((data) => {
    userData.value = data
  })
  .catch((e) => {
    if (e instanceof AxiosError) {
      if (e.response?.status === 401) {
        message.error(`未登录`)
        router.push({ name: 'Login' })
      } else if (e.response?.status === 404) {
        message.error(`用户不存在`)
        emptyDescription.value = '用户不存在'
      } else {
        message.error(`获取用户信息失败 (${e.response?.data.message})`)
        emptyDescription.value = '获取用户信息失败'
      }
    }
  })

const showAvatarUploader = ref(false)
const showProfileEditor = ref(false)
const showEmailEditor = ref(false)

const handleAvatarClicked = () => {
  if (isCurrentUser.value || tokenStore.admin) {
    showAvatarUploader.value = true
  }
}
</script>
<template>
  <div id="user-view">
    <n-empty v-if="isError" :description="emptyDescription" />
    <n-flex v-if="!isError" id="card-container" style="width: 100%" vertical align="center">
      <h1 id="title">用户信息</h1>
      <n-card class="card" id="profile-card">
        <n-layout has-sider>
          <n-layout-sider :width="120">
            <n-flex vertical justify="center" style="width: 100%; height: 100%">
              <n-avatar
                :size="96"
                :src="userData?.avatar.thumbnail"
                fallback-src="/default-avatar.webp"
                @click="handleAvatarClicked"
              />
            </n-flex>
          </n-layout-sider>
          <n-list style="width: 100%">
            <n-list-item v-for="(value, key) in displayData" :key="key">
              <n-flex justify="space-between">
                <span>{{ key }}</span>
                <n-skeleton v-if="!userData" :width="200" text />
                <span v-if="userData" style="opacity: 0.8">{{ value }}</span>
              </n-flex>
            </n-list-item>
          </n-list>
        </n-layout>
        <n-flex justify="center">
          <n-button
            type="primary"
            v-if="isCurrentUser || tokenStore.admin"
            @click="showProfileEditor = true"
            >编辑资料</n-button
          >
          <n-button type="primary" v-if="isCurrentUser" @click="showEmailEditor = true"
            >修改邮箱</n-button
          >
        </n-flex>
      </n-card>
      <n-card class="card" v-if="isCurrentUser" id="action-card">
        <n-flex justify="center">
          <n-button @click="router.push({ name: 'CustomerRecords' })">
            <template #icon
              ><n-icon><history-outlined /></n-icon
            ></template>
            历史记录
          </n-button>
          <n-button @click="router.push({ name: 'CustomerFavorites' })">
            <template #icon
              ><n-icon><star-outlined /></n-icon
            ></template>
            收藏夹
          </n-button>
        </n-flex>
      </n-card>
      <n-modal v-model:show="showAvatarUploader">
        <avatar-uploader
          :user-id="props.userId"
          :image-src="userData?.avatar.origin"
          @finish="
            (originLink: string, thumbnailLink: string) => {
              if (!userData) return
              userData.avatar.origin = originLink
              userData.avatar.thumbnail = thumbnailLink
              showAvatarUploader = false
              message.success('修改成功')
            }
          "
        />
      </n-modal>
      <n-modal v-model:show="showProfileEditor">
        <profile-editor
          :user-id="props.userId"
          :user-data="userData ?? undefined"
          @finish="
            (profile: UserProfile) => {
              if (!userData) return
              tokenStore.setRole(profile.role)
              userData.name = profile.name
              userData.description = profile.description
              userData.role = profile.role
              userData.emailVisible = profile.emailVisible
              userData.createdAtVisible = profile.createdAtVisible
              showProfileEditor = false
              message.success('修改成功')
            }
          "
        />
      </n-modal>
      <n-modal v-model:show="showEmailEditor">
        <email-editor
          @finish="
            () => {
              showEmailEditor = false
              message.success('验证邮件已发送，请查看邮箱')
            }
          "
        />
      </n-modal>
    </n-flex>
  </div>
</template>

<style>
.card {
  width: 100%;
  max-width: 600px;
  margin: 8px;
}
#user-view {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>