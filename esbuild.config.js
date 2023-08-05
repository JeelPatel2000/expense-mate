const { build } = require('esbuild');

build({
  entryPoints: ['./src/app/main.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outdir: './dist',
  sourceRoot: './src/app',
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
