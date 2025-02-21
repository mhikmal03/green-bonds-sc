async function main() {
    const [deployer, otherAccount] = await ethers.getSigners();

    // Assume the contract is already deployed and the address is known
    const escrowAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F'; // Replace with your actual deployed contract address
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.attach(escrowAddress);

    // Display initial balance of the contract for verification
    let balance = await ethers.provider.getBalance(escrow.address);
    console.log("Initial Escrow Balance:", ethers.utils.formatEther(balance), "ETH");

    // Simulate depositing funds
    console.log("\nDepositing funds...");
    const depositTx = await escrow.connect(otherAccount).depositFunds({ value: ethers.utils.parseEther("1.0") });
    await depositTx.wait();
    balance = await ethers.provider.getBalance(escrow.address);
    console.log("Escrow Balance after deposit:", ethers.utils.formatEther(balance), "ETH");

    // Check the balance via the contract's getter (if applicable)
    console.log("\nChecking Escrow balance...");
    balance = await escrow.getEscrowBalance();
    console.log("Reported Escrow Balance:", ethers.utils.formatEther(balance), "ETH");

    // Simulate releasing funds
    console.log("\nReleasing funds...");
    const releaseTx = await escrow.connect(deployer).releaseFunds();
    await releaseTx.wait();
    balance = await ethers.provider.getBalance(escrow.address);
    console.log("Escrow Balance after release:", ethers.utils.formatEther(balance), "ETH");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Error during simulation:", error);
        process.exit(1);
    });
