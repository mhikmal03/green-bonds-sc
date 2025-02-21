const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Connect to local Hardhat node
    const buyerWalletAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Wallet buying the bond (hardhat wallet 1)

    // Get the specific buyer's signer
    const buyer = await provider.getSigner(buyerWalletAddress);
    
    // Connect to deployed contract
    const bond = await hre.ethers.getContractAt("GreenBondV2", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", buyer);

    console.time("Execution Time: Buy Bond");

    // Execute bond purchase transaction
    const tx = await bond.buyBond(buyerWalletAddress, ethers.parseEther("100"), { value: ethers.parseEther("100") });
    const receipt = await tx.wait();

    console.timeEnd("Execution Time: Buy Bond");

    // Fetch balance after purchase
    const investorBalance = await bond.balanceOf(buyerWalletAddress);

    console.log(`
    ✅ Investor ${buyerWalletAddress} purchased 100 GBOND
    -------------------------------------------------------
    📌 Transaction Hash: ${tx.hash}
    📌 Gas Fee: ${receipt.gasUsed.toString()} gas
    📌 Execution Time: ${new Date((await provider.getBlock(receipt.blockNumber)).timestamp * 1000).toISOString()}
    📌 Investor Balance After Purchase: ${ethers.formatUnits(investorBalance, 18)} GBOND
    -------------------------------------------------------
    `);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
