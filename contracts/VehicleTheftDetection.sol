// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract IsOwned {
    address public owner;
    constructor() public{
        owner = msg.sender;
    }
    modifier onlyOwner() {
    require(msg.sender == owner);
    _; 
    }
}

contract Authentication is IsOwned{
 address user;
 uint256 token;
 bool public flag = false;
 
 struct VehicleOwner {
     string name;
     uint driverID;
     uint currentDriver;
     uint vehicleNumber;
     uint[] authorizedDrivers; 
 }
 
 event authenticatedEvent (
    uint indexed _id
 );

 VehicleOwner public vehicleOwner;
 string public name = "Rashi";
 function authenticate(uint _token, string memory _name, uint _vehicleNumber, uint _driverID
    ) public payable onlyOwner returns(string memory){

        if(flag == false){
            user = msg.sender;
            if(_token > 0){
                vehicleOwner.name = _name;
                vehicleOwner.vehicleNumber = _vehicleNumber;
                vehicleOwner.currentDriver = _driverID;
                vehicleOwner.driverID = _driverID;
                vehicleOwner.authorizedDrivers.push(_driverID);
                token = _token;
                flag = true;
                emit authenticatedEvent(_token);
                return "Token set successfully";
            }
            else {
                return "Invalid Token";
            }
            
        }
        else{
            if(msg.sender == user){
                if(_token == token){
                    return "Authentication Successful";
                }
                else {
                    return "Authentication Failed";
                }}
            else {
                return "Invalid User";
            } 
        }
    }
    
    function addDriver(uint _token, uint _driverID) public payable onlyOwner returns(string memory){
        require(token == _token, "Please Authenticate");
        vehicleOwner.authorizedDrivers.push(_driverID);
        return "Driver added successfully";
    }
    
    function updateCurrentDriver(uint _token, uint _driverID) public payable onlyOwner returns(string memory){
        require(token == _token, "Please Authenticate");
        bool authorized = false;
        for(uint i=0;i<vehicleOwner.authorizedDrivers.length; i++)
        {
            if(vehicleOwner.authorizedDrivers[i] == _driverID)
            {
                vehicleOwner.currentDriver = _driverID;
                emit authenticatedEvent(_token);
                authorized = true;
                return "Current Driver Updated";
            }
        }
        require(authorized == true, "Not an authorized driver");
        return "Not an authorized driver";
    }
    
    function deleteDriver(uint _token, uint _driverID) public payable onlyOwner returns(string memory) {
        require(token == _token, "Please Authenticate");
        for(uint i=0;i<vehicleOwner.authorizedDrivers.length;i++)
        {
            if(vehicleOwner.authorizedDrivers[i] == _driverID)
            {
                if(_driverID == vehicleOwner.currentDriver)
                {
                    vehicleOwner.currentDriver = vehicleOwner.driverID;
                }
                delete vehicleOwner.authorizedDrivers[i];
                emit authenticatedEvent(_token);
                return "Driver deleted successfully";
            }
        }
    }
    
    function isAuthorized(uint _driver, uint _speed, bool _biometric) public payable onlyOwner returns(string memory){
        if(_driver == vehicleOwner.driverID)
        {
            return "Authorized";
        }
        else if(_driver == vehicleOwner.currentDriver) {
            if(_biometric == true)
            {
                return "Authorized";
            } 
            else {
                return "Unauthorized access detected";
            }
        }
        else {
            if(_speed > 0)
            {
                return "Unauthorized access";
            }
            else {
                return "No action required";
            }
        }
    }
}

