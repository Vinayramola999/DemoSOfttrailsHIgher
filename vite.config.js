import legacyCRA from 'vite-plugin-react-legacy-cra';

export default {
  plugins: [legacyCRA()],
  build: {
    outDir: "build",
  }
};
