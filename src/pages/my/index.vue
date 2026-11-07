<template>
  <view class="su-container my-container">
    <view class="card-item">
      <SuCard hide-header>
        <view class="user-profile">
          <view class="avatar">
            <SuImage name="卡卡西和凯.jpg"></SuImage>
          </view>
          <view class="user-info">
            <view class="nickname">青春尽情挥霍</view>
            <view class="mobile">手机号：13057160969</view>
            <!-- todo：编辑功能 -->
          </view>
        </view>
      </SuCard>
    </view>
    <!-- 家庭管理 -->
    <view class="card-item">
      <SuCard hide-header>
        <view class="family">
          <view class="f-header">
            <view class="f-icon">
              <SuImage name="home-active.png"></SuImage>
            </view>
            <view class="f-content">
              <view class="f-name">爱的小家</view>
              <view class="member-num">成员：3人</view>
            </view>
            <view class="f-edit">
              <view class="f-role">管理员</view>
              <view class="f-arrow">
                <wd-icon name="right" size="32rpx"></wd-icon>
              </view>
            </view>
          </view>
          <view class="nav-menu">
            <view class="nav-item">
              <view class="nav-icon">
                <SuImage name="favorites.png"></SuImage>
              </view>
              <view class="nav-name">成员管理</view>
            </view>
            <view class="nav-item">
              <view class="nav-icon">
                <SuImage name="favorites.png"></SuImage>
              </view>
              <view class="nav-name">邀请成员</view>
            </view>
            <view class="nav-item">
              <view class="nav-icon">
                <SuImage name="favorites.png"></SuImage>
              </view>
              <view class="nav-name">创建家庭</view>
            </view>
            <view class="nav-item">
              <view class="nav-icon">
                <SuImage name="favorites.png"></SuImage>
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
            <view class="item-icon">
              <SuImage name="chef-hat.png"></SuImage>
            </view>
            <view class="item-name">我的菜谱</view>
            <view class="item-arrow">
              <wd-icon name="right" size="28rpx"></wd-icon>
            </view>
          </view>
          <view class="list-item">
            <view class="item-icon">
              <SuImage name="chef-hat.png"></SuImage>
            </view>
            <view class="item-name">我的收藏</view>
            <view class="item-arrow">
              <wd-icon name="right" size="28rpx"></wd-icon>
            </view>
          </view>
          <view class="list-item">
            <view class="item-icon">
              <SuImage name="chef-hat.png"></SuImage>
            </view>
            <view class="item-name">我的订单</view>
            <view class="item-arrow">
              <wd-icon name="right" size="28rpx"></wd-icon>
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
            <view class="item-icon">
              <SuImage name="chef-hat.png"></SuImage>
            </view>
            <view class="item-name">消息通知</view>
            <view class="item-arrow">
              <wd-icon name="right" size="28rpx"></wd-icon>
            </view>
          </view>
          <view class="list-item">
            <view class="item-icon">
              <SuImage name="chef-hat.png"></SuImage>
            </view>
            <view class="item-name">隐私与账号安全</view>
            <view class="item-arrow">
              <wd-icon name="right" size="28rpx"></wd-icon>
            </view>
          </view>
          <view class="list-item">
            <view class="item-icon">
              <SuImage name="chef-hat.png"></SuImage>
            </view>
            <view class="item-name">用户服务协议与隐私政策</view>
            <view class="item-arrow">
              <wd-icon name="right" size="28rpx"></wd-icon>
            </view>
          </view>
          <view class="list-item">
            <view class="item-icon">
              <SuImage name="chef-hat.png"></SuImage>
            </view>
            <view class="item-name">意见反馈</view>
            <view class="item-arrow">
              <wd-icon name="right" size="28rpx"></wd-icon>
            </view>
          </view>
          <view class="list-item">
            <view class="item-icon">
              <SuImage name="chef-hat.png"></SuImage>
            </view>
            <view class="item-name">关于 OnlyFamily</view>
            <view class="item-arrow">
              <wd-icon name="right" size="28rpx"></wd-icon>
            </view>
          </view>
        </view>
      </SuCard>
    </view>
    <!-- 底部 -->
    <view class="footer">
      <view class="logout">
        <view class="logout-icon">
          <SuImage name="login-phone.png"></SuImage>
        </view>
        <view class="logout-text">退出登录</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// import { ref } from 'vue'
</script>

<style lang="scss" scoped>
.my-container {
  padding: 0 24rpx;
  padding-bottom: 24rpx;

  .card-item {
    margin-bottom: 24rpx;
  }

  // 用户资料
  .user-profile {
    display: flex;

    .avatar {
      width: 130rpx;
      height: 130rpx;
      line-height: 126rpx;
      text-align: center;
      border-radius: 50%;
      overflow: hidden;
    }

    .user-info {
      margin-left: 24rpx;
      margin-top: 16rpx;

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
  }

  // 家庭管理
  .family {
    .f-header {
      display: flex;

      .f-icon {
        width: 100rpx;
        height: 100rpx;
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
        padding: 12rpx 0;

        .nav-icon {
          width: 80rpx;
          height: 80rpx;
        }

        .nav-name {
          color: $textLight;
        }
      }
    }
  }

  // 我的管理
  .manage {}

  // 其他设置
  .setting {}

  // 列表行(通用)
  .list-item {
    display: flex;
    align-items: center;
    padding: 12rpx 0;
    border-top: 2rpx solid $line;

    .item-icon {
      width: 60rpx;
      height: 60rpx;
    }

    .item-name {
      flex: 1;
      margin-left: 24rpx;
    }

    .item-arrow {
      display: flex;
      color: $textLight;
      // margin-left: 8rpx;
      // padding-top: 6rpx;
    }
  }

  .footer {
    .logout {
      display: flex;
      justify-content: center;
      background-color: #e8eddf;
      padding: 18rpx 0;
      border-radius: 50rpx;

      .logout-icon {
        width: 40rpx;
        height: 56rpx;
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
