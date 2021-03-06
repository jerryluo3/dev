// pages/member/recharge/recharge.js
var app = getApp()
var sliderWidth = 96;
var moneyConfig = {
    20:{cost:20},
    50:{cost:48},
    100:{cost:95.5},
    200:{cost:190}
}

var domain = app.globalData.DOMAIN
Page({

  /**
   * 页面的初始数据
   */
  data: {
    moneyList: [],
      userInfo:{},
      tabs: ["在线充值余额", "充值卡充值"],
      activeIndex: 0,
      sliderOffset: 0,
      sliderLeft: 0,
      type:'50',
      cost:48
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
                    userInfo: res.data.user,
                })
                wx.setStorageSync("uid", res.data.user.mem_id);
                wx.setStorageSync("userInfo", res.data.user);
            }
        });
    },
  getAccountMoneyList: function () {
    var that = this
    var uid = wx.getStorageSync("uid");
    console.log(uid);
    var url = app.util.url('qiyue/getAccountMoneyList');
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
          moneyList: res.data.result
        })
        console.log(res.data.result)
      }
    })
  },
    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
},
    choseMoney(e){
      var type = e.currentTarget.dataset['type']
        var cost = moneyConfig[type].cost
        this.setData({
            cost,
            type
        })
    },

    createOrderThenWxPay(){

        var uid = wx.getStorageSync('uid')
        var phone = wx.getStorageSync('mem_mobile')
        var ctype = 1//1表示微信支付
        var url = `${domain}qiyue/onlineRecharge`;

            //请求生成订单号oid
        utils.post(url,{uid,ctype,phone},{"Content-Type": "application/x-www-form-urlencoded"})
            .then((res)=>{
                console.log(res)
                return app.wxPay(res.data)
            })
            .then((res)=>{

            })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getAccountMoneyList();
      //顶部tab
      var that = this
      wx.getSystemInfo({
          success: function (res) {
              that.setData({
                  sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                  sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
              });
          }
      });
    var uid = wx.getStorageSync("uid");
    this.getUserInfo(uid)

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
  onPullDownRefresh: function (options) {
    var that = this
    that.getAccountMoneyList();
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