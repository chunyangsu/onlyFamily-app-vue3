<template>
  <view class="su-container personal-profile">
    <view class="main">
      <view class="card-item">
        <view class="basic-info">
          <!-- 头像 -->
          <view class="row-item">
            <view class="item-left">头像</view>
            <view class="item-right">
              <view class="right-value">
                <view class="avatar-area">
                  <view class="avatar-icon">
                    <SuImage name="avatar.webp" />
                  </view>
                </view>
              </view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
          <!-- 昵称 -->
          <view class="row-item">
            <view class="item-left">昵称</view>
            <view class="item-right">
              <view class="right-value">{{ userStore.userInfo.nickname }}</view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
          <!-- 性别 -->
          <view class="row-item">
            <view class="item-left">性别</view>
            <view class="item-right">
              <view class="right-value no-set">未设置</view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
          <!-- 手机号 -->
          <view class="row-item">
            <view class="item-left">手机号</view>
            <view class="item-right">
              <view class="right-value no-set">未绑定</view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
          <!-- 邮箱 -->
          <view class="row-item">
            <view class="item-left">邮箱</view>
            <view class="item-right">
              <view class="right-value no-set">未绑定</view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 底部 -->
    <view class="footer">
      <view class="logout" @click="handleLogout">
        <view class="logout-icon">
          <SuImage name="logout.webp" />
        </view>
        <view class="logout-text">退出登录</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 全局属性
import { useUserStore } from '@/stores/useUserStore'
// api
// ts
// utils
const userStore = useUserStore()

// 退出登录
const handleLogout = () => {
  userStore.logout()
}
</script>

<style lang="scss" scoped>
.personal-profile {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 0 24rpx;
  padding-bottom: env(safe-area-inset-bottom);
  .main {
    .card-item {
      background-color: #fff;
      border-radius: 24rpx;
      padding: 0 24rpx;
      margin-bottom: 24rpx;
    }

    // 列表行(通用)
    .row-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100rpx;
      border-top: 2rpx solid $line;
      font-size: 32rpx;
      .item-left {
        color: $textGrey;
      }
      .item-right {
        display: flex;
        align-items: center;
        .right-value {
          color: $textDefault;
        }
        .no-set {
          color: $textLight;
        }

        .right-arrow {
          display: flex;
          color: $textLight;
          margin-left: 24rpx;
        }
      }
    }
    .row-item:first-child {
      border-top: 0;
    }
    .avatar-area {
      width: 70rpx;
      height: 70rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      overflow: hidden;
      background-color: $subBg;

      .avatar-icon {
        width: 64rpx;
        height: 70rpx;
      }
    }
  }
  .footer {
    margin-top: auto;
    flex-shrink: 0;

    .logout {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e8eddf;
      padding: 18rpx 0;
      border-radius: 50rpx;

      .logout-icon {
        width: 36rpx;
        height: 34rpx;
      }

      .logout-text {
        color: $sub;
        font-size: 32rpx;
        margin-left: 12rpx;
      }
    }
  }
}
</style>
