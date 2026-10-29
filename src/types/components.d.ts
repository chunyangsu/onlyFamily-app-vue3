/* eslint-disable */
export { }

declare module 'vue' {
  export interface GlobalComponents {
    SuButton: (typeof import('../components/su/SuButton/index.vue'))['default']
    SuCard: (typeof import('../components/su/SuCard/index.vue'))['default']
    SuImage: (typeof import('../components/su/SuImage/index.vue'))['default']
    SuUpload: (typeof import('../components/su/SuUpload/index.vue'))['default']
  }
}
