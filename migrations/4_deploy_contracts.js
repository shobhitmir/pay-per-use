const PPUToken = artifacts.require("PPUToken");

module.exports = function (deployer) {
  deployer.deploy(PPUToken,10000000);
};
