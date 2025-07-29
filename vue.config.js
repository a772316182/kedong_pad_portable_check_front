module.exports = {

  publicPath: "./",// 需要配置 否则打包后的apk文件安装在手机可能白屏

  devServer: {
    port: "6868", // 配置开发服务器的端口号（打包可以无需配置）
// 配置跨域代理(也可以使用CROS解决跨域)
    proxy: {
      "/ api": {
        target: "http://192.168.1.1:4343", // 目标服务器地址
        ws: true, // 是否代理websocket
        changeOrigin: true, // 是否跨域
        pathRewrite: {
          "^/api": '' // url重写
        }
      }
    },

  }
}
