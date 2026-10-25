<template>
  <view class="su-upload">
    <!-- <wd-upload :file-list="fileList" :action="uploadAction" :name="uploadName" :accept="accept" :multiple="multiple"
      :disabled="disabled || readonly" :limit="maxCount" :show-upload="showUpload && !readonly" :max-size="maxSize"
      :auto-upload="true" :reupload="true" :before-upload="beforeUpload" :before-remove="beforeRemove"
      :upload-method="uploadMethod" @update:file-list="handleFileListUpdate" @change="handleChange"
      @success="handleSuccess" @fail="handleFail" @progress="handleProgress" @oversize="handleOversize"
      @chooseerror="handleChooseError" @remove="handleRemove" /> -->
    <!-- <wd-upload :file-list="fileList" :name="uploadName" :accept="accept" :multiple="multiple"
      :disabled="disabled || readonly" :limit="maxCount" :show-upload="showUpload && !readonly" :max-size="maxSize"
      :reupload="true" :before-upload="beforeUpload" :upload-method="customUpload"
      @update:file-list="handleFileListUpdate" @change="handleChange" @success="handleSuccess" @fail="handleFail" /> -->

    <!-- <view v-if="hint && !readonly" class="su-upload__hint">
      {{ hint }}
    </view> -->

    <wd-upload v-model:file-list="fileList" :before-upload="beforeUpload" :upload-method="customUpload" :accept="accept"
      :multiple="multiple" :success-status="[200, 201, 204]" @update:file-list="handleFileListUpdate"
      @success="handleSuccess" @fail="handleFail"></wd-upload>
  </view>
</template>

<script setup lang="ts">
// 全局属性
// api
import { getUploadPolicyApi } from '@/api/common/oss'
import { addAttachmentApi } from '@/api/common/attachment'
// ts
import type { UploadPolicyRequest, UploadPolicyResponse } from '@/api/common/oss/types'
import type { AddAttachmentItem } from '@/api/common/attachment/types'
import type {
  UploadFileItem,
  UploadMethod,
  ChooseFile,
  UploadFormData,
  UploadSuccessEvent,
  UploadErrorEvent,
  UploadProgressEvent,
  UploadOversizeEvent as WdUploadOversizeEvent,
  UploadRemoveEvent
} from '@wot-ui/ui/components/wd-upload/types'
import type { AttachmentInfo, UploadAccept, UploadCategory, UploadFailEvent, UploadOversizeEvent, UploadExceedEvent } from './types'
// utils
import { buildOssRequest, parseOssUploadError } from './util'

defineOptions({
  name: 'SuUpload'
})

interface Props {
  modelValue: AttachmentInfo[]
  category: UploadCategory
  accept?: UploadAccept
  maxCount?: number
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  readonly?: boolean
  showUpload?: boolean
  deletable?: boolean
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accept: 'image',
  maxCount: 9,
  maxSize: 0,
  multiple: true,
  disabled: false,
  readonly: false,
  showUpload: true,
  deletable: true,
  hint: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: AttachmentInfo[]]
  change: [value: AttachmentInfo[]]
  success: [file: AttachmentInfo]
  fail: [event: UploadFailEvent]
  remove: [file: AttachmentInfo]
  oversize: [event: UploadOversizeEvent]
  exceed: [event: UploadExceedEvent]
}>()

// 附件列表
const fileList = ref<UploadFileItem[]>([])
// oss上传成功后的数据：用于存到后端附件表中
const ossData = new Map<number, AddAttachmentItem>()

/** 防止父组件更新 v-model 时覆盖内部上传状态 */
let syncingFromModel = false
/** 记录正在上传的任务，支持后续中断 */
const uploadTasks = new Map<number, UniApp.UploadTask>()
/** 记录每个文件申请到的 OSS 对象信息 */
const uploadMetadata = new Map<
  number,
  {
    objectKey: string
    contentType: string
  }
>()

/** OSS 上传成功、等待登记到 MySQL 的附件 */
// const ossData = new Map<
//   number,
//   {
//     name: string
//     category: string
//     objectKey: string
//   }
// >()

/** 生成前端文件标识 */
let uidSeed = 1

function createUid() {
  return Date.now() + uidSeed++
}

/**
 * 获取文件名称
 * 微信小程序 chooseMedia 的返回项没有 name 字段，且临时路径通常也没有
 */
const getFileName = (file: { name?: string; path?: string; url?: string; type?: string }) => {
  const name = file.name?.trim()
  if (name) return name

  const path = file.path || file.url || ''
  const pathName = path.split(/[\\/]/).pop()?.split('?')[0] || ''
  if (pathName && /\.[^./]+$/.test(pathName)) return pathName

  return file.type === 'image' ? 'image.jpg' : '未命名文件'
}

// MIME类型白名单
const MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

type SupportedMimeType = (typeof MIME_TYPES)[number]

/**
 * 根据文件名称推断MIME类型
 * 不支持的类型直接拒绝，不能默认当作JPEG上传
 */
const getMimeType = (name = '', fileType?: string): SupportedMimeType | undefined => {
  const extension = name.split('.').pop()?.toLowerCase()

  const mimeMap: Record<string, SupportedMimeType> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp'
  }

  // MP-WEIXIN 的 chooseMedia 只返回 tempFilePath/fileType，不返回原始文件名
  // 没有扩展名时，图片先按 JPEG 处理（调用方仍可通过真实 name/路径扩展名覆盖）
  if (extension) return mimeMap[extension]
  return fileType === 'image' ? 'image/jpeg' : undefined
}

// 从本地文件生成附件对象
// function toAttachment(file: UploadFileItem): AttachmentInfo {
//   const metadata = uploadMetadata.get(file.uid)

//   let status: AttachmentInfo['status'] = 'pending'

//   if (file.status === 'loading') {
//     status = 'uploading'
//   } else if (file.status === 'success') {
//     status = 'success'
//   } else if (file.status === 'fail') {
//     status = 'failed'
//   }

//   return {
//     uid: file.uid,
//     objectKey: metadata?.objectKey,
//     name: file.name || '未命名图片',
//     size: file.size || 0,
//     mimeType: metadata?.contentType || getMimeType(file.name) || '',
//     status,
//     percent: file.percent ?? 0,
//     previewUrl: file.thumb || file.url,
//     error: file.error
//   }
// }

/** 只保留有效的前端文件列表，不把远程 URL 当作 OSS objectKey */
// function emitFileListChange(list: UploadFileItem[]) {
//   if (syncingFromModel) return

//   const attachments = list.map(toAttachment)

//   emit('update:modelValue', attachments)
//   emit('change', attachments)
// }

/** 本地大小限制，0 表示不额外限制 */
// const effectiveMaxSize = computed(() => {
//   return props.maxSize > 0 ? props.maxSize : undefined
// })

/**
 * 附件上传前校验
 */
const beforeUpload = (option: { files: Record<string, any>[]; fileList: UploadFileItem[] }) => {
  const files = option.files || []

  for (const rawFile of files) {
    const name = getFileName(rawFile) // 附件名称
    // const size = Number(rawFile.size || 0) // 附件大小
    const mimeType = getMimeType(name, rawFile.type) // 附件格式

    // 校验：附件格式
    if (!mimeType) {
      uni.showToast({
        title: '仅支持 JPG、PNG、WEBP 图片',
        icon: 'none'
      })
      return false
    }
    // 后续增加 校验：附件大小限制
    // if (effectiveMaxSize.value && size > effectiveMaxSize.value) {
    //   const file: AttachmentInfo = {
    //     name,
    //     size,
    //     mimeType,
    //     status: 'failed',
    //     previewUrl: rawFile.path
    //   }
    //   emit('oversize', {
    //     file,
    //     maxSize: effectiveMaxSize.value
    //   })
    //   uni.showToast({
    //     title: '图片超过大小限制',
    //     icon: 'none'
    //   })
    //   return false
    // }

    // 后续增加 校验：上传数量
    // const currentCount = option.fileList?.length || 0

    // if (currentCount >= props.maxCount) {
    //   const file: AttachmentInfo = {
    //     name,
    //     size,
    //     mimeType,
    //     status: 'failed',
    //     previewUrl: rawFile.path
    //   }
    //   emit('exceed', {
    //     file,
    //     maxCount: props.maxCount
    //   })

    //   uni.showToast({
    //     title: `最多上传 ${props.maxCount} 张图片`,
    //     icon: 'none'
    //   })
    //   return false
    // }
  }
  return true
}

// 是否允许删除
// function beforeRemove(_option: { file: UploadFileItem; index: number; fileList: UploadFileItem[] }): boolean {
//   return !props.disabled && !props.readonly && props.deletable
// }

/**
 * OSS V4 PostObject 直传。
 *
 * 注意：
 * 1. action 参数不使用默认上传地址
 * 2. 先获取后端签发的 Policy
 * 3. 使用后端返回的 objectKey，不自行生成
 * 4. 不将长期AccessKey放到前端
 */
const customUpload: UploadMethod = (file, formData, options) => {
  void (async () => {
    try {
      const fileName = getFileName({ ...file, type: props.accept })
      // 将回退名称写回列表，避免微信端后续 toAttachment 仍然拿到空 name
      // if (!file.name) {
      //   file.name = name
      // }
      const mimeType = getMimeType(fileName, props.accept)

      if (!mimeType) {
        throw new Error('不支持的图片格式')
      }

      const tempParams: UploadPolicyRequest = {
        category: props.category,
        contentType: mimeType
      }

      const policy: UploadPolicyResponse = await getUploadPolicyApi(tempParams)

      const ossRequest = buildOssRequest(policy)
      // if (!file.url) throw new Error('缺少本地上传文件路径')

      /** 本地再次校验服务端返回的大小限制 */
      // const maxFileSize = Math.min(props.maxSize > 0 ? props.maxSize : Infinity, policy.maxFileSize)

      // if ((file.size || 0) > maxFileSize) {
      //   throw new Error(`图片大小不能超过 ${Math.floor(maxFileSize / 1024 / 1024)} MB`)
      // }

      // uploadMetadata.set(file.uid, {
      //   objectKey: policy.objectKey,
      //   contentType: policy.contentType
      // })

      /**
       * 整合上传OSS的表单数据
       */
      const ossFormData = ossRequest.formData

      const task = uni.uploadFile({
        url: ossRequest.url,
        filePath: file.url,
        name: 'file',
        formData: ossFormData,

        success(res) {
          // OSS上传成功，暂存登记数据库所需的信息
          ossData.set(file.uid, {
            name: fileName,
            category: props.category,
            objectKey: policy.objectKey
          })

          uploadTasks.delete(file.uid)
          if ([200, 201, 204].includes(res.statusCode)) {
            options.onSuccess(res, file, ossFormData)
          } else {
            const error = parseOssUploadError(res)
            console.error('[SuUpload] OSS PostObject 失败', error)
            options.onError(error, file, ossFormData)
          }
        },
        fail(error) {
          // uploadTasks.delete(file.uid)
          options.onError(error, file, ossFormData)
        }
      })
      // uploadTasks.set(file.uid, task)
      task.onProgressUpdate((res) => {
        options.onProgress(res, file)
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传初始化失败'
      options.onError({ errMsg: message }, file, formData)
    }
  })()
}

// 更新文件列表
function handleFileListUpdate(list: UploadFileItem[]) {
  fileList.value = list
  // emitFileListChange(list)
}

/** 文件列表变化 */
// function handleChange(event: { fileList: UploadFileItem[] }) {
//   fileList.value = event.fileList
//   emitFileListChange(event.fileList)
// }

// 上传成功
const handleSuccess = async (event: UploadSuccessEvent) => {
  console.log(2)
  console.log(event)
  console.log(ossData)
  const tempArr: AddAttachmentItem[] = []
  tempArr.push({
    name: ossData.get(event.file.uid)?.name ?? '',
    category: ossData.get(event.file.uid)?.category ?? '',
    objectKey: ossData.get(event.file.uid)?.objectKey ?? ''
  })
  await addAttachmentApi(tempArr)
  // const attachment = toAttachment(event.file)
  // attachment.status = 'success'
  // attachment.percent = 100
  // attachment.objectKey = uploadMetadata.get(event.file.uid)?.objectKey
  // emit('success', attachment)
  // emitFileListChange(event.fileList)
  console.log('上传成功')
  // const attachment = toAttachment(event.file)

  // attachment.status = 'success'
  // attachment.percent = 100
  // attachment.objectKey = uploadMetadata.get(event.file.uid)?.objectKey

  // emit('success', attachment)
  // emitFileListChange(event.fileList)
}

/** 上传失败 */
function handleFail(event: UploadErrorEvent) {
  // wot-ui's handleError reads error.message rather than error.errMsg.
  // event.file.error = event.error?.message || event.error?.errMsg || '上传失败'
  // const attachment = toAttachment(event.file)
  // attachment.status = 'failed'
  // emit('fail', { file: attachment, error: event.error })
  // emitFileListChange(fileList.value)
  // const attachment = toAttachment(event.file)
  // attachment.status = 'failed'
  // emit('fail', {
  //   file: attachment,
  //   error: event.error
  // })
  // emitFileListChange(fileList.value.map((item) => (item.uid === event.file.uid ? { ...item, status: 'fail' } : item)))
}

/** 上传进度 */
// function handleProgress(event: UploadProgressEvent) {
//   const target = fileList.value.find((item) => item.uid === event.file.uid)

//   if (target) {
//     target.percent = event.response.progress
//   }

//   emitFileListChange(fileList.value)
// }

/** wot-ui 自身大小校验事件 */
// function handleOversize(event: WdUploadOversizeEvent) {
//   const file: AttachmentInfo = {
//     name: event.file.name || '未命名图片',
//     size: event.file.size || 0,
//     mimeType: getMimeType(event.file.name) || '',
//     status: 'failed',
//     previewUrl: event.file.path
//   }

//   emit('oversize', {
//     file,
//     maxSize: props.maxSize
//   })
// }

/** 文件选择异常 */
// function handleChooseError() {
//   uni.showToast({
//     title: '选择图片失败，请重试',
//     icon: 'none'
//   })
// }

/** 删除文件 */
// function handleRemove(event: UploadRemoveEvent) {
//   const attachment = toAttachment(event.file)

//   const task = uploadTasks.get(event.file.uid)

//   if (task) {
//     task.abort()
//     uploadTasks.delete(event.file.uid)
//   }

//   uploadMetadata.delete(event.file.uid)

//   emit('remove', attachment)

//   emitFileListChange(fileList.value.filter((item) => item.uid !== event.file.uid))
// }

/**
 * 对外暴露中断能力。
 * 父组件通过 ref 调用 abort()。
 */
// function handleRemove(event: UploadRemoveEvent) {
//   const attachment = toAttachment(event.file)
//   const task = uploadTasks.get(event.file.uid)
//   if (task) {
//     task.abort()
//     uploadTasks.delete(event.file.uid)
//   }
//   uploadMetadata.delete(event.file.uid)
//   emit('remove', attachment)
//   emitFileListChange(fileList.value.filter((item) => item.uid !== event.file.uid))
// }

// function abort(uid?: number) {
//   if (uid !== undefined) {
//     uploadTasks.get(uid)?.abort()
//     uploadTasks.delete(uid)
//     return
//   }

//   uploadTasks.forEach((task) => task.abort())
//   uploadTasks.clear()
// }

// 同步父组件v-model到上传列表
watch(
  () => props.modelValue,
  (value) => {
    syncingFromModel = true

    fileList.value = (value || []).map((item) => ({
      uid: item.uid ?? createUid(),
      name: item.name,
      size: item.size,
      url: item.previewUrl || item.url || '',
      thumb: item.previewUrl || item.url || '',
      percent: item.percent ?? 100,
      status: item.status === 'success' ? 'success' : item.status === 'failed' ? 'fail' : item.status === 'uploading' ? 'loading' : 'pending',
      objectKey: item.objectKey,
      attachmentId: item.attachmentId,
      mimeType: item.mimeType,
      error: item.error
    }))

    syncingFromModel = false
  },
  {
    immediate: true,
    deep: true
  }
)

// defineExpose({
//   abort
// })
</script>

<style lang="scss" scoped>
.su-upload {
  width: 100%;

  // &__hint {
  //   margin-top: 12rpx;
  //   color: var(--wot-color-secondary, #999);
  //   font-size: 24rpx;
  //   line-height: 1.5;
  // }
}
</style>
