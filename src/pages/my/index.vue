<template>
  <view class="su-container my-container">
    <view class="bg-img">
      <!-- <SuImage name="my-bg.webp" /> -->
    </view>
    <view class="content">
      <view class="card-item">
        <!-- <SuCard hide-header> -->
        <view class="user-profile">
          <view class="avatar-area">
            <SuAvatar :id="userStore.userInfo.avatarId" :src="userStore.userInfo.avatarUrl" :expires-time="userStore.userInfo.expiresTime" refresh-expires-time @refresh="userStore.updateUserAvatar" />
          </view>
          <view class="user-info">
            <view class="nickname">{{ userStore.userInfo.nickname }}</view>
            <!-- <view class="mobile">手机号：13057160969</view> -->
          </view>
          <view class="setting-btn" @click="goToPersonalProfile">
            <SuImage name="my-setting.webp" />
          </view>
        </view>
        <!-- </SuCard> -->
      </view>
      <!-- 家庭管理 -->
      <view class="card-item">
        <SuCard hide-header>
          <view class="family">
            <view class="f-header">
              <view class="f-icon">
                <SuImage v-if="userStore.familyInfo.avatarId > 0" :src="userStore.familyInfo.avatarUrl" />
                <SuImage v-else name="family-home.webp" />
              </view>
              <view class="f-content">
                <view class="f-name">{{ userStore.familyInfo.name }}</view>
                <view class="member-num">成员：3人</view>
              </view>
              <view class="f-edit" @click="goToFamilyManage">
                <view class="f-role">管理员</view>
                <view class="f-arrow">
                  <wd-icon name="right" size="32rpx" />
                </view>
              </view>
            </view>
            <view class="nav-menu">
              <view class="nav-item">
                <view class="nav-icon">
                  <view class="h-42rpx m-t-6rpx">
                    <SuImage name="family-members.webp" />
                  </view>
                </view>
                <view class="nav-name">成员管理</view>
              </view>
              <view class="nav-item" @click="joinFamily">
                <view class="nav-icon">
                  <SuImage name="family-invite.webp" />
                </view>
                <view class="nav-name">邀请成员</view>
              </view>
              <view class="nav-item" @click="createFamily">
                <view class="nav-icon">
                  <SuImage name="family-create.webp" />
                </view>
                <view class="nav-name">创建家庭</view>
              </view>
              <view class="nav-item">
                <view class="nav-icon">
                  <SuImage name="family-switch.webp" />
                </view>
                <view class="nav-name">我的家庭</view>
              </view>
            </view>
          </view>
        </SuCard>
      </view>
      <!-- 我的管理 -->
      <view class="card-item">
        <SuCard title="我的管理">
          <view class="manage">
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-48rpx">
                  <SuImage name="chef-hat.webp" />
                </view>
              </view>
              <view class="item-name">我的菜谱</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-50rpx h-44rpx">
                  <SuImage name="favorite.webp" />
                </view>
              </view>
              <view class="item-name">我的收藏</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-48rpx">
                  <SuImage name="order.webp" />
                </view>
              </view>
              <view class="item-name">我的订单</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
        </SuCard>
      </view>
      <!-- 其他设置 -->
      <view class="card-item">
        <SuCard title="其他设置">
          <view class="setting">
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-48rpx">
                  <SuImage name="notification.webp" />
                </view>
              </view>
              <view class="item-name">消息通知</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-54rpx">
                  <SuImage name="security.webp" />
                </view>
              </view>
              <view class="item-name">隐私与账号安全</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-48rpx">
                  <SuImage name="policy.webp" />
                </view>
              </view>
              <view class="item-name">用户服务协议与隐私政策</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-52rpx h-48rpx">
                  <SuImage name="feedback.webp" />
                </view>
              </view>
              <view class="item-name">意见反馈</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-48rpx">
                  <SuImage name="about.webp" />
                </view>
              </view>
              <view class="item-name">关于 OnlyFamily</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
        </SuCard>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 全局属性
import { useUserStore } from '@/stores/useUserStore'
// api
import { joinFamilyApi } from '@/api/modules/family'
// ts
// import type { FamilyForm } from '@/api/modules/family/types'
// utils

const userStore = useUserStore()

// 跳转"个人资料"页面
const goToPersonalProfile = () => {
  uni.navigateTo({
    url: '/views/my/personalProfile/index'
  })
}

// 跳转"家庭管理"页面
const goToFamilyManage = () => {
  uni.navigateTo({
    url: '/views/my/familyManage/index'
  })
}

// 加入家庭
const joinFamily = () => {
  const params = {
    familyId: 1
  }
  joinFamilyApi(params).then((response) => {
    if (response.memberId > 0) {
      userStore.familyInfo.id = response.familyId
      uni.showToast({
        title: '加入成功',
        icon: 'success'
      })
    }
  })
}

// 新建家庭
const createFamily = () => {
  // const params: FamilyForm = {
  //   name: '苏春阳的家庭',
  //   introduction: '昵称是狗窝'
  // }
  // createFamilyApi(params).then((response) => { })
}

onShow(async () => {
  console.log(userStore.familyInfo)
})
</script>

<style lang="scss" scoped>
.my-container {
  position: relative;
  min-height: 100vh;
  padding: 0 24rpx;
  padding-bottom: 24rpx;

  .bg-img {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
}

.content {
  .card-item {
    margin-bottom: 24rpx;
  }

  // 用户资料
  .user-profile {
    display: flex;
    align-items: center;

    .avatar-area {
      width: 110rpx;
      height: 110rpx;
    }

    .user-info {
      flex: 1;
      margin-left: 24rpx;

      .nickname {
        color: $textDefault;
        font-size: 34rpx;
        font-weight: bold;
      }

      .mobile {
        color: $textLight;
        margin-top: 6rpx;
      }
    }

    .setting-btn {
      width: 40rpx;
      height: 40rpx;
    }
  }

  // 家庭管理
  .family {
    .f-header {
      display: flex;

      .f-icon {
        width: 90rpx;
        height: 90rpx;
        border-radius: 12rpx;
        overflow: hidden;
      }

      .f-content {
        flex: 1;
        margin-left: 24rpx;

        .f-name {
          color: $textDefault;
          font-size: 32rpx;
          font-weight: bold;
        }

        .member-num {
          color: $textLight;
        }
      }

      .f-edit {
        display: flex;
        align-items: center;

        .f-role {
          width: 124rpx;
          height: 56rpx;
          line-height: 52rpx;
          text-align: center;
          border-radius: 28rpx;
          color: #61785b;
          background-color: #e8eddf;
        }

        .f-arrow {
          display: flex;
          margin-left: 8rpx;
          color: $textLight;
        }
      }
    }

    .nav-menu {
      display: flex;
      background-color: $pageBg;
      margin-top: 12rpx;

      .nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20rpx 0;

        .nav-icon {
          width: 50rpx;
          height: 50rpx;
        }

        .nav-name {
          color: $textLight;
          margin-top: 8rpx;
        }
      }
    }
  }

  // 我的管理
  .manage {
  }

  // 其他设置
  .setting {
  }

  // 列表行(通用)
  .list-item {
    display: flex;
    align-items: center;
    height: 80rpx;
    border-top: 2rpx solid $line;

    .item-left {
      width: 60rpx;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;

      .item-icon {
        // width: 48rpx;
        // height: 48rpx;
      }
    }

    .item-name {
      flex: 1;
      margin-left: 24rpx;
    }

    .item-arrow {
      display: flex;
      color: $textLight;
    }
  }
}
</style>
