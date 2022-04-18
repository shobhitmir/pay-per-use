const MovieContract = artifacts.require("MovieContract");

module.exports = function (deployer) {
  deployer.deploy(MovieContract,"0x55C42E4d5F4c5dD37bac7E930bEfd9A1702a85d7");
};
