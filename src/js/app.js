App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasAuthenticated: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Authentication.json", function(vehicle) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.VehicleTheftDetection = TruffleContract(vehicle);
      // Connect provider to interact with contract
      App.contracts.VehicleTheftDetection.setProvider(App.web3Provider);

      App.listenForEvents();
      return App.render();
    });
  },
  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.VehicleTheftDetection.deployed().then(function(instance) {
      instance.authenticatedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        
        App.render();
      });
    });
  },

  render: function() {
    var vehicleInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    // web3.eth.getCoinbase(function(err, account) {
    //   if (err === null) {
    //     App.account = account;
    //     $("#accountAddress").html("Your Account: " + account);
    //   }
    // });
    if(window.ethereum){
      ethereum.enable().then(function(acc){
          App.account = acc[0];
          $("#accountAddress").html("Your Account: " + App.account);
      });
  }

    // Load contract data
    App.contracts.VehicleTheftDetection.deployed().then(function(instance) {
      vehicleInstance = instance;
      return vehicleInstance.vehicleOwner();
    }).then(function(vehicleOwner) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var name = vehicleOwner[0];
      var id = vehicleOwner[1];
      var currentDriver = vehicleOwner[2];
      var vehicle_number = vehicleOwner[3];
      var candidateTemplate = "<tr><th>" + name + "</th><td>" + vehicle_number + "</th><td>" +id + "</td><td>" + currentDriver + "</td></tr>"
      candidatesResults.append(candidateTemplate);

      return vehicleInstance.flag();
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('#authentication-heading').html("<p align='center'>Authenticated successfully</p>");
        $('#authentication-form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  submitToken: function() {
    var token = $('#token').val();
    var name = $('#name').val();
    var vehicle_number = $('#vehicle_number').val();
    var id = $('#driver_id').val();

    $('#token').val('');
    $('#name').val('');
    $('#driver_id').val('');
    App.contracts.VehicleTheftDetection.deployed().then(function(instance) {
      return instance.authenticate(token, name, vehicle_number, id, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  addDriver: function() {
    var token = $('#AD_token').val();
    var id = $('#AD_driver_id').val();
    $('#AD_token').val('');
    $('#AD_driver_id').val('');
    App.contracts.VehicleTheftDetection.deployed().then(function(instance) {
      return instance.addDriver(token, id, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      Swal.fire({title: "Driver added successfully", icon:'success'});
    }).catch(function(err) {
      console.error(err);
    });
  },

  updateDriver: function() {
    var token = $('#update_token').val();
    var id = $('#update_driver_id').val();
    $('#update_token').val('');
    $('#update_driver_id').val('');
    App.contracts.VehicleTheftDetection.deployed().then(function(instance) {
      return instance.updateCurrentDriver(token, id, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      Swal.fire({title: "Driver updated successfully", icon:'success'});
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  deleteDriver: function() {
    var token = $('#delete_token').val();
    var id = $('#delete_driver_id').val();
    $('#delete_token').val('');
    $('#delete_driver_id').val('');
    App.contracts.VehicleTheftDetection.deployed().then(function(instance) {
      return instance.deleteDriver(token, id, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      Swal.fire({title: "Driver deleted successfully", icon:'success'});
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  checkUnauthorizedAccess: function() {
    var id = $('#UA_driver_id').val();
    var speed = $('#UA_speed').val();
    var biometric = $('#UA_biometric').val();
    $('#UA_driver_id').val('');
    $('#UA_speed').val('');
    $('#UA_biometric').val('');
    App.contracts.VehicleTheftDetection.deployed().then(function(instance) {
      return instance.isAuthorized.call(id, speed, biometric, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      Swal.fire({title: result});
    }).catch(function(err) {
      window.alert(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
