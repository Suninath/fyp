import { defineConfig } from 'vite'

export default defineConfig({
  // ...
  "baseUrl": ".",
  "paths": {
    "@/*": [
      "./src/*"
    ]
  }
})