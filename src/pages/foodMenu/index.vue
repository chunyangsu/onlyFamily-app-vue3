<template>
  <view class="su-container food-menu">
    <view class="main">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-icon">
          <wd-icon name="search-line" size="24px"></wd-icon>
        </view>
        <view class="search-input">
          <input type="text" placeholder="搜索菜品名称" />
        </view>
      </view>
      <!-- 顶部菜单栏 -->
      <view class="top-nav">
        <view class="nav-item" @click="goToFoodOrder">
          <view class="nav-icon">
            <SuImage name="random-meal.png"></SuImage>
          </view>
          <view class="nav-name">随机套餐</view>
        </view>
        <view class="nav-item" @click="goToFoodOrder">
          <view class="nav-icon">
            <SuImage name="favorites.png"></SuImage>
          </view>
          <view class="nav-name">我的收藏</view>
        </view>
        <view class="nav-item" @click="goToFoodOrder">
          <view class="nav-icon">
            <SuImage name="order-manage.png"></SuImage>
          </view>
          <view class="nav-name">订单管理</view>
        </view>
        <view class="nav-item" @click="goToAddDish">
          <view class="nav-icon">
            <SuImage name="add-dish.png"></SuImage>
          </view>
          <view class="nav-name">添加菜品</view>
        </view>
      </view>
      <view class="order-food">
        <!-- 左侧分类 -->
        <scroll-view class="order-food-left" scroll-y :scroll-top="categoryScrollTop" scroll-with-animation
          :show-scrollbar="false" @scroll="onCategoryScroll" @touchmove.stop.prevent>
          <view class="category-list">
            <view v-for="item in categoryList" :id="`dish-category-${item.id}`" :key="item.id"
              :class="[activedCategory === item.id ? 'active' : '', 'cate-item']" @click="selectCategory(item.id)">
              <view class="cate-name">{{ item.name }}</view>
            </view>
          </view>
        </scroll-view>
        <!-- 右侧菜品列表 -->
        <view class="order-food-right">
          <view class="food-content-header">
            <view class="header-title">
              <view class="title-border"></view>
              <view class="title-text">全部菜品</view>
            </view>
            <view class="header-total">共{{ dishTotal }}道菜</view>
          </view>
          <scroll-view class="dish-scroll" scroll-y :scroll-top="dishScrollTop" :scroll-with-animation="false"
            :show-scrollbar="false" @scroll="onDishScroll" @touchstart="interruptScroll">
            <view v-if="!dishGroupList.length" class="list-status" @click="retryLoadMenu">
              {{ loading ? '加载中…' : loadError ? '加载失败，点击重试' : '暂无菜品分类' }}
            </view>
            <view v-else class="group-list">
              <view v-for="item in dishGroupList" :id="`dish-group-${item.categoryId}`" :key="item.categoryId"
                class="group-item">
                <view class="group-name">{{ item.categoryName }}</view>
                <view v-if="!item.dishList.length" class="empty-category">该分类暂无菜品</view>
                <view class="dish-list">
                  <view v-for="val in item.dishList" :key="val.id" class="dish-item">
                    <!-- 主图 -->
                    <view class="dish-img">
                      <SuImage :src="val.mainImageUrl"></SuImage>
                    </view>
                    <!-- 详情信息 -->
                    <view class="dish-content">
                      <view class="dish-name">{{ val.name }}</view>
                      <view class="dish-price">￥{{ val.price }}</view>
                      <view class="dish-btn-bar">
                        <view class="sale-num">销量：{{ val.saleNum }}</view>
                        <view class="cart-box">
                          <view v-if="val.cartNum > 0" class="minus-btn" @click="val.cartNum--">-</view>
                          <view v-if="val.cartNum > 0" class="cart-num">{{ val.cartNum }}</view>
                          <view class="plus-btn" @click="val.cartNum++">+</view>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              <view class="list-tail" :style="{ height: `${tailHeight}px` }" />
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
    <!-- 购物车 -->
    <view class="footer">
      <view class="footer-content">
        <view class="left-cart">
          <view class="cart-num">
            <view class="cart-icon">
              <SuImage name="cart.png"></SuImage>
            </view>
            <view class="dish-num">{{ selectedDishTotal }}</view>
          </view>
          <view class="cart-dish-type">共 {{ cartData.length }} 种菜品</view>
          <view class="cart-price">￥{{ cartPriceTotal }}</view>
        </view>
        <view class="right-btn" @click="goToConfirmOrder">下单</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// api
import { getDishCategoryListApi } from '@/api/modules/food/category'
import { getDishListApi } from '@/api/modules/food/dish'
// ts
import type { DishCategoryItem } from '@/pages/foodMenu/types'
import type { DishGroupItem, DishItem } from '@/api/modules/food/dish/types'

// 跳转"订单管理"页面
const goToFoodOrder = () => {
  uni.navigateTo({
    url: '/views/food/foodOrder/index'
  })
}
// 跳转"添加菜品"页面
const goToAddDish = () => {
  uni.navigateTo({
    url: '/views/food/addDish/index'
  })
}

interface FoodOrderDishItem {
  id: number // 菜品id
  name: string // 菜品名称
  mainImageUrl: string // 菜品主图url地址
  price: number // 价格
  num: number // 数量
}

// 跳转"确认订单"页面
const goToConfirmOrder = () => {
  if (cartData.value.length === 0) {
    uni.showToast({
      title: '请先选择菜品',
      icon: 'none'
    })
    return
  }
  const tempArr: FoodOrderDishItem[] = []
  cartData.value.forEach((item) => {
    tempArr.push({
      id: item.id,
      name: item.name,
      mainImageUrl: item.mainImageUrl,
      price: item.price,
      num: item.cartNum
    })
  })
  uni.navigateTo({
    url: '/views/food/confirmOrder/index',
    success(res) {
      res.eventChannel.emit('cartData', tempArr)
    }
  })
}

// 当前高亮分类，空列表时不选中
const activedCategory = ref<number | null>(null)
// 分类列表
const categoryList = ref<DishCategoryItem[]>([])
// 菜品分组列表
const dishGroupList = ref<DishGroupItem[]>([])
// 全部菜品数量
const dishTotal = ref(0)
// 首次加载及失败提示
const loading = ref(false)
const loadError = ref(false)
// 左右列表的滚动指令
const categoryScrollTop = ref(0)
const dishScrollTop = ref(0)
// 末尾留白，让最后一个分类也能置顶
const tailHeight = ref(0)
// 查询限定在当前页面内
const pageInstance = getCurrentInstance()

// 分类在滚动内容中的位置
interface CategoryPosition {
  id: number
  top: number
  height: number
}
// 节点测量结果
interface LayoutRect {
  top: number
  height: number
}
// 左右列表的位置缓存
let groupPositions: CategoryPosition[] = []
let categoryPositions: CategoryPosition[] = []
// 滚动事件反馈的实际位置
let actualDishTop = 0
let actualCategoryTop = 0
// 左侧滚动区域的可视高度
let categoryViewportHeight = 0
// 右侧最大滚动位置，恢复位置时防止越界
let maxDishTop = 0
// 当前程序滚动目标，避免动画途中的高亮闪跳
let scrollTarget: number | null = null
// 操作序号，过期的异步定位不再生效
let scrollVersion = 0
let layoutVersion = 0
let categoryVersion = 0
// 动画兜底和布局防抖定时器
let scrollTimer: ReturnType<typeof setTimeout> | undefined
let layoutTimer: ReturnType<typeof setTimeout> | undefined
// 可中断的逐帧动画，避免原生动画在触摸后继续滚动
let animationTimer: ReturnType<typeof setTimeout> | undefined
// 页面状态，阻止隐藏或卸载后的异步更新
let pageReady = false
let pageVisible = false
let disposed = false

// 清除定位状态，恢复滚动高亮联动
const clearScrollTarget = () => {
  clearTimeout(scrollTimer)
  clearTimeout(animationTimer)
  scrollTimer = undefined
  animationTimer = undefined
  scrollTarget = null
}

// 高亮项超出左侧可视区域时，平滑滚入视野
const revealCategory = async (id: number) => {
  const position = categoryPositions.find((item) => item.id === id)
  if (!position || !categoryViewportHeight) return
  const version = ++categoryVersion
  let top = actualCategoryTop
  if (position.top < actualCategoryTop) {
    top = position.top
  } else if (position.top + position.height > actualCategoryTop + categoryViewportHeight) {
    top = position.top + position.height - categoryViewportHeight
  }
  if (top === actualCategoryTop) return
  categoryScrollTop.value = actualCategoryTop
  await nextTick()
  if (version === categoryVersion && pageVisible && !disposed) categoryScrollTop.value = top
}

// 根据列表顶部所在分组更新高亮，容忍小数像素误差
const syncActiveCategory = (top: number) => {
  const position = [...groupPositions].reverse().find((item) => item.top <= top + 2) ?? groupPositions[0]
  if (!position) return
  if (activedCategory.value === position.id) return
  activedCategory.value = position.id
  void revealCategory(position.id)
}

// 缓存左侧实际滚动位置
const onCategoryScroll = (event: { detail: { scrollTop: number } }) => {
  actualCategoryTop = Math.max(0, event.detail.scrollTop)
}

// 用户滚动时联动分类，程序滚动时保持目标分类高亮
const onDishScroll = (event: { detail: { scrollTop: number } }) => {
  actualDishTop = Math.max(0, event.detail.scrollTop)
  if (scrollTarget !== null) {
    if (dishScrollTop.value !== scrollTarget || Math.abs(actualDishTop - scrollTarget) > 2) return
    clearScrollTarget()
  }
  syncActiveCategory(actualDishTop)
}

// 用户触摸时接管滚动，取消未完成的定位
const interruptScroll = () => {
  scrollVersion++
  clearScrollTarget()
  dishScrollTop.value = actualDishTop
  syncActiveCategory(actualDishTop)
}

// 批量测量相对内容起点的偏移，滚动过程中不查询节点
const measureLayout = async () => {
  const version = ++layoutVersion
  await nextTick()
  if (!pageReady || !pageVisible || disposed) return false
  return new Promise<boolean>((resolve) => {
    const query = uni.createSelectorQuery().in(pageInstance?.proxy)
    query.select('.dish-scroll').boundingClientRect()
    query.select('.group-list').boundingClientRect()
    query.selectAll('.group-item').boundingClientRect()
    query.select('.order-food-left').boundingClientRect()
    query.select('.category-list').boundingClientRect()
    query.selectAll('.cate-item').boundingClientRect()
    query.exec((result) => {
      if (version !== layoutVersion || !pageVisible || disposed) return resolve(false)
      const [viewport, content, groups, leftViewport, leftContent, categories] = result as [LayoutRect | null, LayoutRect | null, LayoutRect[], LayoutRect | null, LayoutRect | null, LayoutRect[]]
      if (!viewport?.height || !content || !leftViewport || !leftContent || groups.length !== dishGroupList.value.length || !groups.length || categories.length !== categoryList.value.length)
        return resolve(false)
      categoryViewportHeight = leftViewport.height
      groupPositions = groups.map((rect, index) => ({
        id: dishGroupList.value[index].categoryId,
        top: Math.max(0, rect.top - content.top),
        height: rect.height
      }))
      categoryPositions = categories.map((rect, index) => ({
        id: categoryList.value[index].id,
        top: Math.max(0, rect.top - leftContent.top),
        height: rect.height
      }))
      tailHeight.value = Math.max(0, Math.ceil(viewport.height - groups[groups.length - 1].height))
      const lastGroup = groupPositions[groupPositions.length - 1]
      maxDishTop = Math.max(0, lastGroup.top + lastGroup.height + tailHeight.value - viewport.height)
      resolve(true)
    })
  })
}

// 缓出动画逐帧定位，可随时切换目标或由手势打断
const scrollToPosition = async (top: number, animated: boolean) => {
  top = Math.max(0, Math.min(top, maxDishTop))
  const version = ++scrollVersion
  clearScrollTarget()
  scrollTarget = top
  dishScrollTop.value = actualDishTop
  await nextTick()
  if (version !== scrollVersion || !pageVisible || disposed) return
  if (!animated || Math.abs(actualDishTop - top) <= 2) {
    dishScrollTop.value = top
    actualDishTop = top
    clearScrollTarget()
    syncActiveCategory(top)
    return
  }
  const startTop = actualDishTop
  const startedAt = Date.now()
  const duration = Math.min(460, 240 + Math.abs(top - startTop) * 0.08)
  // 三次缓出让起步轻快、接近目标时自然减速
  const animate = () => {
    if (version !== scrollVersion || !pageVisible || disposed) return
    const progress = Math.min(1, (Date.now() - startedAt) / duration)
    dishScrollTop.value = startTop + (top - startTop) * (1 - (1 - progress) ** 3)
    if (progress < 1) {
      animationTimer = setTimeout(animate, 16)
    } else {
      // 缺少最终滚动事件时，兜底解除高亮锁定
      scrollTimer = setTimeout(() => {
        clearScrollTarget()
        syncActiveCategory(actualDishTop)
      }, 500)
    }
  }
  animate()
}

// 点击分类只定位，不重新请求或重排菜品
const selectCategory = async (id: number) => {
  const version = ++scrollVersion
  clearScrollTarget()
  activedCategory.value = id
  void revealCategory(id)
  if (!groupPositions.length && !(await measureLayout())) return
  if (version !== scrollVersion || !pageVisible || disposed) return
  const position = groupPositions.find((item) => item.id === id)
  if (position) await scrollToPosition(position.top, true)
}

// 布局变化后保留分类和组内位置
const refreshLayout = async () => {
  const activeId = activedCategory.value
  const previous = groupPositions.find((item) => item.id === activeId)
  const offset = previous ? Math.max(0, actualDishTop - previous.top) : 0
  interruptScroll()
  const version = scrollVersion
  if (!(await measureLayout()) || version !== scrollVersion) return
  const position = groupPositions.find((item) => item.id === activeId) ?? groupPositions[0]
  await scrollToPosition(position.top + Math.min(offset, Math.max(0, position.height - 3)), false)
  void revealCategory(position.id)
}

// 窗口变化后防抖测量，页面高度由固定定位自动适配
const onMenuResize = () => {
  clearTimeout(layoutTimer)
  layoutTimer = setTimeout(() => {
    void refreshLayout()
  }, 100)
}

// 串行加载分类和菜品，保留空分类及已有选购数量
const loadMenu = async () => {
  if (loading.value || disposed) return
  loading.value = true
  loadError.value = false
  try {
    const categories = (await getDishCategoryListApi()) as DishCategoryItem[]
    const response = categories.length ? await getDishListApi({ name: '', categoryIds: categories.map((item) => item.id).join() }) : { list: [], total: 0 }
    if (disposed) return
    const groups = new Map(response.list.map((item) => [item.categoryId, item]))
    const previousDishes = new Map(dishGroupList.value.flatMap((item) => item.dishList).map((item) => [item.id, item]))
    const activeId = activedCategory.value
    const previous = groupPositions.find((item) => item.id === activeId)
    const offset = previous && categories.some((item) => item.id === activeId) ? Math.max(0, actualDishTop - previous.top) : 0
    interruptScroll()
    const version = scrollVersion
    categoryList.value = categories.map((item) => ({ id: item.id, name: item.name }))
    dishGroupList.value = categories.map((item) => ({
      categoryId: item.id,
      categoryName: item.name,
      dishList: (groups.get(item.id)?.dishList ?? []).map((dish) => ({
        ...dish,
        saleNum: dish.saleNum ?? 0,
        cartNum: previousDishes.get(dish.id)?.cartNum ?? 0
      }))
    }))
    dishTotal.value = response.total
    activedCategory.value = categories.some((item) => item.id === activeId) ? activeId : (categories[0]?.id ?? null)
    groupPositions = []
    categoryPositions = []
    tailHeight.value = 0
    if (!categories.length) {
      actualDishTop = 0
      actualCategoryTop = 0
      maxDishTop = 0
      dishScrollTop.value = 0
      categoryScrollTop.value = 0
    } else if ((await measureLayout()) && version === scrollVersion) {
      const position = groupPositions.find((item) => item.id === activedCategory.value) ?? groupPositions[0]
      await scrollToPosition(position.top + Math.min(offset, Math.max(0, position.height - 3)), false)
      void revealCategory(position.id)
    }
  } catch (error) {
    if (!disposed) loadError.value = true
    console.warn('菜单加载失败', error)
  } finally {
    if (!disposed) loading.value = false
  }
}

// 空页面加载失败时允许点击重试
const retryLoadMenu = () => {
  if (loadError.value) void loadMenu()
}

// 已选菜品数量的总计
const selectedDishTotal = computed(() => {
  let total = 0
  dishGroupList.value.forEach((item) => {
    if (item.dishList.length > 0) {
      item.dishList.forEach((val) => {
        if (val.cartNum > 0) {
          total += val.cartNum
        }
      })
    }
  })
  return total
})

// 购物车数据(已选菜品)
const cartData = computed(() => {
  let tempArr: DishItem[] = []
  dishGroupList.value.forEach((item) => {
    if (item.dishList.length > 0) {
      item.dishList.forEach((val) => {
        if (val.cartNum > 0) {
          tempArr.push(val)
        }
      })
    }
  })
  return tempArr
})

// 计算购物车总价
const cartPriceTotal = computed(() => {
  let total = 0
  dishGroupList.value.forEach((item) => {
    if (item.dishList.length > 0) {
      item.dishList.forEach((val) => {
        if (val.cartNum > 0) {
          total += val.cartNum * val.price
        }
      })
    }
  })
  return total.toFixed(2)
})

// 每次进入统一加载，避免 onLoad 与 onShow 重复请求
onShow(() => {
  pageVisible = true
  void loadMenu()
  if (pageReady) void refreshLayout()
})

// 首屏节点就绪后测量，兼容接口提前返回
onReady(() => {
  pageReady = true
  void refreshLayout()
})

// 隐藏页面时取消动画和未完成的测量
onHide(() => {
  interruptScroll()
  pageVisible = false
  layoutVersion++
  clearTimeout(layoutTimer)
})

// 监听屏幕尺寸变化，卸载时释放资源
uni.onWindowResize(onMenuResize)
onUnload(() => {
  disposed = true
  pageVisible = false
  scrollVersion++
  layoutVersion++
  clearScrollTarget()
  clearTimeout(layoutTimer)
  uni.offWindowResize(onMenuResize)
})
</script>

<style lang="scss" scoped>
.food-menu {
  // 脱离文档流，避免页面容器被内容撑出滚动条
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;

  .main {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
}

.search-bar {
  flex-shrink: 0;
  display: flex;
  background-color: #fff;
  border-radius: 32rpx;
  border: 2rpx solid $line;
  padding: 8rpx 16rpx;
  margin: 0 24rpx;

  .search-input {
    flex: 1;
    margin-left: 16rpx;
  }
}

.top-nav {
  flex-shrink: 0;
  margin: 0 24rpx;
  margin-top: 32rpx;
  display: flex;
  gap: 24rpx;

  .nav-item {
    flex: 1;
    background-color: #f0f1e1;
    border-radius: 24rpx;
    padding: 24rpx 0;
    text-align: center;

    .nav-icon {
      width: 60rpx;
      height: 60rpx;
      line-height: 58rpx;
      text-align: center;
      margin: 0 auto;
    }

    .nav-name {
      color: $textDefault;
    }
  }
}

.order-food {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin-top: 40rpx;
  margin-right: 24rpx;

  // 左侧分类
  .order-food-left {
    width: 150rpx;
    flex: 0 0 150rpx;
    height: 100%;
    overflow: hidden;

    .category-list {
      padding-bottom: 16rpx;
    }

    .cate-item {
      box-sizing: border-box;
      text-align: center;
      padding: 32rpx 0;
      border-left: 8rpx solid $pageBg;
      border-radius: 0 16rpx 16rpx 0;
      transition:
        background-color 0.2s ease,
        border-color 0.2s ease;

      .cate-name {
        color: $textLight;
        transition: color 0.2s ease;
        overflow-wrap: break-word;
      }
    }

    .cate-item.active {
      border-left: 8rpx solid $theme;
      background-color: $themeBg;

      .cate-name {
        color: $theme;
      }
    }
  }

  // 右侧菜品列表

  .order-food-right {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    min-height: 0;
    height: 100%;
    margin-left: 24rpx;

    .food-content-header {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      margin-bottom: 24rpx;

      .header-title {
        display: flex;

        .title-border {
          background-color: $theme;
          width: 8rpx;
          height: 100%;
          margin-right: 16rpx;
          border-radius: 8rpx;
        }

        .title-text {
          color: $textDark;
          font-weight: bold;
        }
      }

      .header-total {
        color: $textLight;
      }
    }

    .dish-scroll {
      flex: 1;
      height: 0;
      min-height: 0;
      overflow: hidden;
    }

    .list-status,
    .empty-category {
      padding: 48rpx 12rpx;
      text-align: center;
      font-size: 26rpx;
      color: $textLight;
    }

    .group-list {
      .group-item {
        display: flex;
        flex-direction: column;
        padding-bottom: 24rpx;

        .group-name {
          color: $textLight;
          line-height: 44rpx;
        }

        .dish-list {
          margin-top: 8rpx;

          .dish-item {
            display: flex;
            margin-bottom: 16rpx;

            .dish-img {
              flex-shrink: 0;
              width: 160rpx;
              height: 160rpx;
              text-align: center;
              line-height: 156rpx;
              background-color: #666;
              color: #fff;
              border-radius: 16rpx;
              overflow: hidden;
            }

            .dish-content {
              flex: 1;
              min-width: 0;
              padding: 0 20rpx;

              .dish-name {
                overflow-wrap: break-word;
                font-weight: bold;
                color: $textDark;
              }

              .dish-price {
                font-size: 28rpx;
                margin-top: 8rpx;
                font-size: 32rpx;
                color: $theme;
              }
            }

            .dish-btn-bar {
              margin-top: 8rpx;
              display: flex;
              align-items: center;

              .sale-num {
                flex: 1;
                font-size: 28rpx;
                color: $textLight;
              }

              .cart-box {
                display: flex;

                .minus-btn {
                  width: 40rpx;
                  height: 40rpx;
                  line-height: 30rpx;
                  text-align: center;
                  color: $textDefault;
                  background-color: #fff;
                  font-size: 46rpx;
                  border-radius: 50%;
                  border: 2rpx solid $theme;
                }

                .cart-num {
                  margin: 0 16rpx;
                }

                .plus-btn {
                  width: 44rpx;
                  height: 44rpx;
                  line-height: 38rpx;
                  text-align: center;
                  color: white;
                  background-color: $theme;
                  font-size: 36rpx;
                  border-radius: 50%;
                }
              }
            }
          }
        }
      }
    }
  }
}

.footer {
  // 在固定页面内占据底部空间，不随菜品列表滚动
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  padding-top: 16rpx;
  padding-bottom: 12rpx;

  .footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 50rpx;
    padding: 16rpx;
    background-color: #f0f1e1;
    margin: 0 24rpx;

    .left-cart {
      display: flex;
      align-items: center;

      .cart-num {
        position: relative;

        .cart-icon {
          width: 70rpx;
          height: 70rpx;
          line-height: 68rpx;
          text-align: center;
        }

        .dish-num {
          position: absolute;
          top: -4rpx;
          right: -24rpx;
          color: #fff;
          background-color: $theme;
          border-radius: 24rpx;
          padding: 0 12rpx 2rpx 12rpx;
        }
      }

      .cart-dish-type {
        margin-left: 38rpx;
      }

      .cart-price {
        margin-left: 24rpx;
      }
    }

    .right-btn {
      color: #fff;
      background-color: $theme;
      border-radius: 50rpx;
      padding: 16rpx 52rpx 20rpx 52rpx;
    }
  }
}
</style>
