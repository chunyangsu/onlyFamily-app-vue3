import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '..')
// 原始图片目录
const SOURCE_DIR = path.join(ROOT_DIR, 'src/static/images')
// 转换后图片目录
const OUTPUT_DIR = path.join(ROOT_DIR, 'src/static/images-webp')

async function getImages(dir) {
  const entries = await fs.readdir(dir, {
    withFileTypes: true
  })

  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await getImages(fullPath)))
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

async function convertImages() {
  const images = await getImages(SOURCE_DIR)

  let totalBefore = 0
  let totalAfter = 0

  for (const input of images) {
    try {
      // 保留原有目录结构
      const relativePath = path.relative(SOURCE_DIR, input)

      const output = path.join(OUTPUT_DIR, relativePath.replace(/\.(png|jpe?g)$/i, '.webp'))

      await fs.mkdir(path.dirname(output), {
        recursive: true
      })

      const stats = await fs.stat(input)

      const pipeline = sharp(input).webp({
        // quality: 90, // 压缩配置
        // alphaQuality: 100
        lossless: true, // 无损压缩
        effort: 6,
        nearLossless: false
      })

      await pipeline.toFile(output)

      const outputStats = await fs.stat(output)

      totalBefore += stats.size
      totalAfter += outputStats.size

      console.log(`${relativePath}: ` + `${(stats.size / 1024).toFixed(2)}KB -> ` + `${(outputStats.size / 1024).toFixed(2)}KB`)
    } catch (error) {
      console.error(`转换失败：${input}`, error.message)
    }
  }

  console.log('\n转换完成')
  console.log(`图片数量：${images.length}`)
  console.log(`转换前：${(totalBefore / 1024).toFixed(2)}KB`)
  console.log(`转换后：${(totalAfter / 1024).toFixed(2)}KB`)

  if (totalBefore > 0) {
    console.log(`压缩率：${((1 - totalAfter / totalBefore) * 100).toFixed(2)}%`)
  }
}

convertImages()
