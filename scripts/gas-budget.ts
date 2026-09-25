import hre from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";
import { ethers as ethersLib } from "ethers";

const RPC_URL = "https://rpc.mainnet.chain.robinhood.com";
const OWNER = "0xD20883fC5B4Df0f59cB97e128C7658A4dF570DCB";
const CHAIN_ID = 4663;

async function main() {
  const connection = await hre.network.create();
  const { ethers } = connection;
  const upgradesApi = await upgrades(hre, connection);
  const Token = await ethers.getContractFactory("NVIDIAIUpgradeable");

  const proxy = await upgradesApi.deployProxy(Token, [], { kind: "uups", initializer: "initialize" });
  await proxy.waitForDeployment();

  const proxyTx = proxy.deploymentTransaction();
  if (!proxyTx) throw new Error("Missing proxy deployment transaction");
  const proxyReceipt = await proxyTx.wait();
  if (!proxyReceipt) throw new Error("Missing proxy receipt");

  const implAddress = await upgradesApi.erc1967.getImplementationAddress(await proxy.getAddress());
  const implCode = await ethers.provider.getCode(implAddress);
  if (implCode === "0x") throw new Error("Missing implementation code");

  // Conservative local gas envelope: proxy deployment receipt plus a second
  // deployment-sized allowance for the implementation, then 50% headroom.
  const proxyGas = proxyReceipt.gasUsed;
  const conservativeGasUnits = proxyGas * 3n;

  const provider = new ethersLib.JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });
  const [network, feeData, balance] = await Promise.all([
    provider.getNetwork(),
    provider.getFeeData(),
    provider.getBalance(OWNER)
  ]);
  if (network.chainId !== BigInt(CHAIN_ID)) throw new Error("Wrong Robinhood chain ID");

  const fee = feeData.maxFeePerGas ?? feeData.gasPrice;
  if (fee === null) throw new Error("No usable Robinhood fee quote");

  const budget = conservativeGasUnits * fee;
  console.log("INFO: localProxyGasUsed =", proxyGas.toString());
  console.log("INFO: conservativeGasUnits =", conservativeGasUnits.toString());
  console.log("INFO: mainnetFeeWeiPerGas =", fee.toString());
  console.log("INFO: estimatedConservativeBudgetETH =", ethersLib.formatEther(budget));
  console.log("INFO: ownerBalanceETH =", ethersLib.formatEther(balance));

  if (balance < budget) throw new Error("Owner balance below conservative deployment gas budget");
  console.log("PASS: OWNER BALANCE COVERS CONSERVATIVE DEPLOYMENT GAS BUDGET");
}

main().catch((error) => {
  console.error("FAIL: DEPLOYMENT GAS/BALANCE PROOF");
  console.error(error);
  process.exitCode = 1;
});
