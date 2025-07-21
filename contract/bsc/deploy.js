const { ethers } = require("hardhat");

async function main() {
  // 部署参数
  const monthlyPrice = ethers.utils.parseEther("0.01"); // 0.01 BNB/月
  const treasuryAddress = "0x2de5c1ac2568605c6fc82173552ecfaf07883c65"; // 替换为你的资金接收地址
  
  console.log("开始部署MCPServerSubscription合约...");
  console.log("月费价格:", ethers.utils.formatEther(monthlyPrice), "BNB");
  console.log("资金地址:", treasuryAddress);
  
  // 获取合约工厂
  const MCPServerSubscription = await ethers.getContractFactory("MCPServerSubscription");
  
  // 部署合约
  const contract = await MCPServerSubscription.deploy(
    monthlyPrice,
    treasuryAddress
  );
  
  await contract.deployed();
  
  console.log("合约部署成功!");
  console.log("合约地址:", contract.address);
  console.log("交易哈希:", contract.deployTransaction.hash);
  
  // 验证部署
  const deployedPrice = await contract.monthlyPrice();
  const deployedTreasury = await contract.treasuryAddress();
  
  console.log("\n=== 部署验证 ===");
  console.log("设置的月费:", ethers.utils.formatEther(deployedPrice), "BNB");
  console.log("设置的资金地址:", deployedTreasury);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });