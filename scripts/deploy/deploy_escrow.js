async function main() {
    // These addresses should be checked to ensure they are correct and have the appropriate balances
    const issuerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const greenProjectAddress = '0xe65411380aBc419B9074Be27c3D263cBADcAc2bb';

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    

    // Fetch the contract factory and deploy
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(issuerAddress, greenProjectAddress);
    console.log("Waiting for Escrow deployment...");

    // Await the deployment to be completed
    console.log("Escrow deployed to:", await escrow.getAddress());
    
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Error during deployment:", error);
        process.exit(1);
    });
