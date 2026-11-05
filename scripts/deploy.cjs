const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("--------------------------------------------------");
  console.log("Deploying HabitChain with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BOT/ETH");
  console.log("Network:", hre.network.name, "(Chain ID:", hre.network.config.chainId || 31337, ")");
  console.log("--------------------------------------------------");

  const HabitChain = await hre.ethers.getContractFactory("HabitChain");
  const habitChain = await HabitChain.deploy();
  await habitChain.waitForDeployment();

  const contractAddress = await habitChain.getAddress();
  console.log("HabitChain successfully deployed to:", contractAddress);

  // Export contract address & ABI to frontend
  const artifactPath = path.join(__dirname, "../artifacts/contracts/HabitChain.sol/HabitChain.json");
  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    abi = artifact.abi;
  }

  const frontendConfigDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }

  const exportData = {
    address: contractAddress,
    chainId: hre.network.config.chainId || 968,
    networkName: hre.network.name,
    deployedAt: new Date().toISOString(),
    abi: abi,
  };

  fs.writeFileSync(
    path.join(frontendConfigDir, "contractConfig.json"),
    JSON.stringify(exportData, null, 2)
  );

  console.log("Contract configuration saved to src/contracts/contractConfig.json");
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

