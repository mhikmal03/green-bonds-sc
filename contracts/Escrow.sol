// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IYieldPool {
    function isPoolFunded() external view returns (bool);
}

contract Escrow is Ownable {
    address public issuer;
    address public greenProjectWallet;
    address public yieldPool;
    uint256 public lockedFunds;
    bool public fundsReleased;

    event FundsDeposited(address indexed sender, uint256 amount);
    event FundsReleased(address indexed projectWallet, uint256 amount);

    constructor(address _issuer, address _greenProjectWallet, address _yieldPool) Ownable(msg.sender) {
        issuer = _issuer;
        greenProjectWallet = _greenProjectWallet;
        yieldPool = _yieldPool;
        fundsReleased = false;
    }

    /**
     * @notice Investor membeli bond dan dana masuk ke escrow.
     */
    function depositFunds() external payable {
        require(msg.value > 0, "Must send ETH");
        lockedFunds += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @notice Escrow hanya melepaskan dana jika yield pool telah terisi.
     */
    function releaseFunds() external onlyOwner {
        require(lockedFunds > 0, "No funds available");
        require(!fundsReleased, "Funds already released");
        require(IYieldPool(yieldPool).isPoolFunded(), "Yield pool not funded");

        payable(greenProjectWallet).transfer(lockedFunds);
        emit FundsReleased(greenProjectWallet, lockedFunds);

        lockedFunds = 0;
        fundsReleased = true;
    }

    /**
     * @notice Mengecek saldo dana escrow.
     */
    function getEscrowBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
