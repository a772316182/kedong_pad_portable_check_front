// electron.vite.config.mjs
import { resolve } from "path";
import { fileURLToPath } from "url";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
var __electron_vite_injected_import_meta_url = "file:///C:/Users/%E5%88%98/Documents/GitHub/kedong_pad_portable_check_front/electron.vite.config.mjs";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [
      vue({
        template: { transformAssetUrls }
      }),
      quasar({
        sassVariables: fileURLToPath(new URL("./src/quasar-variables.sass", __electron_vite_injected_import_meta_url))
      })
    ]
  }
});
export {
  electron_vite_config_default as default
};
