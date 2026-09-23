import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatUpgrades from "@openzeppelin/hardhat-upgrades";

export default defineConfig({
  plugins: [hardhatEthers, hardhatUpgrades],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  }
});
