<template>
  <div class="shop-create-form-page">
    <n-page-header title="创建新店铺" @back="handleCancel">
      <template #extra>
        <n-space>
          <n-button @click="handleCancel">取消</n-button>
          <n-button type="primary" @click="handleSave" :loading="isSaving">创建店铺</n-button>
        </n-space>
      </template>
    </n-page-header>
    <n-card class="form-card" :bordered="false">
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
              placeholder="请输入店铺简介"
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
              <template #checked>立即开业</template>
              <template #unchecked>暂不开业</template>
            </n-switch>
          </n-form-item-gi>
          <n-gi :span="2" /> <n-form-item-gi label="营业开始时间" path="openTimeStart">
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
          <n-gi :span="1" /> <n-form-item-gi label="配送费用 (元)" path="deliveryPrice">
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
    <n-modal v-model:show="showAddressSelector" preset="dialog" title="选择地址" style="width: 600px; max-width: 90vw;">
      <AddressSelector
        :latitude="formData.address.coordinate[1] ?? 0"
        :longitude="formData.address.coordinate[0] ?? 0"
        @select="onAddressSelected"
        @close="showAddressSelector = false"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
    NPageHeader, NSpace, NButton, NCard, NForm, NFormItemGi, NInput, NInputNumber,
    NSelect, NSwitch, NDivider, NTimePicker, NModal,
    NUpload, NUploadDragger, NIcon, NP, useMessage,
    type FormInst, type FormRules, type FormItemRule, type UploadFileInfo, type UploadCustomRequestOptions, type SelectOption
} from 'naive-ui'
import { CloudUploadOutline, LocateOutline } from '@vicons/ionicons5'
import { useGeolocation, type GeolocationError } from '@/composables/useGeolocation';
import { v4 as uuidv4 } from 'uuid'; // 用于生成模拟 ID
import { getShopCategories } from '@/api/shop';
import AddressSelector from '@/views/AddressSelector.vue'

// --- 数据模型定义 (与 ShopEditForm.vue 一致) ---
interface 地址 {
    address: string; city: string; coordinate: [number | null, number | null]; district: string;
    name: string; province: string; tel: string;
}
interface 店铺资料Creatable { // 用于创建，ID 由后端生成或在保存时生成
    name: string; description: string; avatarUrl?: string; opened: boolean;
    openTimeStart: number | null; openTimeEnd: number | null; deliveryPrice: number | null;
    deliveryThreshold: number | null; maximumDistance: number | null; categories: string[];
    address: 地址;
    // verified 在创建时通常默认为 false，由管理员后续审核
}

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const isSaving = ref(false)

// 初始化表单数据
const initialAddress: 地址 = {
    name: '', tel: '', province: '', city: '', district: '',
    address: '', coordinate: [null, null]
};
const formData = ref<店铺资料Creatable>({
    name: '', description: '', opened: true, avatarUrl: undefined,
    openTimeStart: null, openTimeEnd: null, deliveryPrice: 0,
    deliveryThreshold: 0, maximumDistance: 3.0, categories: [],
    address: { ...initialAddress }
});

// 头像上传
const avatarFileList = ref<UploadFileInfo[]>([])
const newAvatarFile = ref<File | null>(null)

// 营业时间 HH:mm 格式的 ref
const openTimeDisplay = ref<string | null>(null)
const closeTimeDisplay = ref<string | null>(null)

const categoryOptions = ref<SelectOption[]>([]);

const fetchCategories = async () => {
    try {
        const categories = await getShopCategories();
        categoryOptions.value.splice(0, categoryOptions.value.length, ...categories.map(c => ({ label: c.name, value: c.id })));
    } catch (err: any) {
        message.error('获取店铺分类失败');
    }
};

fetchCategories();

// --- 时间转换工具函数 (与 ShopEditForm.vue 一致) ---
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

// 修改watch和初始化营业时间显示
watch(openTimeDisplay, (newTime) => {
    formData.value.openTimeStart = hhMMToUtcMinutes(newTime);
});
watch(closeTimeDisplay, (newTime) => {
    formData.value.openTimeEnd = hhMMToUtcMinutes(newTime);
});

const formRules: FormRules = {
    name: [{ required: true, message: '请输入店铺名称', trigger: ['input', 'blur'] }],
    description: [{ required: true, message: '请输入店铺简介', trigger: ['input', 'blur'] }],
    openTimeStart: [{ type: 'number', required: true, message: '请选择营业开始时间', trigger: ['change', 'blur'] }],
    openTimeEnd: [
    { type: 'number', required: true, message: '请选择营业结束时间', trigger: ['change', 'blur'] },
    { validator: (_: FormItemRule, value: number | null) => {
        if (formData.value.openTimeStart !== null && value !== null && value <= formData.value.openTimeStart) {
            return new Error('结束时间必须晚于开始时间');
        }
        return true;
        }, trigger: ['change', 'blur']
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
        { validator: (_: FormItemRule, value: string) => /^1[3-9]\d{9}$/.test(value) || /^\d{3,4}-\d{7,8}$/.test(value), message: '请输入有效的手机或座机号码', trigger: ['input', 'blur'] }
    ],
    province: [{ required: true, message: '请输入省级行政区', trigger: 'blur' }],
    city: [{ required: true, message: '请输入地级行政区', trigger: 'blur' }],
    district: [{ required: true, message: '请输入县级行政区', trigger: 'blur' }],
    address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
    coordinate: [
        { type: 'array', required: true, validator: (_: FormItemRule, value: [number | null, number | null] | undefined) => {
            if (!value || value[0] === null || value[1] === null) return new Error('请输入经纬度');
            return true;
        }, trigger: ['input', 'blur'] },
    ]
    }
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
      // Geolocation API 返回的是 coords.longitude 和 coords.latitude
      formData.value.address.coordinate = [
        parseFloat(coords.longitude.toFixed(6)), // 保留6位小数
        parseFloat(coords.latitude.toFixed(6))
      ];
      message.success(`定位成功：经度 ${coords.longitude.toFixed(6)}, 纬度 ${coords.latitude.toFixed(6)}`);
      geolocationError.value = null; // 清除旧的错误信息
    }
  } catch (err) {
    // geolocationError ref 已经在 composable 内部被设置了
    // message.error(`定位失败: ${(err as GeolocationError).message}`); // composable 会设置 error.value
    console.error("Geolocation error from component:", err);
    // 可以在此处理特定于组件的错误反馈，如果 composable 中的错误处理不够的话
  }
};


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
    formData.value.avatarUrl = undefined;
    avatarFileList.value = [];
    message.info('头像已移除');
    return true;
};

const handleSave = (e: MouseEvent) => {
    e.preventDefault();
    // 价格元转分
    const deliveryPriceFen = Math.round((formData.value.deliveryPrice ?? 0) * 100);
    const deliveryThresholdFen = Math.round((formData.value.deliveryThreshold ?? 0) * 100);
    // 营业时间已为UTC分钟数
    formRef.value?.validate(async (errors) => {
    if (!errors) {
        isSaving.value = true;
        try {
            const { createShop, updateShopImages } = await import('@/api/shop');
            const address = {
                ...formData.value.address,
                id: '',
                isDefault: false,
                coordinate: [
                    formData.value.address.coordinate[0] ?? 0,
                    formData.value.address.coordinate[1] ?? 0
                ]
            };
            const shopProfile = {
                ...formData.value,
                openTimeStart: formData.value.openTimeStart ?? 0,
                openTimeEnd: formData.value.openTimeEnd ?? 0,
                deliveryPrice: deliveryPriceFen,
                deliveryThreshold: deliveryThresholdFen,
                maximumDistance: formData.value.maximumDistance ?? 0,
                address
            };
            const createdShop = await createShop(shopProfile);
            if (newAvatarFile.value) {
                await updateShopImages(createdShop.id, { cover: newAvatarFile.value });
            }
            isSaving.value = false;
            message.success(`店铺 “${createdShop.name}” 创建成功！`);
            router.push(`/merchant/shops/${createdShop.id}/detail`);
        } catch (err: any) {
            isSaving.value = false;
            message.error(err?.response?.data?.message || '创建店铺失败，请稍后重试');
        }
    } else {
        message.error('请检查表单输入项！');
    }
    });
};

const handleCancel = () => {
    router.push('/merchant/shops'); // 取消则返回店铺列表
};

const showAddressSelector = ref(false)

async function openAddressSelector() {
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
  formData.value.address.province = province
  formData.value.address.city = city
  formData.value.address.district = district
  formData.value.address.address = address
  formData.value.address.coordinate = [longitude, latitude]
  showAddressSelector.value = false
}
</script>

<style scoped>
.shop-create-form-page {
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
</style>