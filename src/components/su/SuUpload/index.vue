<template>
  <view class="su-upload">
    <wd-upload
      v-model:file-list="attachmentList"
      :before-upload="beforeUpload"
      :upload-method="customUpload"
      :accept="accept"
      :success-status="[200, 201, 204]"
      @success="handleSuccess"
      @remove="handleRemove"
    />
  </view>
</template>

<script lang="ts">
export default {
  name: 'SuUpload' // 上传组件
}
</script>
<script setup lang="ts">
import type { UploadFileItem, UploadMethod, UploadSuccessEvent, UploadRemoveEvent } from '@wot-ui/ui/components/wd-upload/types'
import { getFileMimeType, getUploadErrorMessage, uploadAttachment } from '@/utils/upload'

interface Props {
  modelValue: number[]
  module: 'user' | 'food'
  moduleType: 'avatar' | 'dish'
  accept?: 'image'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accept: 'image'
})

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  'upload-success': [value: number[]]
}>()

interface AttachmentItem extends UploadFileItem {
  // 上传中、失败的文件尚无附件 ID。
  id?: number
}
const attachmentList = ref<AttachmentItem[]>([])

const beforeUpload = (option: { files: Record<string, any>[] }) => {
  for (const file of option.files || []) {
    if (!getFileMimeType(file.path || '', file.type)) {
      uni.showToast({ title: '仅支持 JPG、PNG、WEBP 图片', icon: 'none' })
      return false
    }
  }
  return true
}

/** 保留 wd-upload 的进度和原始响应回调，登记附件成功后才标记完成。 */
const customUpload: UploadMethod = async (file, formData, options) => {
  delete file.id
  try {
    const result = await uploadAttachment({
      filePath: file.url,
      module: props.module,
      moduleType: props.moduleType,
      fileType: props.accept,
      onProgress: (progress) => options.onProgress(progress, file)
    })
    file.id = result.id
    options.onSuccess(result.response, file, result.formData)
  } catch (error) {
    const message = getUploadErrorMessage(error)
    // 保留 OSS 的 code/requestId 等诊断信息，并补齐 wd-upload 使用的 message。
    const uploadError = { ...(error && typeof error === 'object' ? error : {}), errMsg: message, message }
    options.onError(uploadError, file, formData)
  }
}

const getAttachmentIds = (files: AttachmentItem[]): number[] => files.map((file) => file.id).filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0)

const handleSuccess = (event: UploadSuccessEvent) => {
  // wd-upload 先触发 success 再同步 file-list，使用事件列表以兼容并发上传。
  const item = event.fileList.find((file) => file.uid === event.file.uid)
  if (item) item.id = event.file.id
  const ids = getAttachmentIds(event.fileList)
  emit('update:modelValue', ids)
  emit('upload-success', ids)
}

const handleRemove = (event: UploadRemoveEvent) => {
  // 删除后同步父组件的附件 ID，不对删除操作发出 upload-success。
  emit('update:modelValue', getAttachmentIds(attachmentList.value.filter((file) => file.uid !== event.file.uid)))
}
</script>

<style lang="scss" scoped>
.su-upload {
  width: 100%;
}
</style>
