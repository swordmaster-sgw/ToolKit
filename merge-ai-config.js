const fs = require('fs');
const path = require('path');
const dir = __dirname;

const tools = JSON.parse(fs.readFileSync(path.join(dir, 'tools.json'), 'utf-8'));
const aiConfig = JSON.parse(fs.readFileSync(path.join(dir, 'tools-ai-config.json'), 'utf-8'));

// 合并 AI 配置
tools.forEach(tool => {
  const cfg = aiConfig.tools.find(c => c.id === tool.id);
  if (cfg) {
    tool.ai_callable = cfg.ai_callable;
    tool.ai_description = cfg.ai_description;
    tool.ai_params = cfg.ai_params;
  }
});

fs.writeFileSync(path.join(dir, 'tools.json'), JSON.stringify(tools, null, 2));
console.log('Updated tools.json with AI configs');
