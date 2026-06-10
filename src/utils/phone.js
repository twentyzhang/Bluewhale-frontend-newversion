/** 与后端 @Valid 一致：^1[3-9]\d{9}$ */
export const PHONE_RULE = {
  pattern: /^1[3-9]\d{9}$/,
  message: '请输入11位有效手机号',
};
