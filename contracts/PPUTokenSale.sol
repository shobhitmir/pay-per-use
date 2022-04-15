// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./PPUToken.sol";

contract PPUTokenSale {
    address admin;
    PPUToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(PPUToken _tokenContract, uint256 _tokenPrice) {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "multiplication failed !!");
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(
            msg.value == multiply(_numberOfTokens, tokenPrice),
            "pay exact amount !! "
        );
        require(
            tokenContract.balanceOf(address(this)) >= _numberOfTokens,
            "insufficient balance !! "
        );
        require(
            tokenContract.transfer(msg.sender, _numberOfTokens),
            "transfer failed !!"
        );

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function initialTransfer(uint256 _numberOfTokens) public {
        require(msg.sender == admin, "not admin!!");
        tokenContract.initialtransfer(address(this), _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin, "not admin !!");
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            ),
            "transfer failed !!"
        );
    }
}
