// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract NVIDIAIUpgradeable is
    Initializable,
    ERC20Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    uint256 public constant MAX_SUPPLY = 20_000_000 * 10 ** 18;

    address public constant WALLET_13M =
        0x4121eFbbD43349039e5eb96dfEe221074b9e9fc9;

    address public constant WALLET_7M_AND_ADMIN =
        0xD20883fC5B4Df0f59cB97e128C7658A4dF570DCB;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC20_init("NVIDIAI", "NVIDIAI");
        __Ownable_init(WALLET_7M_AND_ADMIN);

        _mint(WALLET_13M, 13_000_000 * 10 ** decimals());
        _mint(WALLET_7M_AND_ADMIN, 7_000_000 * 10 ** decimals());

        require(totalSupply() == MAX_SUPPLY, "Invalid initial supply");
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
