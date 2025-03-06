const hre = require("hardhat");

async function main() {
    const investorAddress = "0xYourInvestorWalletAddress"; // Hardcoded
    const yieldPoolAddress = "0xYourYieldPoolAddress";

    console.log("🔗 Connecting to YieldPool...");
    const YieldPool = await hre.ethers.getContractAt("YieldPool", yieldPoolAddress);

    console.log("⏩ Fast-forward 30 days...");
    await hre.network.provider.send("evm_increaseTime", [30 * 86400]);
    await hre.network.provider.send("evm_mine");

    console.log("💰 Distributing Yield...");
    await YieldPool.manualDistributeYield();

    console.log(`✅ Yield successfully distributed to investor: ${investorAddress}`);
}

main().catch((error) => {
    console.error("❌ Simulation Failed:", error);
    process.exitCode = 1;
});
