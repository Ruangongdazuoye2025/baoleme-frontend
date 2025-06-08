<template>
  <div class="address-select-container">
    <div class="top-bar">
      <n-button type="primary" block @click="goToCreate">创建新地址</n-button>
    </div>
    <n-list hoverable clickable>
      <draggable v-model="addressList" item-key="id" @end="onDragEnd">
        <template #item="{ element: address }">
          <n-list-item :key="address.id" class="address-card" @click="goToEdit(address.id)">
            <n-thing>
              <template #header>
                <div class="address-title">
                  <n-radio :checked="addressId === address.id" @click.stop="selectAddress(address.id)" />
                  <span>{{ formatAddress(address) }}</span>
                  <n-tag v-if="address.isDefault" type="success" size="small" style="margin-left: 8px;">默认</n-tag>
                </div>
              </template>
              <template #description>
                <div class="address-info">
                  <span>{{ address.name }}</span>
                  <span style="margin-left: 16px;">{{ address.tel }}</span>
                </div>
              </template>
            </n-thing>
          </n-list-item>
        </template>
      </draggable>
    </n-list>
  </div>
</template>

<script setup lang="ts">
// 用 defineModel 替换 defineProps/defineEmits，支持 v-model:addressId
import { ref, onMounted, defineModel } from 'vue'
import { NButton, NList, NListItem, NThing, NTag, NRadio, useMessage } from 'naive-ui'
import draggable from 'vuedraggable'
import { getAddresses, moveAddress } from '@/api/address'
import type { Address } from '@/types/address'
import { useRouter } from 'vue-router'

const addressId = defineModel<string | null>('addressId', { default: null })
const message = useMessage()
const router = useRouter()
const addressList = ref<Address[]>([])

const loadAddresses = async () => {
  try {
    addressList.value = await getAddresses()
  } catch (e) {
    message.error('加载地址失败')
  }
}

onMounted(loadAddresses)

// 只保留 defineModel 绑定和 selectAddress 赋值
const selectAddress = (id: string) => {
  addressId.value = id
}

const goToCreate = () => {
  router.push('/address/new')
}

const goToEdit = (id: string) => {
  router.push(`/address/${id}/edit`)
}

const formatAddress = (address: Address) => {
  return `${address.province}${address.city}${address.district}${address.address}`
}

const onDragEnd = async (evt: any) => {
  // 拖动后调用API调整顺序
  const moved = addressList.value[evt.newIndex]
  const before = evt.newIndex === 0 ? null : addressList.value[evt.newIndex - 1].id
  try {
    await moveAddress(moved.id, before)
    message.success('地址顺序已更新')
  } catch {
    message.error('更新顺序失败')
    loadAddresses()
  }
}
</script>

<style scoped>
.address-select-container {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}
.top-bar {
  margin-bottom: 16px;
}
.address-card {
  margin-bottom: 12px;
  cursor: pointer;
}
.address-title {
  display: flex;
  align-items: center;
}
.address-info {
  color: #888;
  font-size: 14px;
}
</style>
