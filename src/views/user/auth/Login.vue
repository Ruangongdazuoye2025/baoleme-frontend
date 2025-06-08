<!-- src/views/customer/auth/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-header">
      <!-- 后续替换logo？ -->
      <!-- <img src="@/assets/logo.png" alt="饱了么" class="logo"> -->
      <h1 class="title">饱了么</h1>
      <p class="slogan">让校园生活更便捷</p>
    </div>
    
    <n-card class="login-card">
      <n-tabs type="line" animated>
        <n-tab-pane name="login" tab="登录">
          <n-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-placement="left"
            @keydown.enter="handleLogin"
          >
            <n-form-item path="email" label="邮箱">
              <n-input 
                v-model:value="loginForm.email" 
                placeholder="请输入邮箱"
              >
                <template #prefix>
                  <n-icon><mail-outlined /></n-icon>
                </template>
              </n-input>
            </n-form-item>
            
            <n-form-item path="password" label="密码">
              <n-input 
                v-model:value="loginForm.password" 
                type="password" 
                placeholder="请输入密码"
                show-password-on="click"
              >
                <template #prefix>
                  <n-icon><lock-outlined /></n-icon>
                </template>
              </n-input>
            </n-form-item>
            
            <div class="action-area">
              <n-checkbox v-model:checked="rememberMe">
                记住密码
              </n-checkbox>
              <n-button text class="forgot-btn" @click="router.push('/forgot-password')">
                忘记密码
              </n-button>
            </div>
            
            <!-- 后续：登录接口 -->
            <n-button 
              type="primary" 
              block 
              @click="handleLogin"
              :loading="loading"
              class="submit-btn"
            >
              登录
            </n-button>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="register" tab="注册">
          <n-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-placement="left"
            :label-width="80"
            @keydown.enter="handleRegister"
          >
            <n-form-item path="email" label="邮箱">
              <n-input 
                v-model:value="registerForm.email" 
                placeholder="请输入邮箱"
              >
                <template #prefix>
                  <n-icon><mail-outlined /></n-icon>
                </template>
              </n-input>
            </n-form-item>
            
            <n-form-item path="password" label="密码">
              <n-input 
                v-model:value="registerForm.password" 
                type="password" 
                placeholder="请设置密码（6-20位字母和数字）"
                show-password-on="click"
              >
                <template #prefix>
                  <n-icon><lock-outlined /></n-icon>
                </template>
              </n-input>
            </n-form-item>
            
            <n-form-item path="confirmPassword" label="确认密码">
              <n-input 
                v-model:value="registerForm.confirmPassword" 
                type="password" 
                placeholder="请确认密码"
                show-password-on="click"
              >
                <template #prefix>
                  <n-icon><lock-outlined /></n-icon>
                </template>
              </n-input>
            </n-form-item>
            
            <n-button 
              type="primary" 
              block 
              @click="handleRegister"
              :loading="loading"
              class="submit-btn"
            >
              注册
            </n-button>
          </n-form>
        </n-tab-pane>
      </n-tabs>
      
      <div class="other-login">
        <div class="divider">
          <span class="line"></span>
          <span class="text">其他登录方式</span>
          <span class="line"></span>
        </div>
        <div class="icons">
          <n-button quaternary circle class="icon-btn">
            <n-icon size="24"><wechat-filled /></n-icon>
          </n-button>
          <n-button quaternary circle class="icon-btn">
            <n-icon size="24"><alipay-circle-filled /></n-icon>
          </n-button>
        </div>
      </div>
    </n-card>
    
    <div class="agreement">
      登录/注册即表示您已同意
      <n-button text class="link" @click="showAgreement('service')">
        《用户服务协议》
      </n-button>
      和
      <n-button text class="link" @click="showAgreement('privacy')">
        《隐私政策》
      </n-button>
    </div>
    <!-- 服务协议模态窗口 -->
    <n-modal
      v-model:show="serviceAgreementVisible"
      style="width: 90%; max-width: 800px;"
      preset="card"
      title="用户服务协议"
      :bordered="false"
      :segmented="{ content: true }"
      size="huge"
      :mask-closable="true"
    >
      <div class="agreement-content">
        <h3>饱了么用户服务协议</h3>
        <p class="agreement-date">更新日期：2025年5月9日</p>
        
        <h4>1. 服务条款的接受与修改</h4>
        <p>欢迎使用"饱了么"校园外卖平台（以下简称"本平台"）提供的服务。请您在使用本平台服务前，仔细阅读并充分理解本协议。您通过网络页面点击注册或登录按钮，或实际使用本平台服务，即表示您已充分理解并同意本协议的全部内容。</p>
        
        <h4>2. 服务内容</h4>
        <p>本平台是一款专注于校园场景的外卖下单平台，为用户提供便捷的点餐、支付和配送服务。本平台有权在必要时变更服务内容，并会通过网站公告或其他合理方式通知用户。</p>
        
        <h4>3. 用户账户</h4>
        <p>3.1 用户须保证注册信息的真实性、准确性和完整性，并在信息发生变更时及时更新相关信息。</p>
        <p>3.2 用户须妥善保管账户及密码信息，因用户个人原因导致账户或密码泄露而造成的损失由用户自行承担。</p>
        <p>3.3 用户不得将账户转让、出借或售卖给他人使用。</p>
        
        <h4>4. 用户行为规范</h4>
        <p>用户在使用本平台服务时，必须遵守中华人民共和国相关法律法规及本平台规则，不得利用本平台服务从事违法违规行为，包括但不限于...</p>
        
        <h4>5. 订单与支付</h4>
        <p>5.1 用户通过本平台提交订单即视为与商家达成交易，用户应当按照订单约定履行支付义务。</p>
        <p>5.2 因商品缺货、商家休息等客观原因导致订单无法履行的，平台将协助用户取消订单并退还已支付金额。</p>
        
        <h4>6. 知识产权</h4>
        <p>本平台所包含的全部内容，包括但不限于文字、图片、音频、视频、软件、程序、版面设计等，均受著作权法、商标法、专利法及其他知识产权法律法规保护。未经本平台或相关权利人书面许可，任何人不得擅自使用、复制、转载、摘编或以其他方式使用上述内容。</p>
        
        <h4>7. 免责声明</h4>
        <p>7.1 本平台仅提供交易平台服务，对商家提供的商品质量、食品安全等不承担责任，但会积极协助用户维护自身合法权益。</p>
        <p>7.2 因不可抗力或第三方原因导致的服务中断或用户损失，本平台不承担责任。</p>
        
        <h4>8. 协议变更</h4>
        <p>本平台有权根据业务发展需要修改本协议。修改后的协议将通过网站公告或其他合理方式通知用户。如用户继续使用本平台服务，即视为接受修改后的协议。</p>
        
        <h4>9. 法律适用与争议解决</h4>
        <p>本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。如用户与本平台发生争议，双方应友好协商解决；协商不成的，任何一方均可向本平台所在地人民法院提起诉讼。</p>
        
        <h4>10. 其他</h4>
        <p>10.1 本协议中标题仅为方便阅读而设，不影响本协议任何条款的含义或解释。</p>
        <p>10.2 本协议的最终解释权归属于饕餮科技有限公司。</p>
      </div>
    </n-modal>
    
    <!-- 隐私政策模态窗口 -->
    <n-modal
      v-model:show="privacyPolicyVisible"
      style="width: 90%; max-width: 800px;"
      preset="card"
      title="隐私政策"
      :bordered="false"
      :segmented="{ content: true }"
      size="huge"
      :mask-closable="true"
    >
      <div class="agreement-content">
        <h3>饱了么隐私政策</h3>
        <p class="agreement-date">更新日期：2025年5月9日</p>
        
        <h4>1. 引言</h4>
        <p>本隐私政策旨在帮助您了解我们如何收集、使用、存储和共享您的个人信息，以及您如何访问、更新、控制和保护您的个人信息。请您在使用我们的服务前，仔细阅读并充分理解本隐私政策。</p>
        
        <h4>2. 我们收集的信息</h4>
        <p>2.1 您提供的信息：包括但不限于注册信息（如邮箱、密码）、个人资料（如姓名、联系方式）、订单信息（如配送地址）等。</p>
        <p>2.2 我们获取的信息：包括但不限于设备信息、位置信息、日志信息、交易信息等。</p>
        
        <h4>3. 信息的使用</h4>
        <p>我们可能将收集的信息用于以下用途：</p>
        <p>3.1 提供、维护和改进我们的服务；</p>
        <p>3.2 处理订单、配送和支付；</p>
        <p>3.3 向您推荐您可能感兴趣的商品或服务；</p>
        <p>3.4 预防和打击欺诈等违法行为；</p>
        <p>3.5 解决争议，履行我们的法律义务。</p>
        
        <h4>4. 信息的共享</h4>
        <p>除以下情形外，未经您同意，我们不会与任何第三方共享您的个人信息：</p>
        <p>4.1 为实现本平台的基本功能，如与商家、骑手共享必要的订单信息；</p>
        <p>4.2 在法律法规要求的情况下，或应政府部门或其他法定授权机构的要求；</p>
        <p>4.3 在紧急情况下，为保护用户、公众或本平台的合法权益。</p>
        
        <h4>5. 信息的保护</h4>
        <p>我们采取严格的安全措施保护您的个人信息，包括但不限于数据加密、访问控制等技术手段和管理措施。尽管如此，请您理解，互联网环境并非百分之百安全，我们将尽最大努力确保您的个人信息安全，但无法保证绝对的安全性。</p>
        
        <h4>6. 您的权利</h4>
        <p>根据中国相关法律法规，您对您的个人信息享有以下权利：</p>
        <p>6.1 访问和更正您的个人信息；</p>
        <p>6.2 删除您的个人信息；</p>
        <p>6.3 撤回同意；</p>
        <p>6.4 注销账户；</p>
        <p>6.5 投诉举报。</p>
        
        <h4>7. Cookie和同类技术</h4>
        <p>我们使用Cookie和同类技术来提供、保护和改进我们的服务。您可以通过浏览器设置管理Cookie。</p>
        
        <h4>8. 未成年人保护</h4>
        <p>我们非常重视对未成年人个人信息的保护。如您是未满18周岁的未成年人，请在监护人的指导下使用我们的服务并阅读本隐私政策。</p>
        
        <h4>9. 政策更新</h4>
        <p>我们可能会更新本隐私政策。当政策发生重大变更时，我们会通过网站公告或其他方式通知您。</p>
        
        <h4>10. 联系我们</h4>
        <p>如您对本隐私政策有任何疑问、意见或建议，您可通过以下方式与我们联系：</p>
        <p>邮箱：xxxxxx@xxxx.com</p>
        <p>地址：BUAA</p>
      </div>
    </n-modal>

    <!-- 注册成功提示 -->
    <n-modal
      v-model:show="registerSuccessVisible"
      preset="dialog"
      title="注册成功"
      positive-text="确定"
      @positive-click="closeRegisterSuccess"
    >
      <template #icon>
        <n-icon><mail-filled /></n-icon>
      </template>
      <div class="register-success-content">
        <p>我们已向您的邮箱 <strong>{{ registerForm.email }}</strong> 发送了一封验证邮件。</p>
        <p>请前往邮箱查收并点击邮件中的链接以激活您的账号。</p>
        <p class="note">注意：激活链接有效期为24小时，请尽快完成激活。</p>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  MailOutlined, 
  LockOutlined, 
  WechatFilled, 
  AlipayCircleFilled,
  MailFilled
} from '@vicons/antd'
import { type FormInst, type FormRules, useMessage } from 'naive-ui';
import { registerUser, type RegisterRequest, loginUser, type LoginRequest, type LoginResponse } from '@/api/auth';
import { useTokenStore } from '@/stores/token';

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const rememberMe = ref(false)
const serviceAgreementVisible = ref(false)
const privacyPolicyVisible = ref(false)
const registerSuccessVisible = ref(false)
const tokenStore = useTokenStore();

// 登录表单
const loginFormRef = ref<FormInst | null>(null)
const loginForm = reactive({
  email: '',
  password: ''
})

// 注册表单
const registerFormRef = ref<FormInst | null>(null)
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ]
}

const registerRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请设置密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value) => value === registerForm.password, 
      message: '两次输入的密码不一致', 
      trigger: 'blur' 
    }
  ]
}

// 登录
const handleLogin = () => {
  loginFormRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true;
      try {
        const loginData: LoginRequest = {
          email: loginForm.email,
          password: loginForm.password
        };
        const response = await loginUser(loginData);

        await tokenStore.setToken(response.token, response.id); 

        message.success('登录成功！');
        
        router.push('/customer/home');

      } catch (error: any) {
        if (error.response) {
          const statusCode = error.response.status;
          const errorMsg = error.response.data?.message || '登录失败，请稍后重试。';
          if (statusCode === 400) { 
            message.error(`请求不合法: ${errorMsg}`);
          } else if (statusCode === 403) {
             const details = error.response.data?.errors?.map((e: any) => e.message).join(', ') || errorMsg;
             message.error(`无权访问: ${details}`);
          } else {
            message.error(errorMsg);
          }
          console.error('Login API error:', error.response);
        } else {
          // 网络错误或其他
          message.error('登录过程中发生非预期错误');
          console.error('Network or other error during login:', error);
        }
      } finally {
        loading.value = false;
      }
    } else {
      message.error('请输入有效的邮箱和密码。');
    }
  });
};

// 注册
const handleRegister = () => {
  registerFormRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      
      try {
        const payload: RegisterRequest = {
          email: registerForm.email,
          password: registerForm.password
        }
        await registerUser(payload) 
        registerSuccessVisible.value = true 
        
      } catch (error: any) {
        if (error.response) {
          const statusCode = error.response.status;
          const errorMsg = error.response.data?.message || '注册失败，请稍后重试。';
          if (statusCode === 400) { 
            message.error(`请求不合法: ${errorMsg}`);
          } else if (statusCode === 403) {
             const details = error.response.data?.errors?.map((e: any) => e.message).join(', ') || errorMsg;
             message.error(`无权访问: ${details}`);
          } else {
            message.error(errorMsg);
          }
          console.error('Registration API error:', error.response);
        } else {
          message.error('注册过程中发生非预期错误');
          console.error('Network or other error during registration:', error);
        }
      } finally {
        loading.value = false
      }
    } else {
      message.error('请检查您填写的信息是否符合要求。')
    }
  })
}

// 关闭注册成功提示
const closeRegisterSuccess = () => {
  registerSuccessVisible.value = false
  // 重置注册表单
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
}

// 显示协议或政策
const showAgreement = (type: 'service' | 'privacy') => {
  if (type === 'service') {
    serviceAgreementVisible.value = true
  } else {
    privacyPolicyVisible.value = true
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(to bottom, #ffebee, #ffffff);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  margin-top: 40px;
}

.title {
  font-size: 28px;
  color: #ff6b01;
  margin: 10px 0 5px;
}

.slogan {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.forgot-btn {
  font-size: 14px;
  color: #999;
}

.submit-btn {
  margin-top: 10px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background-color: #ff6b01;
}

.other-login {
  margin-top: 24px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.line {
  flex: 1;
  height: 1px;
  background-color: #eee;
}

.text {
  padding: 0 12px;
  font-size: 14px;
  color: #999;
}

.icons {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.icon-btn {
  width: 48px;
  height: 48px;
}

.agreement {
  margin-top: 20px;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.link {
  font-size: 12px;
  color: #ff6b01;
}

.agreement-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 10px;
}

.agreement-content h3 {
  text-align: center;
  margin-bottom: 8px;
}

.agreement-date {
  text-align: center;
  color: #999;
  margin-bottom: 20px;
  font-size: 14px;
}

.agreement-content h4 {
  margin-top: 24px;
  margin-bottom: 12px;
  font-size: 16px;
}

.agreement-content p {
  line-height: 1.8;
  margin-bottom: 12px;
  font-size: 14px;
  color: #333;
}

.register-success-content {
  padding: 10px 0;
}

.register-success-content p {
  margin-bottom: 12px;
  line-height: 1.6;
}

.register-success-content .note {
  font-size: 14px;
  color: #ff6b01;
  margin-top: 16px;
}
</style>