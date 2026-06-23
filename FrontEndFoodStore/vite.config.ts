import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/auth/login/login.html"),
        registro: resolve(__dirname, "src/pages/auth/registro/registro.html"),
        adminHome: resolve(__dirname, "src/pages/admin/home/home.html"),
        clientHome: resolve(__dirname, "src/pages/client/home/home.html"),
        productDetail: resolve(__dirname, "src/pages/client/productDetail/productDetail.html"),
        orders: resolve(__dirname, "src/pages/client/orders/orders.html"),
        adminOrders: resolve(__dirname, "src/pages/admin/orders/orders.html"),
        adminCategories: resolve(__dirname, "src/pages/admin/categories/categories.html"),
        adminProducts: resolve(__dirname, "src/pages/admin/products/products.html"),
      },
    },
  },
  base: "./",
});