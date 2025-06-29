import terser from '@rollup/plugin-terser'

const production = !process.env.ROLLUP_WATCH;;

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/main.js'
  },
  plugins: [
    production && terser()
  ]
};
