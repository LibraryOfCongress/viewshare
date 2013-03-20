/**
 * @fileOverview
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @depends jQuery
 */

/**
 * @namespace
 * @param {Array} structure
 * @param {String} [url]
 */
var JSONPrep = {
    "response": null,
    "option": null
};

/**
 * Formats arbitrary values in a hash.
 * @static
 * @param {String|Number|Object} [val]
 * @returns String
 */
JSONPrep.formatter = function(val) {
    var trailer;
    if (typeof val === "string") {
        return val.substr(0, 50) + ((val.length > 50) ? "..." : "");
    } else if (val !== null && typeof val === "object" && typeof val.length !== "undefined" && val.length > 0) {
        if (val.length === 1) {
            trailer = ' <em class="gray">in a list</em>';
        } else if (val.length === 2) {
            trailer = ' <em class="gray">and one other object in a  list</em>';
        } else {
            trailer = ' <em class="gray">and ' + (val.length - 1) + ' other objects in a list</em>';
        }
        return JSONPrep.formatter(val[0]) + trailer;
    } else if (typeof val === "object") {
        return '<em class="gray">[object]</em>';
    } else if (typeof val === "undefined") {
        return '<em class="gray">[missing]</em>';
    } else {
        return val;
    }
};

/**
 * Show values in a hash to a user agent.
 * @static
 * @param {JSONPrep.Response.Option} option
 */
JSONPrep.displayer = function(option) {
    $("#pager-total").text(option.getSampleLength());
    $("#item-properties").empty();
    $.each(option.getProperties(), function(idx, prop) {
        $("#item-properties").append(
            '<tr><th class="prop">' + prop + '</th>' 
                + '<td>' + option.getPropertyMetadata(prop) + '</td>'
                + '<td>' + JSONPrep.formatter(option.getItems()[option.getBookmark()][prop]) + '</td>'
                + '</tr>');
    });
    $("#pager-current").text(option.getBookmark() + 1);
};

/**
 * Display any errors during prep phase to the user.
 * @static
 * @param {String} status
 * @param {String} err
 */
JSONPrep.error = function(status, err) {
    var msg;
    $("#json-upload,#spinner").fadeOut(function() {
        $(".upload-json").fadeIn();
    });
    switch(status) {
    case "timeout":
        msg = "Timed out trying to analyze JSON.  Try again later.";
        break;
    case "parseerror":
        msg = "Parsing error trying to analyze JSON.  Please notify an administrator.";
        break;
    case "error":
        msg = "Unknown error: " + err;
        break;
    case "abort":
        msg = "Connection failed.  Try again later.";
        break;
    case "baddata":
    default:
        msg = err;
        break;
    }
    $("#load-failure-general span:eq(0)").text(msg);
    $("#systemMsg,.errorMsg").fadeIn();
};

/**
 * Submits URL and receives analyzed JSON in return.
 * @static
 * @param {String} transform
 */
JSONPrep.runner = function(transform) {
    $.ajax({
        "url": transform,
        "data": { "url": $("#id_url").val() },
        "type": "POST",
        "dataType": "json",
        "success": function(d) {
            var opt;
            if (d.length === 0) {
                JSONPrep.error(
                    "baddata",
                    "Could not load from URL. Verify and try again."
                );
                return;
            }
            JSONPrep.response = new JSONPrep.Response(d);
            $.each(JSONPrep.response.getSortedKeys(), function(idx, path) {
                opt = $('<option value=\'' + JSON.stringify(JSONPrep.response.getOption(path).getPath()) + '\'>' + path + ' ('
                        + JSONPrep.response.getOption(path).getLength()
                        + ' items)</option>');
                $("#array-options").append(opt);
            });
            JSONPrep.option = JSONPrep.response.getBestOption();
            JSONPrep.displayer(JSONPrep.option);
            $("#spinner").fadeOut(function() {
                $("#json-upload").fadeIn();
            });
        },
        "error": function(jqXHR, status, err) {
            JSONPrep.error(status, err);
        }
    });
};

/**
 * @static
 * @param {String} transform
 */
JSONPrep.init = function(transform) {
    $("#json-upload").hide();
    $("#array-options").bind("change", function(evt) {
        JSONPrep.option = JSONPrep.response.getOption(
            JSONPrep.Response.Option.pathToLabel(JSON.parse($(this).val()))
        );
        JSONPrep.displayer(JSONPrep.option);
    });
    $("#pager-back").bind("click", function(evt) {
        var curIdx;
        evt.preventDefault();
        curIdx = JSONPrep.option.getBookmark();
        if (curIdx === 0) {
            curIdx = JSONPrep.option.getSampleLength();
        }
        JSONPrep.option.setBookmark(--curIdx % JSONPrep.option.getSampleLength());
        JSONPrep.displayer(JSONPrep.option);
    });
    $("#pager-forward").bind("click", function(evt) {
        var curIdx;
        evt.preventDefault();
        curIdx = JSONPrep.option.getBookmark();
        JSONPrep.option.setBookmark(++curIdx % JSONPrep.option.getSampleLength());
        JSONPrep.displayer(JSONPrep.option);
    });
    $(".upload-form .buttons input.submit").bind("click", function(evt) {
        evt.preventDefault();
        var url = $("#id_url").val();
        $("#input-url")
            .text(url)
            .attr("href", url);
        $(".upload-json").fadeOut(function() {
            JSONPrep.runner(transform);
            $("#systemMsg").hide();
            $("#spinner").fadeIn();
        });
        $("#load-csrf").val(
            $(".upload-form input[name=csrfmiddlewaretoken]").val()
        );
        $("#load-url").val(url);
    });
};

/**
 * @class
 * @param {Array} structure
 */
JSONPrep.Response = function(structure) {
    this._original = structure;
    this._optionCount = this._original.length;
    this._options = {};
    this._ordering = [];
    this._initOptions();
};

/**
 * 
 */
JSONPrep.Response.prototype._initOptions = function() {
    var i, j, option;
    for (i = 0; i < this._optionCount; i++) {
        option = new JSONPrep.Response.Option(this._original[i]);
        if (option.isValid()) {
            this._options[option.getPathLabel()] = option;
            this._ordering.push(option.getPathLabel());
        }
    }
    this._optionCount = this._ordering.length;
    this._original = null;
};

/**
 * @returns JSONPrep.Response.Option
 */
JSONPrep.Response.prototype.getBestOption = function() {
    return this._options[this._ordering[0]];
};

/**
 * @returns Number
 */
JSONPrep.Response.prototype.getOptionCount = function() {
    return this._optionCount;
};

/**
 * @returns Array
 */
JSONPrep.Response.prototype.getSortedKeys = function() {
    return this._ordering;
};

/**
 * @param {String} path
 * @returns JSONPrep.Response.Option
 */
JSONPrep.Response.prototype.getOption = function(path) {
    return this._options[path];
}

/**
 * @class
 * @param {Array} option
 */
JSONPrep.Response.Option = function(option) {
    this._length = option[0];
    this._path = option[1];
    this._pathLabel = JSONPrep.Response.Option.pathToLabel(this._path);
    this._items = option[2];
    this._properties = option[3];
    this._bookmark = 0;
    this._orderedProperties = [];
    this._indexProps();
};

/**
 * @static
 * @param {Array} path
 * @returns String
 */
JSONPrep.Response.Option.pathToLabel = function(path) {
    return "/" + path.join("/");
};

/**
 * @private
 */
JSONPrep.Response.Option.prototype._indexProps = function() {
    var propIndex = {}, max = 0, i, props;
    $.each(this._properties, function(key, val) {
        if (typeof propIndex[val] !== "undefined") {
            propIndex[val].push(key);
        } else {
            propIndex[val] = [key];
        }
        if (val > max) {
            max = val;
        }
    });
    for (i = max; i >= 0; i--) {
        if (typeof propIndex[i] !== "undefined") {
            props = propIndex[i].sort();
            this._orderedProperties = this._orderedProperties.concat(props);
        }
    }
};

/**
 * @returns Boolean
 */
JSONPrep.Response.Option.prototype.isValid = function() {
    return this.getLength() > 0 && $.isArray(this.getItems()) && $.isPlainObject(this.getItems()[0]);
};

/**
 * @returns Number
 */
JSONPrep.Response.Option.prototype.getLength = function() {
    return this._length;
};

/**
 * @returns Number
 */
JSONPrep.Response.Option.prototype.getSampleLength = function() {
    return this.getItems().length;
};

/**
 * @returns Array
 */
JSONPrep.Response.Option.prototype.getItems = function() {
    return this._items;
};

/**
 * @returns Array
 */
JSONPrep.Response.Option.prototype.getProperties = function() {
    return this._orderedProperties;
};

/**
 * @param {String} prop
 * @returns String
 */
JSONPrep.Response.Option.prototype.getPropertyMetadata = function(prop) {
    var count, pctg;
    count = this._properties[prop];
    pctg = Math.round((count / this.getLength()) * 100, 1);
    return '<span title="' + count + ' times">' + pctg + '%</span>';
};

/**
 * @returns Array
 */
JSONPrep.Response.Option.prototype.getPath = function() {
    return this._path;
};

/**
 * @returns String
 */
JSONPrep.Response.Option.prototype.getPathLabel = function() {
    return this._pathLabel;
};

/**
 * @returns Number
 */
JSONPrep.Response.Option.prototype.getBookmark = function() {
    return this._bookmark;
};

/**
 * @param {Number} n
 */
JSONPrep.Response.Option.prototype.setBookmark = function(n) {
    this._bookmark = n;
};
