/* eslint-disable */
export { }

declare module 'vue' {
  export interface GlobalComponents {
    SuButton: (typeof import('../components/su/SuButton/index.vue'))['default']
    SuCard: (typeof import('../components/su/SuCard/index.vue'))['default']
    SuImage: (typeof import('../components/su/SuImage/index.vue'))['default']
    SuInput: (typeof import('../components/su/SuInput/index.vue'))['default']
    SuInputNumber: (typeof import('../components/su/SuInputNumber/index.vue'))['default']
    SuFormItem: (typeof import('../components/su/SuFormItem/index.vue'))['default']
    SuUpload: (typeof import('../components/su/SuUpload/index.vue'))['default']
  }
}
