const hre = require("hardhat");

async function main() {
    const riksma_contract = await hre.ethers.getContractFactory("riskma");
    const deployed_riksma_contract = await riksma_contract.deploy()

    console.log(`Contract Address Deployed: ${deployed_riksma_contract.target}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});