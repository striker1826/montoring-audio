import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'

function listAudio(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return listAudio(path)
    return entry.isFile() && /\.(mp3|wav|flac|m4a|aac|ogg|opus|webm|aiff)$/i.test(entry.name)
      ? [path.slice('public/'.length)] : []
  })
}

export default defineConfig({
  plugins: [{
    name: 'public-audio',
    resolveId(id) { if (id === 'virtual:tracks') return '\0virtual:tracks' },
    load(id) {
      if (id === '\0virtual:tracks') return 'export default ' + JSON.stringify(listAudio('public').sort())
    },
    configureServer(server) {
      for (const event of ['add', 'unlink']) {
        server.watcher.on(event, path => {
          if (!path.startsWith(server.config.publicDir + '/')) return
          const module = server.moduleGraph.getModuleById('\0virtual:tracks')
          if (module) server.moduleGraph.invalidateModule(module)
          server.ws.send({ type: 'full-reload' })
        })
      }
    }
  }]
})
