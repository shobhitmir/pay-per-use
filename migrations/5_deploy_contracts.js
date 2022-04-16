const PPUTokenSale = artifacts.require("PPUTokenSale");

module.exports = function (deployer) {
  deployer.deploy(PPUTokenSale,"0x55C42E4d5F4c5dD37bac7E930bEfd9A1702a85d7",1000000000000000);
};
