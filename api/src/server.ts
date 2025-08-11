import { PORT } from './env.js'
import { initStore } from './store.js'
import { app } from './app.js'

app.listen(PORT, async () => {
  await initStore()
})
