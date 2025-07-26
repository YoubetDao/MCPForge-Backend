#!/usr/bin/env node

/**
 * 认证系统测试脚本
 * 用于测试 httpOnly cookies 是否正常工作
 */

const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8443';

async function testAuth() {
  console.log('🧪 开始测试认证系统...\n');

  // 测试 1: 检查认证状态（未登录）
  console.log('📋 测试 1: 检查未登录状态');
  try {
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   预期: 401 (未授权)`);
    console.log(`   结果: ${response.status === 401 ? '✅ 通过' : '❌ 失败'}\n`);
  } catch (error) {
    console.log(`   错误: ${error.message}\n`);
  }

  // 测试 2: 检查 CORS 配置
  console.log('📋 测试 2: 检查 CORS 配置');
  try {
    const response = await fetch(`${BACKEND_URL}/auth/status`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
    };
    
    console.log(`   CORS Headers:`, corsHeaders);
    console.log(`   Allow-Credentials: ${corsHeaders['Access-Control-Allow-Credentials']}`);
    console.log(`   结果: ${corsHeaders['Access-Control-Allow-Credentials'] === 'true' ? '✅ 通过' : '❌ 失败'}\n`);
  } catch (error) {
    console.log(`   错误: ${error.message}\n`);
  }

  // 测试 3: 检查服务状态
  console.log('📋 测试 3: 检查服务状态');
  try {
    const response = await fetch(`${BACKEND_URL}/auth/status`);
    const data = await response.json();
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应: ${JSON.stringify(data)}`);
    console.log(`   结果: ${response.ok ? '✅ 通过' : '❌ 失败'}\n`);
  } catch (error) {
    console.log(`   错误: ${error.message}\n`);
  }

  // 测试 4: 模拟 Web3 认证流程
  console.log('📋 测试 4: 模拟 Web3 认证流程');
  try {
    // 获取挑战
    const challengeResponse = await fetch(`${BACKEND_URL}/user/auth/web3/challenge?address=0x1234567890123456789012345678901234567890`);
    
    if (challengeResponse.ok) {
      const challengeData = await challengeResponse.json();
      console.log(`   挑战获取: ✅ 成功`);
      console.log(`   挑战内容: ${challengeData.challenge}`);
    } else {
      console.log(`   挑战获取: ❌ 失败 (${challengeResponse.status})`);
    }
  } catch (error) {
    console.log(`   错误: ${error.message}`);
  }

  console.log('\n🏁 测试完成');
  console.log('\n💡 如果要测试完整的登录流程，请：');
  console.log('   1. 启动前端服务 (npm run dev)');
  console.log('   2. 访问 http://localhost:3000/auth-test');
  console.log('   3. 使用 GitHub 或 Web3 登录');
  console.log('   4. 检查 cookies 是否正确设置');
}

// 运行测试
testAuth().catch(console.error);
