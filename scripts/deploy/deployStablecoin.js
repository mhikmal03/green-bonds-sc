const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("🚀 Deploying Mock Stablecoin...");
    const Stablecoin = await hre.ethers.getContractFactory("MockStablecoin");
    const stablecoin = await Stablecoin.deploy();
    await stablecoin.waitForDeployment();

    const stablecoinAddress = await stablecoin.getAddress();
    console.log(`✅ MockStablecoin deployed at: ${stablecoinAddress}`);

    return stablecoinAddress;
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});
