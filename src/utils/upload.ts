import { getUploadPolicyApi } from '@/api/common/oss'
import { addAttachmentApi } from '@/api/common/attachment'
import type { UploadPolicyRequest } from '@/api/common/oss/types'
import type { AddAttachmentResponseItem } from '@/api/common/attachment/types'
import { buildOssRequest, parseOssUploadError } from '@/components/su/SuUpload/util'

export interface UploadAttachmentOptions {
  filePath: string
  module: UploadPolicyRequest['module']
  moduleType: UploadPolicyRequest['moduleType']
  name?: string
  fileType?: string
  onProgress?: (progress: UniApp.OnProgressUpdateResult) => void
  onTask?: (task: UniApp.UploadTask) => void
}

export interface UploadedAttachment extends AddAttachmentResponseItem {
  /** 保留 OSS 原始响应和表单，供 wd-upload 的回调使用。 */
  response: UniApp.UploadFileSuccessCallbackResult
  formData: Record<string, string>
}

const mimeMap: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
}

/** 沿用原组件的 MIME 推断；真实文件类型仍须由服务端校验。 */
export const getFileMimeType = (path: string, fileType = ''): string => {
  const extension = path.split(/[?#]/)[0].split('.').pop()?.toLowerCase()
  if (extension && mimeMap[extension]) return mimeMap[extension]
  // 微信图片临时路径可能没有扩展名，保持原组件按 JPEG 推断的行为。
  return fileType === 'image' ? 'image/jpeg' : ''
}

/** 兼容 Error、uni 回调错误和业务接口错误。 */
export const getUploadErrorMessage = (error: unknown, fallback = '上传失败，请重试'): string => {
  if (error && typeof error === 'object') {
    const details = error as { message?: string; errMsg?: string; msg?: string }
    return details.message || details.errMsg || details.msg || fallback
  }
  return typeof error === 'string' && error ? error : fallback
}

/** 本地文件 → OSS V4 PostObject → 登记附件；只有登记成功才 resolve，不处理业务绑定。 */
export const uploadAttachment = async (options: UploadAttachmentOptions): Promise<UploadedAttachment> => {
  if (!options.filePath) throw new Error('缺少本地上传文件路径')
  const mimeType = getFileMimeType(options.filePath, options.fileType ?? 'image')
  if (!mimeType) throw new Error('仅支持 JPG、PNG、WEBP 图片')

  const policy = await getUploadPolicyApi({ module: options.module, moduleType: options.moduleType })
  const { url, formData } = buildOssRequest(policy)
  const response = await new Promise<UniApp.UploadFileSuccessCallbackResult>((resolve, reject) => {
    const task = uni.uploadFile({
      url,
      filePath: options.filePath,
      name: 'file',
      formData,
      success(res) {
        if ([200, 201, 204].includes(res.statusCode)) {
          resolve(res)
        } else {
          reject(parseOssUploadError(res))
        }
      },
      fail: reject
    })
    if (options.onProgress) task.onProgressUpdate(options.onProgress)
    options.onTask?.(task)
  })

  const attachments = await addAttachmentApi([
    {
      name: options.name ?? '',
      module: options.module,
      moduleType: options.moduleType,
      mimeType,
      objectKey: policy.objectKey
    }
  ])
  const attachment = attachments?.[0]
  if (!attachment || !Number.isInteger(attachment.id) || attachment.id <= 0) {
    throw new Error('附件登记失败：未返回有效的附件 ID')
  }
  return {
    id: attachment.id,
    objectKey: attachment.objectKey || policy.objectKey,
    response,
    formData
  }
}
