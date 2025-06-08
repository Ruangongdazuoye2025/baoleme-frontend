<template>
  <div class="shop-edit-form-page">
    <n-page-header :title="pageTitle" @back="handleCancel">
      <template #extra>
        <n-space>
          <n-button @click="handleCancel">取消</n-button>
          <n-button type="primary" @click="handleSave" :loading="isSaving">保存更改</n-button>
        </n-space>
      </template>
    </n-page-header>
    <div v-if="isLoading" class="loading-container">
      <n-spin size="large" />
      <p>正在加载店铺数据...</p>
    </div>
    <n-card v-else-if="formData" class="form-card" :bordered="false">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="top"
        label-width="auto"
      >
        <n-grid :x-gap="24" :y-gap="16" cols="1 s:1 m:2 l:3" responsive="screen">
          <n-form-item-gi :span="3" label="店铺名称" path="name">
            <n-input v-model:value="formData.name" placeholder="请输入店铺名称" />
          </n-form-item-gi>

          <n-form-item-gi :span="3" label="店铺简介" path="description">
            <n-input
              v-model:value="formData.description"
              type="textarea"
              placeholder="请输入店铺简介（可选）"
              :autosize="{ minRows: 3, maxRows: 5 }"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="3" label="店铺头像（支持 PNG, JPG, GIF, WEBP 格式）" path="avatarFile">
            <n-upload
              v-model:file-list="avatarFileList"
              list-type="image-card"
              :max="1"
              accept="image/png, image/jpeg, image/gif, image/webp"
              :custom-request="handleCustomAvatarRequest"
              @change="handleAvatarChange"
              @remove="handleAvatarRemove"
            >
              <n-upload-dragger>
                <div style="margin-bottom: 12px">
                  <n-icon size="48" :depth="3" :component="CloudUploadOutline" />
                </div>
                <n-p depth="3" style="margin: 8px 0 0 0">
                </n-p>
              </n-upload-dragger>
            </n-upload>
          </n-form-item-gi>

          <n-form-item-gi label="开业状态" path="opened">
            <n-switch v-model:value="formData.opened">
              <template #checked>营业中</template>
              <template #unchecked>休息中</template>
            </n-switch>
          </n-form-item-gi>

          <n-form-item-gi label="认证状态 (管理员审核)" path="verified">
            <n-tag :type="formData.verified ? 'success' : 'warning'" round>
              {{ formData.verified ? '已认证' : '未认证' }}
            </n-tag>
          </n-form-item-gi>
          <n-gi :span="1" />

          <n-form-item-gi label="营业开始时间" path="openTimeStart">
            <n-time-picker
              v-model:formatted-value="openTimeDisplay"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="选择开始时间"
              style="width: 100%;"
            />
          </n-form-item-gi>

          <n-form-item-gi label="营业结束时间" path="openTimeEnd">
            <n-time-picker
              v-model:formatted-value="closeTimeDisplay"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="选择结束时间"
              style="width: 100%;"
            />
          </n-form-item-gi>
          <n-gi :span="1" />

          <n-form-item-gi label="配送费用 (元)" path="deliveryPrice">
            <n-input-number v-model:value="formData.deliveryPrice" :min="0" :precision="2" placeholder="例如: 5.00" style="width: 100%;" />
          </n-form-item-gi>

          <n-form-item-gi label="起送价格 (元)" path="deliveryThreshold">
            <n-input-number v-model:value="formData.deliveryThreshold" :min="0" :precision="2" placeholder="例如: 20.00" style="width: 100%;" />
          </n-form-item-gi>

          <n-form-item-gi label="最远配送距离 (公里)" path="maximumDistance">
            <n-input-number v-model:value="formData.maximumDistance" :min="0" :precision="1" placeholder="例如: 5.0" style="width: 100%;" />
          </n-form-item-gi>

          <n-form-item-gi :span="3" label="店铺类型" path="categories">
            <n-select
              v-model:value="formData.categories"
              multiple
              filterable
              tag
              placeholder="请选择或输入店铺类型"
              :options="categoryOptions"
              :max-tag-count="5"
            />
          </n-form-item-gi>
        </n-grid>

        <n-divider title-placement="left">店铺地址信息</n-divider>
        <n-grid :x-gap="24" :y-gap="16" cols="1 s:1 m:2 l:3" responsive="screen">
          <n-form-item-gi label="联系人姓名" path="address.name">
              <n-input v-model:value="formData.address.name" placeholder="请输入联系人姓名" />
          </n-form-item-gi>
          <n-form-item-gi label="联系人电话" path="address.tel">
              <n-input v-model:value="formData.address.tel" placeholder="请输入联系人电话" />
          </n-form-item-gi>
          <n-gi :span="1" />


          <n-form-item-gi label="省级行政区" path="address.province">
              <n-input v-model:value="formData.address.province" placeholder="例如：北京市" />
          </n-form-item-gi>
          <n-form-item-gi label="地级行政区" path="address.city">
              <n-input v-model:value="formData.address.city" placeholder="例如：北京市" />
          </n-form-item-gi>
          <n-form-item-gi label="县级行政区" path="address.district">
              <n-input v-model:value="formData.address.district" placeholder="例如：海淀区" />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="详细地址" path="address.address">
            <n-input v-model:value="formData.address.address" placeholder="请输入街道、楼牌号等" />
            <n-button size="small" style="margin-top: 8px" @click="openAddressSelector">选择地址</n-button>
          </n-form-item-gi>

          <n-form-item-gi label="经度 (通过定位获取)" path="address.coordinate.0">
              <n-input-number 
                v-model:value="formData.address.coordinate[0]" 
                :precision="6" 
                placeholder="请点击下方按钮获取" 
                style="width: 100%;" 
                disabled />
          </n-form-item-gi>
          <n-form-item-gi label="纬度 (通过定位获取)" path="address.coordinate.1">
              <n-input-number 
                v-model:value="formData.address.coordinate[1]" 
                :precision="6" 
                placeholder="请点击下方按钮获取" 
                style="width: 100%;" 
                disabled />
          </n-form-item-gi>
          <n-form-item-gi :span="3" style="display: flex; flex-direction: column; align-items: flex-start;">
               <n-button @click="fetchCurrentLocation" :loading="isLocating" type="default" :block="false" style="margin-bottom: 5px;">
                  <template #icon><n-icon :component="LocateOutline" /></template>
                  获取店铺当前经纬度
              </n-button>
              <n-text v-if="geolocationError" type="error" style="font-size: 12px;">
                  定位失败: {{ geolocationError.message }}
              </n-text>
              <n-text v-else-if="formData.address.coordinate[0] !== null && formData.address.coordinate[1] !== null" :depth="3" style="font-size: 12px;">
                  已获取坐标。如需更改，请重新定位。
              </n-text>
               <n-text v-else :depth="3" style="font-size: 12px;">
                  点击按钮获取店铺的精确地理位置。
              </n-text>
          </n-form-item-gi>
        </n-grid>

      </n-form>
    </n-card>
    <n-empty v-else description="无法加载店铺信息进行编辑" style="margin-top: 40px;" />
    <n-modal v-model:show="showAddressSelector" preset="dialog" title="选择地址" style="width: 600px; max-width: 90vw;">
      <AddressSelector
        :latitude="formData?.address.coordinate[1] ?? 0"
        :longitude="formData?.address.coordinate[0] ?? 0"
        @select="onAddressSelected"
        @close="showAddressSelector = false"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    NPageHeader, NSpace, NButton, NCard, NForm, NFormItemGi, NInput, NInputNumber,
    NSelect, NSpin, NEmpty, NGrid, NAvatar, NSwitch, NTag, NDivider, NTimePicker, // NTimePicker 添加
    NUpload, NUploadDragger, NIcon, NP, useMessage, NModal,
    type FormInst, type FormRules, type FormItemRule, type UploadFileInfo, type UploadCustomRequestOptions, type SelectOption
} from 'naive-ui'
import { CloudUploadOutline, LocateOutline } from '@vicons/ionicons5'
import { useGeolocation, type GeolocationError } from '@/composables/useGeolocation';
import { getShopCategories, updateShopProfile, updateShopImages, getShopInfo } from '@/api/shop';
import AddressSelector from '@/views/AddressSelector.vue'

// --- 数据模型定义 ---
interface 地址 {
    address: string;
    city: string;
    coordinate: [number | null, number | null]; // 允许 null 以便清空或未设置
    district: string;
    name: string;
    province: string;
    tel: string;
}

interface 店铺资料Editable {
    id: string;
    name: string;
    description: string;
    avatarUrl?: string;
    opened: boolean;
    openTimeStart: number | null;
    openTimeEnd: number | null;
    deliveryPrice: number | null;
    deliveryThreshold: number | null;
    maximumDistance: number | null;
    categories: string[];
    address: 地址;
    verified: boolean;
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)

const shopId = computed(() => route.params.shopId as string)
const formData = ref<店铺资料Editable | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)

// 头像上传
const avatarFileList = ref<UploadFileInfo[]>([])
const newAvatarFile = ref<File | null>(null)

// --- 营业时间 HH:mm 格式的 ref ---
const openTimeDisplay = ref<string | null>(null)
const closeTimeDisplay = ref<string | null>(null)

const pageTitle = computed(() => {
    if (isLoading.value) return '加载中...'
    return formData.value ? `编辑店铺 - ${formData.value.name}` : '编辑店铺信息'
})

const categoryOptions = ref<SelectOption[]>([]);

const fetchCategories = async () => {
    try {
        const categories = await getShopCategories();
        categoryOptions.value = categories.map(c => ({ label: c.name, value: c.id }));
    } catch (err: any) {
        message.error('获取店铺分类失败');
    }
};

const fetchShopData = async (id: string) => {
    isLoading.value = true;
    try {
        const data = await getShopInfo(id);
        // 分转元
        data.deliveryPrice = typeof data.deliveryPrice === 'number' ? +(data.deliveryPrice / 100).toFixed(2) : 0;
        data.deliveryThreshold = typeof data.deliveryThreshold === 'number' ? +(data.deliveryThreshold / 100).toFixed(2) : 0;
        formData.value = JSON.parse(JSON.stringify(data));
        if (formData.value) {
            openTimeDisplay.value = utcMinutesToHHMM(formData.value.openTimeStart);
            closeTimeDisplay.value = utcMinutesToHHMM(formData.value.openTimeEnd);
        }
        if (formData.value && formData.value.avatarUrl) {
            avatarFileList.value = [{
                id: 'current-avatar', name: '当前头像', status: 'finished', url: formData.value.avatarUrl,
            }];
        } else {
            avatarFileList.value = [];
        }
        newAvatarFile.value = null;
    } catch (err) {
        message.error('无法加载店铺信息');
        formData.value = null;
    }
    isLoading.value = false;
};

onMounted(() => {
    fetchCategories();
    if (shopId.value) {
        fetchShopData(shopId.value);
    } else {
        message.error('无效的店铺ID');
        router.replace('/merchant/shops');
    }
});

// 监听 HH:mm 字符串变化，同步更新 formData 中的分钟数
watch(openTimeDisplay, (newTime) => {
    if (formData.value) formData.value.openTimeStart = hhMMToUtcMinutes(newTime);
});
watch(closeTimeDisplay, (newTime) => {
    if (formData.value) formData.value.openTimeEnd = hhMMToUtcMinutes(newTime);
});


const formRules: FormRules = {
    name: [{ required: true, message: '请输入店铺名称', trigger: ['input', 'blur'] }],
    description: [{ required: true, message: '请输入店铺简介', trigger: ['input', 'blur'] }],
    openTimeStart: [ // 验证的是转换后的分钟数
    { type: 'number', required: true, message: '请选择营业开始时间', trigger: ['change', 'blur'] }
    ],
    openTimeEnd: [
    { type: 'number', required: true, message: '请选择营业结束时间', trigger: ['change', 'blur'] },
    { validator: (rule: FormItemRule, value: number) => { // value 是分钟数
        if (formData.value && formData.value.openTimeStart !== null && value !== null && value <= formData.value.openTimeStart) {
            return new Error('结束时间必须晚于开始时间');
        }
        return true;
        },
        trigger: ['change', 'blur'] // 当 openTimeStart 或 openTimeEnd 的分钟数变化时触发
    }
    ],
    deliveryPrice: [{ type: 'number', required: true, message: '请输入配送费用', trigger: ['input', 'blur'] }],
    deliveryThreshold: [{ type: 'number', required: true, message: '请输入起送价格', trigger: ['input', 'blur'] }],
    maximumDistance: [{ type: 'number', required: true, message: '请输入最远配送距离', trigger: ['input', 'blur'] }],
    categories: [{ type: 'array', required: true, min: 1, message: '请至少选择一个店铺类型', trigger: 'change' }],
    address: {
    name: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
    tel: [
        { required: true, message: '请输入联系人电话', trigger: 'blur' },
        { validator: (rule: FormItemRule, value: string) => /^1[3-9]\d{9}$/.test(value) || /^\d{3,4}-\d{7,8}$/.test(value), message: '请输入有效的手机或座机号码', trigger: ['input', 'blur'] }
    ],
    province: [{ required: true, message: '请输入省级行政区', trigger: 'blur' }],
    city: [{ required: true, message: '请输入地级行政区', trigger: 'blur' }],
    district: [{ required: true, message: '请输入县级行政区', trigger: 'blur' }],
    address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
    coordinate: [
        { type: 'array', required: true, validator: (rule: FormItemRule, value: [number | null, number | null]) => {
            if (value === null || value[0] === null || value[1] === null) return new Error('请输入经纬度');
            return true;
        }, trigger: ['input', 'blur'] },
    ]
    }
};

// --- 时间转换工具函数 ---
// 本地时间字符串转UTC分钟数
const hhMMToUtcMinutes = (timeStr: string | null): number | null => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    const now = new Date();
    now.setHours(h, m, 0, 0);
    // 得到本地当天的时间戳
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    // 得到UTC当天0点的时间戳
    const utc0 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0);
    // 得到UTC分钟数
    return Math.round((local.getTime() - utc0) / 60000);
};
// UTC分钟数转本地时间字符串
const utcMinutesToHHMM = (minutes: number | null): string | null => {
    if (minutes === null || minutes < 0 || minutes > 1439) return null;
    // UTC当天0点
    const utc0 = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0));
    // 加上分钟数
    const local = new Date(utc0.getTime() + minutes * 60000);
    const h = local.getHours();
    const m = local.getMinutes();
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
};

// ... handleCustomAvatarRequest, handleAvatarChange, handleAvatarRemove 保持不变 ...
const handleCustomAvatarRequest = ({ file, onFinish }: UploadCustomRequestOptions) => {
    console.log('自定义请求处理了文件:', file.name);
    onFinish();
};

const handleAvatarChange = (data: { file: UploadFileInfo, fileList: UploadFileInfo[] }) => {
    if (data.file.status === 'pending' && data.file.file) {
    newAvatarFile.value = data.file.file;
    message.info(`已选择新头像: ${data.file.name}`);
    }
    avatarFileList.value = data.fileList.slice(-1);
};

const handleAvatarRemove = () => {
    newAvatarFile.value = null;
    if (formData.value) formData.value.avatarUrl = undefined;
    avatarFileList.value = [];
    message.info('头像已移除');
    return true;
};

const {
  coordinates: currentLocation,
  error: geolocationError,
  isLocating,
  getCurrentLocation
} = useGeolocation();

const fetchCurrentLocation = async () => {
  try {
    // 请求高精度定位，超时时间10秒
    const coords = await getCurrentLocation({ enableHighAccuracy: true, timeout: 10000 });
    if (formData.value && formData.value.address) {
      formData.value.address.coordinate = [
        parseFloat(coords.longitude.toFixed(6)),
        parseFloat(coords.latitude.toFixed(6))
      ];
      message.success(`定位成功：经度 ${coords.longitude.toFixed(6)}, 纬度 ${coords.latitude.toFixed(6)}`);
      geolocationError.value = null;
    }
  } catch (err) {
    // geolocationError ref 已经在 composable 内部被设置了
    // message.error(`定位失败: ${(err as GeolocationError).message}`);
    console.error("Geolocation error from component:", err);
  }
};

const handleSave = (e: MouseEvent) => {
    e.preventDefault();
    if (formData.value) {
        // 价格元转分
        const deliveryPriceFen = Math.round((formData.value.deliveryPrice ?? 0) * 100);
        const deliveryThresholdFen = Math.round((formData.value.deliveryThreshold ?? 0) * 100);
        // 营业时间已为UTC分钟数
        formData.value.openTimeStart = hhMMToUtcMinutes(openTimeDisplay.value);
        formData.value.openTimeEnd = hhMMToUtcMinutes(closeTimeDisplay.value);
        formRef.value?.validate(async (errors) => {
            if (!errors && formData.value) {
                isSaving.value = true;
                try {
                    const address = {
                        ...formData.value.address,
                        coordinate: [
                            formData.value.address.coordinate[0] ?? 0,
                            formData.value.address.coordinate[1] ?? 0
                        ]
                    };
                    const profile = {
                        name: formData.value.name,
                        description: formData.value.description,
                        opened: formData.value.opened,
                        verified: formData.value.verified,
                        openTimeStart: formData.value.openTimeStart ?? 0,
                        openTimeEnd: formData.value.openTimeEnd ?? 0,
                        deliveryPrice: deliveryPriceFen,
                        deliveryThreshold: deliveryThresholdFen,
                        maximumDistance: formData.value.maximumDistance ?? 0,
                        address,
                        categories: formData.value.categories
                    };
                    await updateShopProfile(formData.value.id, profile);
                    if (newAvatarFile.value) {
                        await updateShopImages(formData.value.id, { cover: newAvatarFile.value });
                    }
                    isSaving.value = false;
                    message.success('店铺信息保存成功！');
                    router.push(`/merchant/shops/${shopId.value}/detail`);
                } catch (err: any) {
                    isSaving.value = false;
                    message.error(err?.response?.data?.message || '保存失败，请稍后重试');
                }
            } else {
                message.error('请检查表单输入项！');
            }
        });
    }
};

const handleCancel = () => {
    router.back();
};

const showAddressSelector = ref(false)

async function openAddressSelector() {
  if (!formData.value) return;
  if (formData.value.address.coordinate[0] == null || formData.value.address.coordinate[1] == null) {
    try {
      const coords = await getCurrentLocation({ enableHighAccuracy: true, timeout: 10000 });
      formData.value.address.coordinate = [
        parseFloat(coords.longitude.toFixed(6)),
        parseFloat(coords.latitude.toFixed(6))
      ];
    } catch (err) {
      // 定位失败不阻断弹窗
    }
  }
  showAddressSelector.value = true;
}

function onAddressSelected(province: string, city: string, district: string, address: string, longitude: number, latitude: number) {
  if (!formData.value) return
  formData.value.address.province = province
  formData.value.address.city = city
  formData.value.address.district = district
  formData.value.address.address = address
  formData.value.address.coordinate = [longitude, latitude]
  showAddressSelector.value = false
}
</script>

<style scoped>
.shop-edit-form-page {
    padding: 16px;
    background-color: #f8f8f8;
}
.n-page-header {
    background-color: #fff;
    padding: 16px 24px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
.form-card {
    padding: 24px;
    border-radius: 8px;
}
.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    color: var(--text-color2);
}
.loading-container p {
    margin-top: 10px;
}
</style>