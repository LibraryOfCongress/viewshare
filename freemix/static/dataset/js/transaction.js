(function($) {
  var Transaction;

  /**
   * Represents a DataSourceTransaction
   * @constructor
   * @param {string} options.profileURL - The freemix/dataprofile/ URL 
   * @param {string} options.statusURL - The status URL for the transaction
   */
  Transaction = function(options) {
    this.profileURL = options.profileURL;
    this.statusURL = options.statusURL;
    this.success = undefined;
    this.error = undefined;
  };



  /** 
   * Handles data request for a DataSourceTransaction. Starts by polling
   * for DataSourceTransaction status updates.
   * @param {function} options.success - Function to run on $.ajax() success
   * @param {function} options.error - Function to run on $.ajax() error
   */
  Transaction.prototype.sync = function(options) {
    if (options !== undefined) {
      this.success = options.success;
      this.error = options.error;
    }
    $.ajax({
      url: this.statusURL,
      type: "GET",
      dataType: "json",
      success: this.syncSuccess.bind(this),
      error: this.syncError.bind(this)
    });
  };

  /**
   * Handle a successful sync request. This means we schedule another
   * status poll if the DataSourceTransaction isn't ready or we get the
   * latest profile if the transaction is ready.
   */
  Transaction.prototype.syncSuccess = function(data) {
      if (data.isReady) {
        this.getProfile();
      } else {
        setTimeout(this.sync.bind(this), 5000);
      }
  },

  /* */
  Transaction.prototype.syncError = function() {
  },

  /** 
   * After the DataTransaction has signalled a "ready" state we can
   * get the latest profile or handle error states.
   */
  Transaction.prototype.getProfile = function() {
    $.ajax({
      url: this.profileURL,
      type: "GET",
      dataType: "json",
      success: this.success,
      error: this.error
    });
  };

  window.FreemixTransaction = Transaction;
})($);
