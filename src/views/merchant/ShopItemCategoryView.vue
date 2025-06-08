<!-- 商品分类管理页面，支持增删改查和排序，集成 NaiveUI n-dynamic-input。
主要功能：
- 实时从后端获取分类列表
- 支持添加、删除、编辑、排序分类
- 保存时自动处理新增、删除、更新、排序
- 表单内联校验（空名称、重复名称）
- 适用于商家后台的分类管理 Tab
- 通过 shopId prop 支持灵活复用 -->

<template>
  <div class="shop-item-category-view">
    <n-card>
      <n-dynamic-input
        v-model:value="categoryList"
        :on-create="onCreate"
        :min="1"
        :max="20"
        :show-sort-button="true"
        :show-remove-button="true"
        :show-add-button="true"
        style="margin-bottom: 16px;"
      >
        <template #default="{ value, index }">
          <n-input v-model:value="value.name" placeholder="请输入分类名称" clearable />
          <div v-if="categoryErrors[index]" style="color: #d03050; font-size: 12px; margin-top: 2px;">
            {{ categoryErrors[index] }}
          </div>
        </template>
      </n-dynamic-input>
      <n-space>
        <n-button type="primary" :loading="saving" :disabled="categoryErrors.some(e => e)" @click="handleSave">保存分类</n-button>
        <n-button @click="fetchCategories" :loading="loading">刷新</n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NCard, NSpace, useMessage } from 'naive-ui';
import {
  getShopItemCategories,
  createShopItemCategory,
  updateShopItemCategory,
  deleteShopItemCategory,
  reorderShopItemCategory
} from '@/api/category';
import type { ItemCategory } from '@/types/category';

const props = defineProps<{ shopId?: string }>();
const route = useRoute();
const router = useRouter();
const message = useMessage();
const shopId = computed(() => props.shopId || (route.params.shopId as string));

const loading = ref(false);
const saving = ref(false);
// 用于 n-dynamic-input 的类型，兼容新建和已有
// 必须包含 id 字段，保证后端同步和顺序调整
// 并用 render-item 自定义渲染，避免 [object Object]
type EditableCategory = { name: string; id?: string };

const categoryList = ref<EditableCategory[]>([]);
const originalList = ref<EditableCategory[]>([]);
const categoryErrors = ref<string[]>([]);

const fetchCategories = async () => {
  if (!shopId.value) return;
  loading.value = true;
  try {
    const list = await getShopItemCategories(shopId.value);
    // categoryList 只存 name 字段，避免 n-dynamic-input 误用 id
    categoryList.value = list.map(cat => ({ name: cat.name }));
    // originalList 保留 id 以便保存时 diff
    originalList.value = list.map(cat => ({ name: cat.name, id: cat.id }));
  } catch (err) {
    message.error('获取分类失败');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCategories);
watch(() => props.shopId, (val) => { if (val) fetchCategories(); });

const onCreate = () => ({ id: '', name: '' });

const validateCategories = () => {
  const names = new Set<string>();
  categoryErrors.value = categoryList.value.map((cat, idx) => {
    if (!cat.name.trim()) return '分类名称不能为空';
    if (names.has(cat.name.trim())) return '分类名称重复';
    names.add(cat.name.trim());
    return '';
  });
  return !categoryErrors.value.some(e => e);
};

watch(categoryList, validateCategories, { deep: true });

const handleSave = async () => {
  if (!shopId.value) return;
  if (!validateCategories()) {
    message.error('请修正所有分类名称后再保存');
    return;
  }
  saving.value = true;
  try {
    // 1. 删除被移除的分类
    const removed = originalList.value.filter(
      orig => !categoryList.value.some(c => c.name === orig.name)
    );
    for (const cat of removed) {
      if (cat.id) await deleteShopItemCategory(shopId.value, cat.id);
    }
    // 2. 新增和更新
    for (let i = 0; i < categoryList.value.length; i++) {
      const cat = categoryList.value[i];
      const orig = originalList.value.find(o => o.name === cat.name);
      if (!cat.name.trim()) continue;
      if (!orig) {
        // 新增
        await createShopItemCategory(shopId.value, cat.name.trim());
      } else if (orig && orig.name !== cat.name) {
        // 名称变更
        await updateShopItemCategory(shopId.value, orig.id!, cat.name.trim());
      }
    }
    // 3. 顺序调整
    // 只要不是最后一个都传 before
    for (let i = 0; i < categoryList.value.length; i++) {
      const cat = categoryList.value[i];
      const orig = originalList.value.find(o => o.name === cat.name);
      if (orig && orig.id) {
        const before = i === categoryList.value.length - 1 ? null : (originalList.value.find(o => o.name === categoryList.value[i + 1].name)?.id || null);
        await reorderShopItemCategory(shopId.value, orig.id, before);
      }
    }
    await fetchCategories();
    message.success('分类保存成功');
  } catch (err) {
    message.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.shop-item-category-view {
  /* Remove max-width and centering for full width */
  padding: 24px 0;
}
</style>
