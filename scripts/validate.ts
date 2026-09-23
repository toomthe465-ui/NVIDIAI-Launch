import hre from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";

async function main() {
  const connection = await hre.network.create();
  const { ethers } = connection;
  const upgradesApi = await upgrades(hre, connection);
  const Token = await ethers.getContractFactory("NVIDIAIUpgradeable");
  await upgradesApi.validateImplementation(Token, { kind: "uups" });
  console.log("PASS: UUPS implementation validation");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
