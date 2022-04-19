// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./PPUToken.sol";

contract MovieContract {
    PPUToken public tokenContract;

    struct Movie {
        uint256 id;
        string category;
    }
    mapping(string => Movie[]) purchased_movies;

    constructor(PPUToken _tokenContract) {
        tokenContract = _tokenContract;
    }

    function buy_movie(
        string memory email,
        uint256 id,
        string memory category,
        uint256 price_in_tokens
    ) public {
        require(
            tokenContract.initialtransfer(address(this), price_in_tokens),
            "transfer failed !!"
        );
        purchased_movies[email].push(Movie(id, category));
    }

    function getMovies(string memory email)
        external
        view
        returns (Movie[] memory)
    {
        return purchased_movies[email];
    }

    function refund(uint256 number_of_tokens) public {
        require(
            tokenContract.transfer(msg.sender, number_of_tokens),
            "transfer failed !!"
        );
    }
}
