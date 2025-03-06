const hre = require("hardhat");

async function main() {
    const [deployer, investor] = await hre.ethers.getSigners();
    console.log("🚀 Running Simulation with accounts:");
    console.log("Issuer Address:", deployer.address);
    console.log("Investor Address:", investor.address);

    // **Alamat Kontrak (Masukkan hasil deploy sebelumnya)**
    const stablecoinAddress = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1"; // Ubah dengan alamat stablecoin
    const yieldPoolAddress = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44"; // Ubah dengan alamat YieldPool

    // **1️⃣ Hubungkan ke kontrak**
    console.log("🔗 Connecting to contracts...");
    const Stablecoin = await hre.ethers.getContractAt("MockStablecoin", stablecoinAddress);
    const YieldPool = await hre.ethers.getContractAt("YieldPool", yieldPoolAddress);

    // **2️⃣ Cek saldo awal stablecoin Issuer**
    let issuerBalance = await Stablecoin.balanceOf(deployer.address);
    console.log(`💰 Issuer Stablecoin Balance: ${hre.ethers.formatUnits(issuerBalance, 18)} USDT`);

    // **3️⃣ Issuer Menyetor Stablecoin ke Yield Pool**
    console.log("💸 Issuer Depositing 500 USDT into Yield Pool...");
    await Stablecoin.mint(deployer.address, hre.ethers.parseUnits("1000", 18)); // Tambah 1000 USDT ke issuer
    await Stablecoin.approve(yieldPoolAddress, hre.ethers.parseUnits("500", 18));
    await YieldPool.depositYield(hre.ethers.parseUnits("500", 18));

    // **4️⃣ Cek saldo Yield Pool setelah deposit**
    let poolBalance = await YieldPool.getYieldBalance();
    console.log(`🏦 Yield Pool Balance: ${hre.ethers.formatUnits(poolBalance, 18)} USDT`);

    // **5️⃣ Fast-forward waktu 30 hari untuk simulasi distribusi yield**
    console.log("⏩ Fast-forward 30 days...");
    await hre.network.provider.send("evm_increaseTime", [30 * 86400]);
    await hre.network.provider.send("evm_mine");

    // **6️⃣ Distribusi Yield kepada investor**
    console.log("💰 Distributing Yield...");
    await YieldPool.manualDistributeYield();

    // **7️⃣ Cek saldo stablecoin investor setelah yield**
    let investorBalance = await Stablecoin.balanceOf(investor.address);
    console.log(`💰 Investor Stablecoin Balance after Yield: ${hre.ethers.formatUnits(investorBalance, 18)} USDT`);

    // **8️⃣ Fast-forward waktu 1 tahun untuk simulasi pengembalian principal**
    console.log("⏩ Fast-forward 1 year to maturity...");
    await hre.network.provider.send("evm_increaseTime", [365 * 86400]);
    await hre.network.provider.send("evm_mine");

    // **9️⃣ Pengembalian principal ke investor**
    console.log("🔄 Returning Principal to Investor...");
    await YieldPool.manualReturnPrincipal();

    // **🔟 Cek saldo stablecoin investor setelah pengembalian principal**
    investorBalance = await Stablecoin.balanceOf(investor.address);
    console.log(`🏦 Investor Balance after Principal Return: ${hre.ethers.formatUnits(investorBalance, 18)} USDT`);

    console.log("🎉 Simulation Completed Successfully!");
}

main().catch((error) => {
    console.error("❌ Simulation Failed:", error);
    process.exitCode = 1;
});
