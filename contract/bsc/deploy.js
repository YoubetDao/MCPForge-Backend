const { ethers, run } = require("hardhat");

async function main() {
  // 部署参数
  const monthlyPrice = ethers.utils.parseEther("0.01"); // 0.01 BNB/月
  const treasuryAddress = "0x5d8C674ad467C6E3f711AB52e817aA96fA480F3e"; // 替换为你的资金接收地址
  
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
  
  // 等待几个区块确认后再验证合约
  console.log("\n等待区块确认以进行合约验证...");
  await contract.deployTransaction.wait(5);
  
  // 自动验证合约
  console.log("\n开始验证合约...");
  try {
    await run("verify:verify", {
      address: contract.address,
      constructorArguments: [
        monthlyPrice,
        treasuryAddress
      ],
      contract: "contracts/MCPServerSubscription.sol:MCPServerSubscription"
    });
    console.log("合约验证成功!");
  } catch (error) {
    if (error.message.includes("already verified")) {
      console.log("合约已经被验证过了");
    } else {
      console.error("合约验证失败:", error);
      console.log("你可以稍后手动验证合约，使用以下命令:");
      console.log(`npx hardhat verify --network ${network.name} ${contract.address} "${monthlyPrice}" "${treasuryAddress}"`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });