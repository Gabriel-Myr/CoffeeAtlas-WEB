export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/all-beans/index',
    'pages/roasters/index',
    'pages/profile/index',
    'pages/bean-detail/index',
    'pages/roaster-detail/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'CoffeeAtlas',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#8b5a2b',
    selectedColor: '#3d2b1f',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/all-beans/index',
        text: '豆款',
      },
      {
        pagePath: 'pages/roasters/index',
        text: '烘焙商',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
      },
    ],
  },
})
