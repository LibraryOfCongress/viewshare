(function($, Transaction) {
  var UserTransactionsView, PendingTransactionView;

  /**
   * Display and poll the status of a single DataSourceTransaction
   * @constructor
   * @param {HTML Element} options.el - DOM Element containing single transaction
   */
  PendingTransactionView = function(options) {
    var profileURL;
    this.el = $(options.el);
    profileURL = this.el.find('.dataset-title a').attr('data-poll-href');
    this.transaction = new Transaction({profileURL: profileURL});
    this.status = this.el.find('.status');
  };

  /** 
   * Handles DOM manipulation on a successful ajax request
   * @param {string} data.status - Printable status for the transaction
   * @param {bool} data.isReady - Tells us to continue polling or not
   */
  PendingTransactionView.prototype.pollSuccess = function(data) {
    if (data.status !== this.status.html()) {
      this.status.html(data.status);
    }
    if (!data.isReady) {
      setTimeout($.proxy(this.render, this), 5000);
    }
  };

  /** 
   * Handles DOM manipulation on a failed ajax request
   * @param {string} data - Data returned from successful jquery ajax request
   */
  PendingTransactionView.prototype.pollError = function() {
    this.status.html('Please try to reload the page later.');
  };

  /** Controls display of PendingTransactionView */
  PendingTransactionView.prototype.render = function() {
    var success = $.proxy(this.pollSuccess, this)
    var error = $.proxy(this.pollError, this)

    this.transaction.sync({
      success: success,
      error: error
    });
  };

  /**
   * Display a list of DataSourceTransactions for a user.
   * @constructor
   * @param {array of HTML Elements} options.transactions - transaction DOM elements
   */
  UserTransactionsView = function(options) {
    this.transactions = [];
    for (var i = 0; i < options.transactions.length; i++) {
      this.transactions.push(
        new PendingTransactionView({el: options.transactions[i]})
      );
    }
  };

  UserTransactionsView.prototype.render = function() {
    for (var i = 0; i < this.transactions.length; i++) {
      this.transactions[i].render();
    }
  };

  window.UserTransactionsView = UserTransactionsView;
})($, window.FreemixTransaction);
