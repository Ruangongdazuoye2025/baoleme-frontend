<template><div class="address-form-container">
    <div class="header">
      <n-button quaternary circle class="back-btn" @click="router.back()">
        <n-icon><arrow-left-outlined /></n-icon>
      </n-button>
      <h1 class="title">新建收货地址</h1>
    </div>

    <n-card class="form-card">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        :label-width="80"
        @keydown.enter="handleSubmit"
      >
        <n-form-item label="所在地区">
          <n-input-group>
            <n-input v-model:value="formData.address" readonly placeholder="请选择地址" />
            <n-button @click="showAddressSelector = true">
              <template #icon>
                <n-icon><environment-outlined /></n-icon>
              </template>选择位置
            </n-button>
          </n-input-group>
        </n-form-item>

        <n-form-item path="name" label="联系人">
          <n-input 
            v-model:value="formData.name" 
            placeholder="请输入姓名"
          />
        </n-form-item><n-form-item path="tel" label="手机号码">
          <n-input 
            v-model:value="formData.tel" 
            placeholder="请输入手机号码"
          />
        </n-form-item>

        <n-form-item label="默认">
          <n-switch v-model:value="formData.isDefault" />
        </n-form-item>

        <n-form-item>
          <n-button type="primary" block @click="handleSubmit" :loading="loading">
            保存
          </n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <n-modal
      v-model:show="showAddressSelector"
      preset="card"
      style="width: 90%; max-width: 600px"title="选择位置"
      :bordered="false"
      size="huge"
      :segmented="{ content: true, footer: true }"
    >
      <address-selector
        v-model:latitude="latitude"
        v-model:longitude="longitude"
        @select="handleAddressSelect"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { 
  NCard, 
  NForm, 
  NFormItem, 
  NInput, 
  NButton, 
  NIcon, 
  NInputGroup,
  NSwitch,
  NModal,
  useMessage,
  type FormInst, 
  type FormRules 
} from "naive-ui";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@vicons/antd";
import { addAddresses, getAddressDetail, updateAddress } from "@/api/address";
import type { AddressCreate } from "@/types/address";
import AddressSelector from "@/views/AddressSelector.vue";

const router = useRouter();
const message = useMessage();
const formRef = ref<FormInst | null>(null);
const loading = ref(false);
const showAddressSelector = ref(false);
const latitude = ref(39.90923);
const longitude = ref(116.397428);

// 表单数据
const formData = reactive<AddressCreate>({
  name: "",
  tel: "",
  province: "",
  city: "",
  district: "",
  address: "",
  isDefault: false,
  coordinate: []
});

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: "请输入联系人姓名", trigger: "blur" },
    { type: "string", max: 20, message: "姓名不能超过20个字符", trigger: "blur" }
  ],
  tel: [
    { required: true, message: "请输入手机号码", trigger: "blur" },
    { 
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: ["input", "blur"]
    }
  ],
  address: [{ required: true, message: "请选择地址", trigger: "blur" }],
};

// 处理地址选择
const handleAddressSelect = (province: string, city: string, district: string, address: string, lng: number, lat: number) => {
  formData.province = province;
  formData.city = city;
  formData.district = district;
  formData.address = `${province}${city}${district}${address}`;
  formData.coordinate = [lng, lat];
  showAddressSelector.value = false;
};

const route = useRoute()
const addressId = route.params.id as string | undefined

onMounted(async () => {
  if (addressId) {
    // 编辑模式，加载地址详情
    const detail = await getAddressDetail(addressId)
    Object.assign(formData, detail)
    // 兼容老数据
    if (!Array.isArray(formData.coordinate)) formData.coordinate = []
  }
})

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true;
      try {
        if (addressId) {
          await updateAddress(addressId, formData)
          message.success('修改收货地址成功')
        } else {
          const addressToSubmit = {
            ...formData,
            address: `${formData.address}`
          };
          await addAddresses(addressToSubmit);
          message.success('添加收货地址成功');
        }
        router.back();
      } catch (error: any) {
        console.error("保存地址时出错:", error);
        const errorMessage = error.response?.data?.message || "保存地址失败，请稍后再试";
        message.error(errorMessage);
      } finally {
        loading.value = false;
      }
    } else {
      console.log("表单验证失败", errors);
      message.error("请正确填写所有必填项");
    }
  });
};
</script>

<style scoped>
:root {
  --primary-bg-color: #f7f7f7;
  --card-bg-color: #fff;
  --primary-text-color: #333;
  --border-radius: 8px;
}

.address-form-container {
  padding: 20px;
  min-height: 100vh;
  background-color: var(--primary-bg-color);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  margin-right: 12px;
}

.title {
  font-size: 18px;
  font-weight:500;
  margin: 0;color: var(--primary-text-color);
}

.form-card {
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .address-form-container {
    padding: 10px;
  }

  .title {
    font-size: 16px;
  }
}
</style>