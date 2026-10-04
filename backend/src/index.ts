import { createApp } from "./app.js";
import { createAnthropicClient } from "./llm/anthropic.js";

const app = createApp(createAnthropicClient());
const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
