import { ethers } from "ethers";

const RPC_URL = "https://rpc.mainnet.chain.robinhood.com";
const EXPECTED_CHAIN_ID = 4663n;
const OWNER = "0xD20883fC5B4Df0f59cB97e128C7658A4dF570DCB";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL, Number(EXPECTED_CHAIN_ID), {
    staticNetwork: true
  });

  const network = await provider.getNetwork();
  if (network.chainId !== EXPECTED_CHAIN_ID) {
    throw new Error(`Wrong chainId: expected ${EXPECTED_CHAIN_ID}, got ${network.chainId}`);
  }

  const blockNumber = await provider.getBlockNumber();
  if (blockNumber <= 0) throw new Error("Invalid latest block");

  const feeData = await provider.getFeeData();
  if (feeData.gasPrice === null && feeData.maxFeePerGas === null) {
    throw new Error("RPC returned no usable fee data");
  }

  const balance = await provider.getBalance(OWNER);

  console.log("PASS: Robinhood Mainnet RPC reachable");
  console.log("PASS: chainId =", network.chainId.toString());
  console.log("PASS: latestBlock =", blockNumber);
  console.log("PASS: feeData available");
  console.log("INFO: owner =", OWNER);
  console.log("INFO: ownerBalanceETH =", ethers.formatEther(balance));
  console.log("PASS: ROBINHOOD MAINNET READ-ONLY PREFLIGHT");
}

main().catch((error) => {
  console.error("FAIL: ROBINHOOD MAINNET READ-ONLY PREFLIGHT");
  console.error(error);
  process.exitCode = 1;
});
