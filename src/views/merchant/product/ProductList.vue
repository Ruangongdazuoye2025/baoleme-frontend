<template>
    <n-card :title="shopId ? '店铺商品管理' : '商品管理'">
    <n-space vertical :size="12">
        <n-button type="primary" @click="goToCreateProductPage" v-if="shopId">
        添加新商品
        </n-button>

        <infinite-scroll-list
        :items="productList"
        :load-more="loadMoreProducts"
        :has-more="hasMoreProducts"
        :is-loading="loading"
        item-key="id"
        :threshold="200"
        >
        <template #item="{ item }">
            <n-card class="product-card" hoverable>
                <div style="display: flex; align-items: flex-start;">
                    <div style="flex: none; margin-right: 16px;">
                        <n-image
                            v-if="item.cover?.origin"
                            width="100"
                            height="100"
                            :src="item.cover.thumbnail || item.cover.origin"
                            :alt="item.name"
                            object-fit="cover"
                            style="display: block; border-radius: 8px; background: #f5f5f5;"
                        />
                        <div v-else style="width: 100px; height: 100px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 12px;">无封面</div>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <n-h3 style="margin-top: 0; margin-bottom: 8px;">{{ item.name }}</n-h3>
                        <n-p>价格: ¥{{ (item.price / 100).toFixed(2) }}</n-p>
                        <n-p>销量: {{ item.sale }} | 评分: {{ (item.rating / 10).toFixed(1) }}</n-p>
                        <n-space align="center" style="margin-bottom: 10px;">
                            <span>上架:</span>
                            <n-switch
                                :value="item.available"
                                @update:value="(value) => handleAvailabilityChange(item, value)"
                                :loading="item.updatingStatus"
                            />
                        </n-space>
                        <n-p :type="item.stockout ? 'error' : 'success'">
                            {{ item.stockout ? '缺货' : '有货' }}
                        </n-p>
                        <n-space justify="end">
                            <n-button size="small" type="info" ghost @click="goToDetail(item.id)">详情</n-button>
                            <n-button size="small" type="primary" ghost @click="goToEdit(item.id)">编辑</n-button>
                            <n-button size="small" type="error" ghost @click="handleDelete(item.id)">删除</n-button>
                        </n-space>
                    </div>
                </div>
            </n-card>
        </template>

        <template #loading>
            <div style="display: flex; justify-content: center; padding: 20px;">
            <n-spin size="medium" />
            <span style="margin-left: 8px;">加载中...</span>
            </div>
        </template>

        <template #noMore>
            <div style="text-align: center; padding: 20px; color: #aaa;">没有更多商品了</div>
        </template>

        <template #empty>
            <n-empty description="该店铺暂无商品" style="margin-top: 20px;"></n-empty>
        </template>
        </infinite-scroll-list>
    </n-space>
    </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NButton, NSpace, NCard, useMessage, NImage, NSwitch, NH3, NP, NSpin, NEmpty } from 'naive-ui';
import InfiniteScrollList from '@/components/common/InfiniteScrollList.vue'; // 引入无限滚动组件
import { getShopAllProducts, deleteProduct, updateProductProfile } from '@/api/product';
import type { ProductData, ProductProfileData } from '@/types/product';

interface ProductDataWithStatus extends ProductData {
    updatingStatus?: boolean; // 用于标记单个商品上下架状态更新中
}

const router = useRouter();
const route = useRoute();
const message = useMessage();

const shopId = ref<string | null>(null);
const productList = ref<ProductDataWithStatus[]>([]);
const loading = ref(false); // 控制初次加载和后续加载更多的整体状态
const hasMoreProducts = ref(true);
const currentPage = ref(0);
const pageSize = 10; // 每次加载的数量

shopId.value = route.params.shopId as string;

const loadMoreProducts = async () => {
    if (!shopId.value || loading.value || !hasMoreProducts.value) return;

    loading.value = true;
    try {
    const params = { p: currentPage.value, pn: pageSize };
    const newProducts = await getShopAllProducts(shopId.value, params);

    if (newProducts && newProducts.length > 0) {
        productList.value.push(...newProducts.map(p => ({...p, updatingStatus: false })));
        currentPage.value++;
        if (newProducts.length < pageSize) {
        hasMoreProducts.value = false; // 如果返回的商品数量少于请求数量，说明没有更多了
        }
    } else {
        hasMoreProducts.value = false; // 没有获取到新商品
    }
    } catch (error) {
    console.error('加载更多商品失败:', error);
    message.error('加载更多商品失败');
    hasMoreProducts.value = false
    // 可以考虑在失败时也设置 hasMoreProducts.value = false，避免无限重试
    // 或者提供一个重试按钮
    } finally {
    loading.value = false;
    }
};

onMounted(() => {
    if (shopId.value) {
    // 初始化加载第一页数据
    productList.value = []; // 清空列表，确保从第一页开始
    currentPage.value = 0;
    hasMoreProducts.value = true;
    // loadMoreProducts(); // InfiniteScrollList 首次挂载且哨兵可见时会自动调用 loadMore
    } else {
    message.error('店铺ID无效');
    hasMoreProducts.value = false;
    }
});

const goToCreateProductPage = () => {
    if (shopId.value) {
    router.push({ name: 'MerchantProductCreate', params: { shopId: shopId.value } });
    }
};

const goToDetail = (productId: string) => {
    router.push({ name: 'MerchantProductDetail', params: { productId } });
};

const goToEdit = (productId: string) => {
    router.push({ name: 'MerchantProductEdit', params: { productId } });
};

const handleDelete = async (productId: string) => {
    try {
    await deleteProduct(productId);
    message.success('商品删除成功');
    // 从列表中移除已删除的商品
    productList.value = productList.value.filter(p => p.id !== productId);
    // 如果删除后列表为空且曾有更多数据，可以尝试重新触发一次加载，以防最后一页被删空
    if (productList.value.length === 0 && hasMoreProducts.value) {
        // currentPage.value = 1; // 重置页码或根据情况调整
        // loadMoreProducts();
    }
    // 如果因为删除导致当前页数据不足，且还有更多数据，IntersectionObserver应该会自动触发下一次加载
    } catch (error) {
    console.error('删除商品失败:', error);
    message.error('删除商品失败');
    }
};

const handleAvailabilityChange = async (product: ProductDataWithStatus, available: boolean) => {
    product.updatingStatus = true;
    try {
    const updatedProfile: Partial<ProductProfileData> = { available };
    await updateProductProfile(product.id, updatedProfile);
    message.success(`商品 ${available ? '上架' : '下架'} 成功`);
    product.available = available; // Optimistic update
    } catch (error) {
    message.error('更新商品状态失败');
    // 状态回滚可以在这里处理，或者提示用户手动刷新
    } finally {
    product.updatingStatus = false;
    }
};

</script>

<style scoped>
.product-card {
    margin-bottom: 16px; /* 为了在列表中有间距 */
    /* 你可以根据需要调整卡片样式 */
}
.product-card:last-child {
margin-bottom: 0;
}
</style>