// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEscrow {
    function depositFunds() external payable;
    function releaseFunds() external;
}

interface IYieldPool {
    function depositYield(uint256 amount) external;
    function updateBondHoldings(address investor, uint256 amount) external;
}

contract GreenBondV3 is ERC20 {
    address public issuer;
    address public escrowContract;
    address public yieldPoolContract;
    uint256 public maturityDate;
    uint256 public yieldRate;
    uint256 public coveragePeriod;
    bool public isBurned;

    constructor(
        uint256 initialSupply,
        uint256 _maturityDate,
        uint256 _yieldRate,
        uint256 _coveragePeriod,
        address _escrowContract,
        address _yieldPoolContract
    ) ERC20("GreenBond", "GBOND") {
        issuer = msg.sender;
        maturityDate = _maturityDate;
        yieldRate = _yieldRate;
        coveragePeriod = _coveragePeriod;
        escrowContract = _escrowContract;
        yieldPoolContract = _yieldPoolContract;
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function buyBond(address investor, uint256 amount) external payable {
        require(msg.value > 0, "Payment required");
        require(balanceOf(issuer) >= amount, "Issuer does not have enough GBOND");

        IEscrow(escrowContract).depositFunds{value: msg.value}();
        _transfer(issuer, investor, amount);

        // Update bond holdings in YieldPool.sol
        IYieldPool(yieldPoolContract).updateBondHoldings(investor, amount);
    }

    function depositYield(uint256 periodCoverage, address stablecoin) external {
        require(msg.sender == issuer, "Only issuer can deposit yield");

        uint256 requiredDeposit = ((totalSupply() * yieldRate) / 100) * periodCoverage;
        IERC20 token = IERC20(stablecoin);
        require(token.transferFrom(msg.sender, yieldPoolContract, requiredDeposit), "Yield deposit failed");

        IYieldPool(yieldPoolContract).depositYield(requiredDeposit);
    }
}
