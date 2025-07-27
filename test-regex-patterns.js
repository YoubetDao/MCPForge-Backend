#!/usr/bin/env node

/**
 * 正则表达式模式测试工具
 */

// 内置的域名模式
const builtInPatterns = [
  { name: 'Netlify', pattern: /^https?:\/\/.*\.netlify\.app$/ },
  { name: 'Vercel', pattern: /^https?:\/\/.*\.vercel\.app$/ },
  { name: 'GitHub Pages', pattern: /^https?:\/\/.*\.github\.io$/ },
  { name: 'Surge.sh', pattern: /^https?:\/\/.*\.surge\.sh$/ },
];

// 测试 URL 列表
const testUrls = [
  'https://my-app.netlify.app',
  'https://staging-123.netlify.app',
  'https://mcpforge-eth-beijing.netlify.app',
  'https://my-project.vercel.app',
  'https://username.github.io',
  'https://my-site.surge.sh',
  'https://example.com',
  'https://fake-netlify.com',
  'http://localhost:3000',
  'https://app.netlify.app',
  'https://sub.domain.netlify.app',
];

function testPatterns() {
  console.log('🧪 测试正则表达式模式匹配...\n');

  // 测试内置模式
  console.log('📋 内置模式测试:');
  testUrls.forEach(url => {
    console.log(`\n🔗 测试 URL: ${url}`);
    
    builtInPatterns.forEach(({ name, pattern }) => {
      const matches = pattern.test(url);
      console.log(`   ${name}: ${matches ? '✅ 匹配' : '❌ 不匹配'}`);
    });
  });

  // 测试自定义模式
  console.log('\n\n📋 自定义模式示例:');
  const customPatterns = [
    { name: '自定义域名', pattern: /^https?:\/\/.*\.yourdomain\.com$/ },
    { name: 'App前缀', pattern: /^https?:\/\/app-.*\.example\.com$/ },
    { name: '精确匹配', pattern: /^https?:\/\/(www\.)?example\.com$/ },
  ];

  const customTestUrls = [
    'https://api.yourdomain.com',
    'https://staging.yourdomain.com',
    'https://app-123.example.com',
    'https://www.example.com',
    'https://example.com',
    'https://other.example.com',
  ];

  customTestUrls.forEach(url => {
    console.log(`\n🔗 测试 URL: ${url}`);
    
    customPatterns.forEach(({ name, pattern }) => {
      const matches = pattern.test(url);
      console.log(`   ${name}: ${matches ? '✅ 匹配' : '❌ 不匹配'}`);
    });
  });
}

function generatePattern() {
  console.log('\n\n💡 常用正则表达式模式生成器:');
  console.log('');
  console.log('1. 所有子域名: ^https?://.*\\.yourdomain\\.com$');
  console.log('2. 特定前缀: ^https?://app-.*\\.example\\.com$');
  console.log('3. 精确匹配: ^https?://(www\\.)?example\\.com$');
  console.log('4. 多个域名: ^https?://.*\\.(netlify\\.app|vercel\\.app)$');
  console.log('5. 端口支持: ^https?://.*\\.example\\.com(:[0-9]+)?$');
  console.log('');
  console.log('⚠️  注意: 在环境变量中使用时，不需要 / 包围，直接写正则表达式字符串');
  console.log('例如: ALLOWED_DOMAIN_PATTERNS=^https?://.*\\.netlify\\.app$');
}

// 运行测试
testPatterns();
generatePattern();

console.log('\n🏁 测试完成');
console.log('\n📝 使用方法:');
console.log('1. 将需要的正则表达式模式添加到 .env 文件');
console.log('2. 重启后端服务');
console.log('3. 使用 node test-cors.js 测试 CORS 配置');
