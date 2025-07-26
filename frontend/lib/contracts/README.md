# MCPServerSubscription 合约封装

这个目录包含了 MCPServerSubscription 智能合约的前端封装代码。

## 文件说明

- `MCPServerSubscription.ts` - 合约封装类和方法
- `config.ts` - 合约地址和网络配置

## 使用方法

### 1. 部署合约并更新地址

首先部署 BSC 合约：

```bash
cd contract/bsc
npm install
npm run deploy:testnet
```

部署成功后，将输出的合约地址更新到 `config.ts` 文件中。

### 2. 基本使用

```typescript
import { createMCPServerSubscription } from '@/lib/contracts/MCPServerSubscription';

// 创建合约实例
const mcpContract = await createMCPServerSubscription();

// 获取月度价格
const monthlyPrice = await mcpContract.getMonthlyPrice();
const priceInBNB = await mcpContract.getMonthlyPriceInBNB();

// 购买订阅
// 注意：订阅是绑定到用户钱包地址的，不是特定服务器
// 一次订阅可以使用所有 MCP 服务器
const tx = await mcpContract.purchaseSubscription();
await tx.wait(); // 等待交易确认

// 检查订阅状态
const isValid = await mcpContract.isSubscriptionValid(userAddress);

// 获取详细订阅信息
const info = await mcpContract.getSubscriptionInfo(userAddress);
console.log('到期时间:', new Date(info.expiryTime * 1000));
console.log('剩余天数:', info.remainingDays);
```

### 订阅模式说明

MCPServerSubscription 采用的是**用户级订阅模式**：
- 订阅绑定到用户的钱包地址，而不是特定的服务器
- 一次订阅即可访问平台上的所有 MCP 服务器
- 如果用户已有有效订阅，再次购买会自动延长一个月
- 订阅过期后需要重新购买才能继续使用服务

### 3. 事件监听

```typescript
// 监听订阅购买事件
mcpContract.onSubscriptionPurchased((user, amount, expiryTime, event) => {
  console.log(`用户 ${user} 购买了订阅，支付 ${ethers.formatEther(amount)} BNB`);
});

// 监听订阅延长事件
mcpContract.onSubscriptionExtended((user, amount, newExpiryTime, event) => {
  console.log(`用户 ${user} 延长了订阅，新到期时间: ${new Date(Number(newExpiryTime) * 1000)}`);
});

// 移除所有监听器
mcpContract.removeAllListeners();
```

### 4. 批量操作

```typescript
// 批量检查多个地址的订阅状态
const addresses = ['0x...', '0x...', '0x...'];
const results = await mcpContract.batchCheckSubscriptions(addresses);
```

### 5. 获取合约统计信息

```typescript
const stats = await mcpContract.getContractStats();
console.log('总订阅人数:', stats.totalSubscribers);
console.log('总收入:', ethers.formatEther(stats.totalRevenue), 'BNB');
console.log('合约余额:', ethers.formatEther(stats.contractBalance), 'BNB');
```

## 网络配置

当前仅支持：
- BSC 测试网 (Chain ID: 97)

如果用户钱包连接到其他网络，会自动提示切换到 BSC 测试网。

## 错误处理

```typescript
try {
  const tx = await mcpContract.purchaseSubscription();
  await tx.wait();
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('余额不足');
  } else if (error.code === 'USER_REJECTED') {
    console.error('用户取消了交易');
  } else {
    console.error('交易失败:', error.message);
  }
}
```