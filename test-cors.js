#!/usr/bin/env node

/**
 * CORS 配置测试脚本
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8443';

// 测试不同的 origin
const testOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://my-app.netlify.app',
  'https://staging-app.netlify.app',
  'https://mcpforge-eth-beijing.netlify.app',
  'https://my-app.vercel.app',
  'https://username.github.io',
  'https://my-project.surge.sh',
  'https://example.com', // 应该被拒绝
  'https://fake-netlify.com', // 应该被拒绝
  null, // 无 origin
];

async function testCORS() {
  console.log('🧪 开始测试 CORS 配置...\n');

  for (const origin of testOrigins) {
    console.log(`📋 测试 Origin: ${origin || '(no origin)'}`);
    
    try {
      const headers = {
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      };
      
      if (origin) {
        headers['Origin'] = origin;
      }
      
      const response = await fetch(`${BACKEND_URL}/auth/status`, {
        method: 'OPTIONS',
        headers,
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      };
      
      console.log(`   状态码: ${response.status}`);
      console.log(`   Allow-Origin: ${corsHeaders['Access-Control-Allow-Origin']}`);
      console.log(`   Allow-Credentials: ${corsHeaders['Access-Control-Allow-Credentials']}`);
      
      const isAllowed = response.status === 200 || response.status === 204;
      console.log(`   结果: ${isAllowed ? '✅ 允许' : '❌ 拒绝'}\n`);
      
    } catch (error) {
      console.log(`   错误: ${error.message}\n`);
    }
  }
  
  console.log('🏁 CORS 测试完成');
}

// 运行测试
testCORS().catch(console.error);
