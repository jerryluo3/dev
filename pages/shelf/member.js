// pages/member/member.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pophide: 'hide',
    vippophide: 'hide',
    year_price:0,
    year_vipprice:0, 
    mobile:'', 
    unpay_nums:0,
    unsend_nums: 0,
    uncollect_nums: 0,
    unfinish_nums: 0, 
    user:[],
    uid:''
  },

  getPhoneNumber: function (e) {
    var that = this
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权',
        success: function (res) { }
      })
    } else {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '同意授权',
        success: function (res) {
          wx.login({
            success: function (res) {
              var code = res.code
              var url = app.util.url('qiyue/userAuthMobile');
              var uid = wx.getStorageSync("uid");
              wx.request({
                url: url,
                data: {
                  uid: uid,
                  code: code,
                  iv: e.detail.iv,
                  encryptedData: e.detail.encryptedData,
                },
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: 'POST',
                success: function (res) {
                  
                  if (res.data.status == 200) {

                    //console.log(res)
                    wx.showToast({
                      title: '处理成功',
                      icon: 'success',
                      duration: 1000
                    })
                    that.getUserInfo(uid);

                  } else {
                    console.log(res)
                    wx.showToast({
                      title: '处理失败',
                      icon: 'loading',
                      duration: 1000
                    })
                  }

                }
              })
            }
          });
        }
      })
      
    }
  },

  //跳转页面
  jumpUrl:function(e){
    var that = this
    var userInfo = wx.getStorageSync("userInfo");
    if (userInfo == '') {
      that.popAuth();
      return false;
    }
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },

  vipOrder: function (e) {
    var that = this;
    var uid = wx.getStorageSync("uid");

    if (uid > 0) {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 1000
      })
      var url = app.util.url('qiyue/vipOrder');
      wx.request({
        url: url,
        data: {
          uid: uid
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: function (res) {
          console.log(res)
          if (res.data.status == 200) {           

            //调用支付
            that.weixinPay(res.data.oid, uid);


          } else {
            wx.showToast({
              title: '下单失败',
              icon: 'fail',
              duration: 1000
            })
          }

        }
      })

    } else {
      app.getUserDataToken();
    }
  },

  weixinPay: function (oid, uid) {
    var that = this;
    var url = app.util.url('qiyue/vippayfee')
    wx.request({
      url: url,
      data: {
        uid: uid,
        oid: oid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function (res) {
        //console.log(res.data);
        console.log('调起支付');
        wx.requestPayment({
          'timeStamp': res.data.timeStamp,
          'nonceStr': res.data.nonceStr,
          'package': res.data.package,
          'signType': 'MD5',
          'paySign': res.data.paySign,
          'success': function (res) {
            console.log('success');
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 2000,
              success(ress) {
                setTimeout(function () {
                  wx.navigateTo({
                    url: '/pages/member/member?refresh=1'
                  })
                }, 2000) //延迟时间
              }
            });
            //that.getCartList();
          },
          'fail': function (res) {
            console.log('fail');
          },
          'complete': function (res) {
            console.log('complete');
          }
        });
      },
      fail: function (res) {
        console.log(res.data)
      }
    });
  },

  //成为VIP弹出框
  vipPOP:function(){
    var that = this
    var userInfo = wx.getStorageSync("userInfo");
    if(userInfo == ''){
      that.popAuth();
    }else{
      that.setData({ vippophide: '' });
    }
  },

  closevipPOP: function () {
    var that = this
    that.setData({ vippophide: 'hide' });
  },

  //获取会员信息
  getUserInfo:function(uid){
    var that = this
    var url = app.util.url('qiyue/getUserInfo/' + uid);
    wx.request({
      url: url,
      data: {},
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        that.setData({
          uid: res.data.user.mem_id,
          user: res.data.user,
          mobile: app.util.hidePhoneNumber(res.data.user.mem_mobile)
        })
        wx.setStorageSync("uid", res.data.user.mem_id);
        wx.setStorageSync("userInfo", res.data.user);
      }
    });
  },

  //获取状态订单数量信息
  getOrderStatusNums: function () {
    var that = this
    var uid = wx.getStorageSync("uid");
    var url = app.util.url('qiyue/getOrderStatusNums/');
    wx.request({
      url: url,
      data: {
        uid: uid
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        that.setData({
          unpay_nums: res.data.unpay_nums,
          unsend_nums: res.data.unsend_nums,
          uncollect_nums: res.data.uncollect_nums,
          unfinish_nums: res.data.unfinish_nums, 
        })

      }
    });
  },

  //弹出需要授权层
  popAuth: function () {
    var that = this
    that.setData({ pophide: '' });
  },

  closeAuth: function () {
    var that = this
    that.setData({ pophide: 'hide' });
  },

  userInfoHandler: function (e) {
    
    wx.getSetting({
      success(res) {
        console.log(res);
        if (!res.authSetting['scope.userInfo']) {
          console.log('------没有授权----')
        }else{
          app.checkUserLogin(e.detail);
          //console.log(e.type.detail)
        }
      }
    })
    
    var that = this
    
    that.closeAuth();
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000,
      success(ress) {
        setTimeout(function () {
          var uid = wx.getStorageSync("uid");
          console.log('---------' + uid)
          //that.getUserInfo(uid);
          var url = '/pages/member/member';
          wx.reLaunch({
            url: url
          })
        }, 2000) //延迟时间
      }
    })
    
    
  },

  getYearVipInfo:function(){
    var that = this
    var url = app.util.url('qiyue/getYearVipInfo/');
    wx.request({
      url: url,
      data: { },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        console.log(res);
        that.setData({
          year_price: res.data.year_price,
          year_vipprice: res.data.year_vipprice,
        })

      }
    });
  },

  bindGetUserInfo:function(){
    wx.getSetting({
      success(res) {
        console.log(res);
        if (!res.authSetting['scope.userInfo']) {
          console.log('------没有授权----')
        } else {
          app.checkUserLogin(e.detail);
          //console.log(e.type.detail)
        }
      }
    })
  },


  getUserInfoF: function () {

    var that = this;
    wx.getSetting({

      success: (res) => {
        wx.getUserInfo({
          success: res => {            
            this.globalData.userInfo = res.userInfo
            console.log("一开始同意授权" + res.userInfo.nickName);
          },
          fail(err) {
            console.info(err.errMsg);
            wx.showModal({
              title: '警告',
              cancelText: '不授权',
              confirmText: '授权',
              confirmColor: '#37C31A',
              content: '若不授权微信登录，则无法使用栖约惠生活；点击重新获取授权，则可重新使用；' +
              '若点击不授权，将无法使用便捷服务。',

              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success: (res) => {
                      if (res.authSetting['scope.userInfo']) {
                        wx.getUserInfo({
                          success: res => {
                            that.globalData.userInfo = res.userInfo
                            console.log("再次同意授权" + res.userInfo.nickName);
                          }
                        })
                      } else {
                        console.info("再次不允许");
                        wx.redirectTo({
                          url: 'home',
                        })
                      }
                    }
                  });
                } else if (res.cancel) {
                  console.log('弹出框用户点击取消')
                  wx.redirectTo({
                    url: 'home',
                  })

                }
              }
            })

          }

        })

      }
    })
  },

    indexScan: app.tapScan,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的'
    })
    var that = this
    app.util.footer(that);

    var refresh = options.refresh
    var uid = wx.getStorageSync("uid");
    var userInfo = wx.getStorageSync("userInfo");
    
    if (refresh == 1){
      that.getUserInfo(uid)
    }else{
      
        if(uid > 0){
          that.setData({
            uid: uid,
            user: userInfo,
            mobile: app.util.hidePhoneNumber(userInfo.mem_mobile)
          })

        }else{
          wx.getSetting({
            success(res) {
              console.log(res);
              if (!res.authSetting['scope.userInfo']) {
                console.log('------没有授权----')
                that.popAuth();
              }
            }
          })
        }
    }

    var openvip = options.openvip;
    if (openvip == 1 && userInfo.mem_type == 0){
      that.vipPOP();
    }

    that.getOrderStatusNums();
    that.getYearVipInfo();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {    
    var that = this
    var uid = wx.getStorageSync("uid");    
    if (uid > 0) {
      that.getUserInfo(uid);
    }
    that.getOrderStatusNums();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})