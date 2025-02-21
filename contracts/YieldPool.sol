// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YieldPool is AutomationCompatibleInterface, Ownable {
    IERC20 public stablecoin;
    address public bondContract;
    uint256 public yieldRate;
    uint256 public lastPayoutTimestamp;
    uint256 public payoutInterval;
    uint256 public totalYieldLocked;
    uint256 public maturityDate;
    bool public principalReturned;
    bool public automationEnabled;

    mapping(address => uint256) public bondHoldings;

    event YieldDeposited(address indexed issuer, uint256 amount);
    event YieldDistributed(uint256 amount);
    event PrincipalReturned(uint256 totalPrincipal);
    event AutomationStatusUpdated(bool enabled);
    event BondContractUpdated(address newBondContract);

    constructor(
        address _stablecoin,
        uint256 _yieldRate,
        uint256 _payoutInterval,
        uint256 _maturityDate
    ) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        yieldRate = _yieldRate;
        payoutInterval = _payoutInterval;
        maturityDate = _maturityDate;
        lastPayoutTimestamp = block.timestamp;
        automationEnabled = true;
        principalReturned = false;
    }

    /**
     * @notice Menghubungkan kontrak ini dengan GreenBondV2 setelah deploy.
     */
    function setBondContract(address _bondContract) external onlyOwner {
        require(bondContract == address(0), "Bond contract already set");
        bondContract = _bondContract;
        emit BondContractUpdated(_bondContract);
    }

    function depositYield(uint256 amount) external {
        require(
            stablecoin.transferFrom(msg.sender, address(this), amount),
            "Deposit failed"
        );
        totalYieldLocked += amount;
        emit YieldDeposited(msg.sender, amount);
    }

    function isPoolFunded() external view returns (bool) {
        return totalYieldLocked > 0;
    }

    function checkUpkeep(
        bytes calldata
    ) external view override returns (bool upkeepNeeded, bytes memory) {
        bool yieldDue = (block.timestamp >=
            lastPayoutTimestamp + payoutInterval) && automationEnabled;
        bool principalDue = (block.timestamp >= maturityDate) &&
            !principalReturned;
        upkeepNeeded = yieldDue || principalDue;
    }

    function performUpkeep(bytes calldata) external override {
        require(automationEnabled, "Automation disabled");

        if (block.timestamp >= maturityDate && !principalReturned) {
            _returnPrincipal();
        } else if (block.timestamp >= lastPayoutTimestamp + payoutInterval) {
            _distributeYield();
        }
    }

    function _distributeYield() internal {
        uint256 totalSupply = IERC20(bondContract).totalSupply();
        require(totalSupply > 0, "No bond holders");

        uint256 totalPayout = (totalSupply * yieldRate) / 100;
        require(totalYieldLocked >= totalPayout, "Insufficient yield funds");

        totalYieldLocked -= totalPayout;
        stablecoin.transfer(msg.sender, totalPayout);

        lastPayoutTimestamp = block.timestamp;
        emit YieldDistributed(totalPayout);
    }

    function _returnPrincipal() internal {
        uint256 totalSupply = IERC20(bondContract).totalSupply();
        require(totalSupply > 0, "No bond holders");
        require(
            stablecoin.balanceOf(address(this)) >= totalSupply,
            "Insufficient principal funds"
        );

        stablecoin.transfer(msg.sender, totalSupply);
        principalReturned = true;
        emit PrincipalReturned(totalSupply);
    }
}
