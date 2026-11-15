export default defineConfig({
  plugins: [react()],
  base: '/', // Must be '/' for root domain deployments on Cloudflare Pages
});
