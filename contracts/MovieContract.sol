// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./PPUToken.sol";

contract MovieContract {
    PPUToken public tokenContract;

    struct Movie
    {
        uint id;
        string category;
    }
    mapping(string => Movie[]) purchased_movies;

     constructor(PPUToken _tokenContract)
     {
        tokenContract = _tokenContract;
    }

    function buy_movie(string memory email, uint id, string memory category, uint price_in_tokens) public
    {
        require(tokenContract.initialtransfer(address(this), price_in_tokens),"transfer failed !!");
        purchased_movies[email].push(Movie(id,category));
    }

    function getMovies(string memory email) external view returns (Movie[] memory)
    {
        return purchased_movies[email];
    }
}