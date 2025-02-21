// SPDX-License-Identifier: MIT
// belum yang terupdate mengirim funds ke escrow contract
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GreenBondV2 is ERC20 {
    address public issuer;
    address public escrowWallet; // Dana masuk ke sini setelah investor beli token, lalu harusnya ada escrow contract supaya issuer dan green project bisa mengambil dana
    uint256 public maturityDate;
    uint256 public yieldRate;
    bool public isBurned;

    constructor(
        uint256 initialSupply,
        uint256 _maturityDate,
        uint256 _yieldRate,
        address _escrowWallet
    ) ERC20("GreenBond", "GBOND-ORI74") {
        issuer = msg.sender;
        maturityDate = _maturityDate;
        yieldRate = _yieldRate;
        escrowWallet = _escrowWallet;
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

     function buyBond(address investor, uint256 amount) external payable {
        require(msg.value > 0, "Payment required");
        require(balanceOf(issuer) >= amount, "Issuer does not have enough GBOND to sell");

        // Send ETH to escrow wallet
        payable(escrowWallet).transfer(msg.value);

        // Transfer pre-minted GBOND from issuer to investor
        _transfer(issuer, investor, amount);

        // Ensure investor received the GBOND
        require(balanceOf(investor) >= amount, "Transfer failed: Investor did not receive GBOND");
    }

    function burnTokensAfterMaturity() external {
        require(block.timestamp >= maturityDate, "Bond has not matured yet");
        require(!isBurned, "Tokens have already been burned");

        uint256 totalSupply = totalSupply();
        _burn(address(this), totalSupply);
        isBurned = true;
    }
}
