const hre = require("hardhat");

async function main() {
    const [deployer, escrow] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Escrow wallet address:", escrow.address); // Wallet escrow untuk menerima dana

    // Tentukan parameter deploy
    const initialSupply = 1000000; // Total supply GBOND
    const maturityDate = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 tahun dari sekarang
    const yieldRate = 5; // Yield 5% per tahun
    const escrowWallet = "0xe65411380aBc419B9074Be27c3D263cBADcAc2bb"; // wallet escrow sementara bos


    // Deploy GreenBond.sol
    const GreenBond = await hre.ethers.getContractFactory("GreenBondV2");
    const bond = await GreenBond.deploy(initialSupply, maturityDate, yieldRate, escrowWallet);
    await bond.waitForDeployment();

    console.log(`
    ✅ GreenBond deployed successfully!
    -------------------------------------------------------
    📌 Contract Address: ${await bond.getAddress()}
    📌 Deployer: ${deployer.address}
    📌 Escrow Wallet: ${escrowWallet}
    📌 Initial Supply: ${initialSupply} dari si green bond
    📌 Maturity Date: ${new Date(maturityDate * 1000).toISOString()}
    📌 Yield Rate: ${yieldRate}%
    -------------------------------------------------------
    `);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
