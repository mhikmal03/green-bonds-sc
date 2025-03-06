const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🚀 Deploying contracts with account:", deployer.address);

    // 1️⃣ Deploy MRV.sol
    console.log("🚀 Deploying MRV Contract...");
    const MRV = await hre.ethers.getContractFactory("MRV");
    const mrv = await MRV.deploy();
    await mrv.waitForDeployment();
    const mrvAddress = await mrv.getAddress();
    console.log(`✅ MRV Contract deployed at: ${mrvAddress}`);

    console.log("🚀 Deploying Mock Stablecoin...");
    const Stablecoin = await hre.ethers.getContractFactory("MockStablecoin");
    const stablecoin = await Stablecoin.deploy();
    await stablecoin.waitForDeployment();
    const stablecoinAddress = await stablecoin.getAddress();
    console.log(`✅ MockStablecoin deployed at: ${stablecoinAddress}`);

    // 2️⃣ Deploy YieldPool.sol
    console.log("🚀 Deploying YieldPool Contract...");
    // const stablecoinAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"; // Ganti dengan alamat stablecoin di lokal
    const yieldRate = 5; // 5% Yield per tahun
    const payoutInterval = 30 * 86400; // Bulanan (30 hari)
    const maturityDate = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 Tahun Maturity
    const YieldPool = await hre.ethers.getContractFactory("YieldPool");
    const yieldPool = await YieldPool.deploy(stablecoinAddress, yieldRate, payoutInterval, maturityDate);
    await yieldPool.waitForDeployment();
    const yieldPoolAddress = await yieldPool.getAddress();
    console.log(`✅ YieldPool Contract deployed at: ${yieldPoolAddress}`);

    // 3️⃣ Deploy Escrow.sol
    console.log("🚀 Deploying Escrow Contract...");
    const Escrow = await hre.ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(deployer.address, deployer.address, yieldPoolAddress);
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log(`✅ Escrow Contract deployed at: ${escrowAddress}`);

    // 4️⃣ Deploy GreenBondV3.sol
    console.log("🚀 Deploying GreenBondV3 Contract...");
    const GreenBondV3 = await hre.ethers.getContractFactory("GreenBondV3");
    const greenBond = await GreenBondV3.deploy(
        hre.ethers.parseUnits("1000000000", 18), // 100,000,000,000 GBOND 1.000.000.000
        maturityDate,
        yieldRate,
        12, // Prefund untuk 12 bulan pertama
        escrowAddress, // ambil address dari contract escrow yang di deploy
        yieldPoolAddress // ambil address dari contract yield yang di deploy
    );
    await greenBond.waitForDeployment();
    const greenBondAddress = await greenBond.getAddress();
    console.log(`✅ GreenBondV3 Contract deployed at: ${greenBondAddress}`);

    // 5️⃣ Set bond contract di YieldPool.sol
    console.log("🔗 Linking GreenBondV3 to YieldPool...");
    const yieldPoolContract = new hre.ethers.Contract(yieldPoolAddress, YieldPool.interface, deployer);
    const tx = await yieldPoolContract.setBondContract(greenBondAddress);
    await tx.wait();
    console.log(`✅ YieldPool is now linked to GreenBondV3!`);

    console.log("🎉 All contracts deployed successfully!");
    return { mrvAddress, yieldPoolAddress, escrowAddress, greenBondAddress };
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});
