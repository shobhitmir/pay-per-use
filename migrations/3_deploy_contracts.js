const PPUTokenSale = artifacts.require("PPUTokenSale");

module.exports = function (deployer) {
  deployer.deploy(PPUTokenSale,"0x6f1fDCE3e7Aece7CF1512D1AC4e6a28EAFdB7c41",1000000000000000);
};
