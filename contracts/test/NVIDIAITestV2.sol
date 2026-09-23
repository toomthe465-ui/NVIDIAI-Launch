// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../RobinhoodToken.sol";

contract NVIDIAITestV2 is NVIDIAIUpgradeable {
    function version() external pure returns (uint256) {
        return 2;
    }
}
