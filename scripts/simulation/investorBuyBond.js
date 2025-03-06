const hre = require("hardhat");

async function main() {
    const investorAddress = "0xYourInvestorWalletAddress"; // Ubah sesuai dengan wallet investor
    const greenBondAddress = "0xYourGreenBondV2Address"; // Ubah sesuai dengan alamat hasil deploy

    console.log("🔗 Connecting to GreenBondV3...");
    const GreenBond = await hre.ethers.getContractAt("GreenBondV3", greenBondAddress);

    console.log(`💳 Investor ${investorAddress} Buying 10 GBOND...`);
    await GreenBond.buyBond(investorAddress, hre.ethers.parseUnits("10", 18), { value: hre.ethers.parseEther("1") });

    const investorBalance = await GreenBond.balanceOf(investorAddress);
    console.log(`🏦 Investor Bond Balance: ${hre.ethers.formatUnits(investorBalance, 18)} GBOND`);
}

main().catch((error) => {
    console.error("❌ Simulation Failed:", error);
    process.exitCode = 1;
});
