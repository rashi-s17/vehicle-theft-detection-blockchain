var VehicleTheftDetection = artifacts.require("./Authentication.sol");

module.exports = function(deployer) {
  deployer.deploy(VehicleTheftDetection);
};
