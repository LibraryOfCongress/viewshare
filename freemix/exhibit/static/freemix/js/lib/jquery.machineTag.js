(function($) {
  var cached_json_records;
  
  // Wrapper around machineTagSearch() which assumes wildcard is appended to the end of the url after a '#'
  // ie http://example.com/tag_search#wildcard.
  $.machineTagSearchLocation = function(options) {
    if (locationMachineTag() != null) {
      $.machineTagSearch(locationMachineTag().pop(), options);
    }
  }
  
  // Returns machine-tagged records/items that match wildcard machine tag.
  // These options have a global default with $.machineTagSearch.defaultOptions
  // Options: Either records or jsonUrl is required.
  //   * cacheJson: cache records from first json call, default is true
  //   * records: an array of machine-tagged records
  //   * jsonUrl: a json url which represents an array of machine-tagged records
  //   * beforeSearch: before search callback i.e. to display a spinner
  //   * beforeJsonSearch: callback to manipulate json before it's searched, called after beforeSearch
  //   * afterSearch: after search callback i.e. to hide a spinner
  //   * displayCallback: display callback is passed wildcard machine tag + matching records
  //   * appendHash: appends hash and wildcard machine tag to url, default is true
  $.machineTagSearch = function(wildcard_machine_tag, options) {
    var options = $.extend({cacheJson: true, appendHash: true}, $.machineTagSearch.defaultOptions, options || {});
    if (options.beforeSearch) options.beforeSearch.call(this);
    if (options.records) {
      var matching_records = machineTagSearchBody(wildcard_machine_tag, options.records, options);
    }
    else if (options.cacheJson && typeof(cached_json_records) != 'undefined') {
      var matching_records = machineTagSearchBody(wildcard_machine_tag, cached_json_records, options);
    }
    else if (options.jsonUrl) {
      $.getJSON(options.jsonUrl, function(json_records) {
        if (options.beforeJsonSearch) json_records = options.beforeJsonSearch.call(this, json_records);
        cached_json_records = json_records;
        var matching_records = machineTagSearchBody(wildcard_machine_tag, json_records, options);
      });
    }
    return matching_records;
  }

  function machineTagSearchBody(wildcard_machine_tag, records, options) {
    var matching_records = machineTagSearchRecords(wildcard_machine_tag, records);
    if (options.afterSearch) options.afterSearch.call(this);
    if (options.displayCallback) options.displayCallback.call(this, wildcard_machine_tag, matching_records);
    if (options.appendHash) location.href = location.href.replace(/#(.*?)$/, '') + "#" + wildcard_machine_tag;
    return matching_records;
  }

  $.machineTagSearch.defaultOptions = {};
  
  // Returns tags from machine-tagged records that match the wildcard machine tag.
  $.machineTagSearchRecordTags = function(wildcard_machine_tag, records) {
    var machine_tags = [];
    $.each(records, function(i,e) {
      $.each(e.tags, function(j,f) {
        if (machineTagMatchesWildcard(f, wildcard_machine_tag) && ($.inArray(f, machine_tags) == -1)) {
          machine_tags.push(f);
        }
      });
    });
    machine_tags.sort();
    return machine_tags;
  }

  // Parses machine tag into its and returns namespace, predicate and value as object attributes.
  $.machineTag = function(machine_tag) {
    var fields = machine_tag.split(/[:=]/);
    return {namespace: fields[0], predicate: fields[1], value: fields[2]};
  }

  $.machineTag.predicate_delimiter = ':';
  $.machineTag.value_delimiter = '=';

  $.machineTag.any = function(array, callback) {
    return $($.grep(array, callback)).size() > 0
  }
  
  $.fn.hideMachineTags = function() {    
    return this.each( function(){
      var mtag = $.machineTag($(this).text());
      $(this).html("<span style='display:none; padding:0px' class='machine_tag_prefix'>" + 
        mtag.namespace +$.machineTag.predicate_delimiter +mtag.predicate +
        $.machineTag.value_delimiter + "</span>" + mtag.value);
    });
  }
  
  $.toggleHiddenMachineTags = function() {
    $(".machine_tag_prefix").toggle();
  }
  
  //private methods
  function anyMachineTagsMatchWildcard(machine_tags, wildcard_machine_tag) {
    return $.machineTag.any(machine_tags, function(e) {return machineTagMatchesWildcard(e, wildcard_machine_tag)});  
  }

  function machineTagMatchesWildcard(machine_tag, wildcard_machine_tag) {
   return !! machine_tag.match(wildcard_machine_tag.replace(/\*/g, '.*')) 
  }

  function machineTagSearchRecords(wildcard_machine_tag, records) {
    return $.grep(records, function(e) {
      return anyMachineTagsMatchWildcard(e.tags, wildcard_machine_tag);
    });
  }

  function locationMachineTag() {
    return location.href.match(/#(.*?)$/);
  }
})(jQuery);