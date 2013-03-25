(function($) {
  var Transaction;

  /**
   * Represents a DataSourceTransaction
   * @constructor
   * @param {string} options.profileURL - The freemix/dataprofile/ URL 
   */
  Transaction = function(options) {
    this.profileURL = options.profileURL;
  };

  /** 
   * Handles data request for a DataSourceTransaction
   * @param {function} options.success - Function to run on $.ajax() success
   * @param {function} options.error - Function to run on $.ajax() error
   */
  Transaction.prototype.sync = function(options) {
    $.ajax({
      url: this.profileURL,
      type: "GET",
      dataType: "json",
      success: options.success,
      error: options.error
    });
  };

  window.FreemixTransaction = Transaction;
})($);
