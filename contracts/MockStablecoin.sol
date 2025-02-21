// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockStablecoin is ERC20 {
    constructor() ERC20("Mock USDT", "mUSDT") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1 juta stablecoin untuk testing
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
