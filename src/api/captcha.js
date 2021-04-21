import request from '@/utils/request'

/**从后端获取验证码*/
export function generateCaptcha(uuid) {
  return request({
    url: '/captcha/generate?uuid='+uuid,
    method: 'get'
  })
}
