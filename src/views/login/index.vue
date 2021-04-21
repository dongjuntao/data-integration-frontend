<template>
  <div>
    <el-card class="login-form-layout">
      <el-form autoComplete="on"
               :model="loginForm"
               :rules="loginRules"
               ref="loginForm"
               label-position="left">
        <div style="text-align: center">
          <svg-icon icon-class="login-mall" style="width: 56px;height: 56px;color: #409EFF"></svg-icon>
        </div>

        <h2 class="login-title color-main">数据采集平台</h2>

        <el-form-item prop="username">
          <el-input name="username"
                    type="text"
                    v-model="loginForm.username"
                    autoComplete="on"
                    placeholder="请输入用户名">
          <span slot="prefix">
            <svg-icon icon-class="user" class="color-main"></svg-icon>
          </span>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input name="password"
                    :type="pwdType"
                    @keyup.enter.native="handleLogin"
                    v-model="loginForm.password"
                    autoComplete="on"
                    placeholder="请输入密码">
          <span slot="prefix">
            <svg-icon icon-class="password" class="color-main"></svg-icon>
          </span>
            <span slot="suffix" @click="showPwd">
            <svg-icon icon-class="eye" class="color-main"></svg-icon>
          </span>
          </el-input>
        </el-form-item>

        <el-form-item prop="captcha" class="captcha">
          <el-input name="captcha"
                    type="text"
                    v-model="loginForm.captcha"
                    autoComplete="on"
                    maxlength="4"
                    placeholder="请输入验证码">
          <span slot="prefix">
            <svg-icon icon-class="user" class="color-main"></svg-icon>
          </span>
          </el-input>
          <el-col  class="login-captcha">
            <img :src="captchaPath" @click="getCaptcha()" alt="">
          </el-col>
        </el-form-item>

        <el-form-item style="margin-bottom: 60px;text-align: center">
          <el-button style="width: 45%" type="primary" :loading="loading" @click.native.prevent="handleLogin" @keyup.enter="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <img :src="login_background" class="login-center-layout">
  </div>
</template>

<script>
  import {isvalidUsername} from '@/utils/validate';
  import {setSupport,getSupport,setCookie,getCookie} from '@/utils/support';
  import login_background from '@/assets/images/login_background.png';
  import { getUUID } from '@/utils';

  export default {
    name: 'login',
    data() {
      const validateUsername = (rule, value, callback) => {
        if (!isvalidUsername(value)) {
          callback(new Error('请输入正确的用户名'))
        } else {
          callback()
        }
      };
      const validatePass = (rule, value, callback) => {
        if (value.length < 3) {
          callback(new Error('密码不能小于3位'))
        } else {
          callback()
        }
      };
      const validateCaptcha = (rule, value, callback) =>{
        if (value.length < 1) {
          callback(new Error('验证码不能为空'))
        }else if(value.length != 4){
          callback(new Error('验证码为4位'))
        }else {
          callback()
        }
      }
      return {
        loginForm: {
          username: '',//用户名
          password: '',//密码
          captcha:'', //验证码
          uuid: '' //验证码因子
        },
        loginRules: {
          username: [{required: true, trigger: 'blur', validator: validateUsername}],
          password: [{required: true, trigger: 'blur', validator: validatePass}],
          captcha: [{required: true, trigger: 'blur', validator: validateCaptcha}],
        },
        loading: false,
        pwdType: 'password',
        login_background,
        supportDialogVisible:false,
        captchaPath:'' //验证码
      }
    },
    created() {
      this.getCaptcha();//获取验证码
      this.loginForm.username = getCookie("username");
      this.loginForm.password = getCookie("password");
      if(this.loginForm.username === undefined||this.loginForm.username==null||this.loginForm.username===''){
        this.loginForm.username = 'admin';
      }
      if(this.loginForm.password === undefined||this.loginForm.password==null){
        this.loginForm.password = '';
      }
    },

    mounted() {
      // 绑定监听事件
      window.addEventListener("keydown", this.keyDown);
    },
    methods: {
      showPwd() {
        if (this.pwdType === 'password') {
          this.pwdType = ''
        } else {
          this.pwdType = 'password'
        }
      },
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true;
            this.$store.dispatch('Login', this.loginForm).then(() => {
              this.loading = false;
              setCookie("username",this.loginForm.username,15);
              setCookie("password",this.loginForm.password,15);
              this.$router.push({path: '/'})
            }).catch(() => {
              this.loading = false
            })
          } else {
            console.log('参数验证不合法！');
            return false
          }
        })
      },
      handleTry(){
        this.dialogVisible =true
      },
      dialogConfirm(){
        this.dialogVisible =false;
        setSupport(true);
      },
      dialogCancel(){
        this.dialogVisible = false;
        setSupport(false);
      },

      /**
       * 点击回车键登录
       */
      keyDown(e) {
        // 回车则执行登录方法 enter键的ASCII是13
        if (e.keyCode === 13) {
          this.handleLogin(); // 定义的登录方法
        }
      },

      /**
       * TODO 需要修改
       * 获取验证码
       * */
      getCaptcha () {
        var uuid = getUUID();
        this.loginForm.uuid = uuid;
        this.captchaPath = "http://49.234.85.17:8080/captcha/generate?uuid=" + this.loginForm.uuid;
      }
    }
  }
</script>

<style scoped>
  .login-form-layout {
    position: absolute;
    left: 0;
    right: 0;
    width: 360px;
    height: 410px;
    margin: 100px auto;
    border-top: 5px solid #3399ff;
    background-color: #d9edf7;
  }

  .login-title {
    text-align: center;
  }

  .login-center-layout {
    background: #409EFF;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    margin-top: 0px;
  }

  .captcha {
    width: 200px;
    height: 50px;
  }

  .login-captcha {
    position: absolute;
    margin-left: 205px;
    margin-top: -39px;
  }


</style>
