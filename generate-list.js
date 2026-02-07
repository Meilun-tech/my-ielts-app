// generate-list.js
const fs = require('fs');
const path = require('path');

// 指向你的 public/data 目录
const dataDir = path.join(__dirname, 'public', 'data');

// 读取该目录下所有文件
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'reading-list.json');

// 提取每篇文章的关键信息
const list = files.map(file => {
  const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
  return {
    id: content.id, // 确保 JSON 里有 id 字段
    title: content.title,
    difficulty: content.difficulty,
    timeLimit: content.timeLimit
  };
});

// 按照文件名/ID排序
list.sort((a, b) => a.id.localeCompare(b.id));

// 把汇总信息写入 public/data/reading-list.json
fs.writeFileSync(
  path.join(dataDir, 'reading-list.json'),
  JSON.stringify(list, null, 2)
);

console.log(`✅ 已生成 reading-list.json，包含 ${list.length} 篇文章`);