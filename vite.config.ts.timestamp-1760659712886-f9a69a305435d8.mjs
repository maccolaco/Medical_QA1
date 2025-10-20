// vite.config.ts
import { defineConfig } from "file:///C:/projects/Medical_QA/node_modules/vite/dist/node/index.js";
import react from "file:///C:/projects/Medical_QA/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig(async () => ({
  plugins: [react()],
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"]
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxwcm9qZWN0c1xcXFxNZWRpY2FsX1FBXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxwcm9qZWN0c1xcXFxNZWRpY2FsX1FBXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9wcm9qZWN0cy9NZWRpY2FsX1FBL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICgpID0+ICh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCldLFxyXG5cclxuICAvLyBWaXRlIG9wdGlvbnMgdGFpbG9yZWQgZm9yIFRhdXJpIGRldmVsb3BtZW50IGFuZCBvbmx5IGFwcGxpZWQgaW4gYHRhdXJpIGRldmAgb3IgYHRhdXJpIGJ1aWxkYFxyXG4gIC8vXHJcbiAgLy8gMS4gcHJldmVudCB2aXRlIGZyb20gb2JzY3VyaW5nIHJ1c3QgZXJyb3JzXHJcbiAgY2xlYXJTY3JlZW46IGZhbHNlLFxyXG4gIC8vIDIuIHRhdXJpIGV4cGVjdHMgYSBmaXhlZCBwb3J0LCBmYWlsIGlmIHRoYXQgcG9ydCBpcyBub3QgYXZhaWxhYmxlXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiAxNDIwLFxyXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICAgIHdhdGNoOiB7XHJcbiAgICAgIC8vIDMuIHRlbGwgdml0ZSB0byBpZ25vcmUgd2F0Y2hpbmcgYHNyYy10YXVyaWBcclxuICAgICAgaWdub3JlZDogW1wiKiovc3JjLXRhdXJpLyoqXCJdLFxyXG4gICAgfSxcclxuICB9LFxyXG59KSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUCxTQUFTLG9CQUFvQjtBQUN2UixPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhLGFBQWE7QUFBQSxFQUN2QyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLakIsYUFBYTtBQUFBO0FBQUEsRUFFYixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixPQUFPO0FBQUE7QUFBQSxNQUVMLFNBQVMsQ0FBQyxpQkFBaUI7QUFBQSxJQUM3QjtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
