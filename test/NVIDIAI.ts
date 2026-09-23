import assert from "node:assert/strict";
import { describe, it } from "node:test";
import hre from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";

const WALLET_13M = "0x4121eFbbD43349039e5eb96dfEe221074b9e9fc9";
const OWNER = "0xD20883fC5B4Df0f59cB97e128C7658A4dF570DCB";
const E18 = 10n ** 18n;

describe("NVIDIAIUpgradeable", async function () {
  const connection = await hre.network.create();
  const { ethers } = connection;
  const upgradesApi = await upgrades(hre, connection);

  it("passes the full local UUPS launch gate", async function () {
    const [deployer, attacker] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("NVIDIAIUpgradeable");

    await upgradesApi.validateImplementation(Token, { kind: "uups" });

    const implementation = await Token.deploy();
    await implementation.waitForDeployment();
    await assert.rejects(implementation.initialize());

    const proxy = await upgradesApi.deployProxy(Token, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await proxy.waitForDeployment();

    assert.equal(await proxy.name(), "NVIDIAI");
    assert.equal(await proxy.symbol(), "NVIDIAI");
    assert.equal(await proxy.decimals(), 18n);
    assert.equal(await proxy.totalSupply(), 20_000_000n * E18);
    assert.equal(await proxy.balanceOf(WALLET_13M), 13_000_000n * E18);
    assert.equal(await proxy.balanceOf(OWNER), 7_000_000n * E18);
    assert.equal((await proxy.owner()).toLowerCase(), OWNER.toLowerCase());
    await assert.rejects(proxy.initialize());

    const V2 = await ethers.getContractFactory("NVIDIAITestV2");
    await upgradesApi.validateUpgrade(await proxy.getAddress(), V2, { kind: "uups" });

    const unauthorized = proxy.connect(attacker);
    await assert.rejects(unauthorized.upgradeToAndCall(await implementation.getAddress(), "0x"));

    await connection.provider.send("hardhat_impersonateAccount", [OWNER]);
    await connection.provider.send("hardhat_setBalance", [OWNER, "0x56BC75E2D63100000"]);
    const ownerSigner = await ethers.getSigner(OWNER);

    const upgraded = await upgradesApi.upgradeProxy(await proxy.getAddress(), V2.connect(ownerSigner), {
      kind: "uups"
    });
    await upgraded.waitForDeployment();

    assert.equal(await upgraded.version(), 2n);
    assert.equal(await upgraded.totalSupply(), 20_000_000n * E18);
    assert.equal(await upgraded.balanceOf(WALLET_13M), 13_000_000n * E18);
    assert.equal(await upgraded.balanceOf(OWNER), 7_000_000n * E18);
    assert.equal((await upgraded.owner()).toLowerCase(), OWNER.toLowerCase());
  });
});
