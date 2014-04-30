/**
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

define(["jquery",
        "jquery-sortable",
        "bootstrap"],
function($) {
    "use strict";

    /**
     * @param container {jQuery} A document object that holds only this UI.
     * @param [active] {Array} An array of objects responding to getID and
     *        getLabel, the options that are selected.
     * @param [inactive] {Array} An array of objects responding to getID and
     *        getLabel, the options that are not selected.
     * @param [options] {Object} Widget options.
     * @param [options.linker] {String} Default "properties", the class used
     *        for both select and deselect lists that allows items to be moved
     *        between them.
     * @param [options.signal] {String} Default "modify.multiselect", the
     *        jQuery event signal sent to container to indicate a change.
     * @param [options.dragTooltip] {String} Default in English, the tooltip
     *        on drag bars to provide a hint on what to do with the bars.
     * @param [options.maxListHeight] {Numeric} Default to null, force the
     *        lists to be no taller than so many pixels high each, scroll if so.
     * @param [options.selectAllText] {String} The label to put on the button
     *        that selects all options.
     * @param [options.deselectAllText] {String} The label to put on the button
     *        that deselects all options.
     */
    var Multiselect = function(container, active, inactive, options) {
        var self = this, buttons, table;
        this._container = container;
        this._options = $.extend({}, {
            "linker" : "properties",
            "signal": "modify.multiselect",
            "dragTooltip": "Drag to change sort order",
            "maxListHeight": null,
            "selectAllText": "Select all",
            "deselectAllText": "Deselect all"
        }, options);

        this._container.hide();

        buttons = $("<div>")
            .addClass("clearfix multiselect-buttons")
            .appendTo(this._container);
	table = $("<table><tbody><tr><td></td><td></td></tr></tbody></table>")
	    .addClass("multiselect-columns")
	    .appendTo(this._container);
        this._deselectButton = $("<button>")
            .text(this._options.deselectAllText)
            .addClass("pull-right btn btn-small deselecting")
            .appendTo(buttons)
            .on("click", function(evt) {
		evt.preventDefault();
                self.deselectAll();
            });
        this._selectButton = $("<button>")
            .text(this._options.selectAllText)
            .addClass("pull-right btn btn-small selecting")
            .appendTo(buttons)
            .on("click", function(evt) {
		evt.preventDefault();
                self.selectAll();
            });
        this._selected = $("<ul>")
            .addClass("sortable")
            .addClass("unstyled")
            .addClass("selected")
            .addClass(this._options.linker)
            .appendTo(table.find("td:eq(0)"))
            .data("id", "selected");
        this._deselected = $("<ul>")
            .addClass("sortable")
            .addClass("unstyled")
            .addClass("deselected")
            .addClass(this._options.linker)
            .appendTo(table.find("td:eq(1)"))
            .data("id", "deselected");

        if (this._options.maxListHeight !== null) {
            this._selected.css("max-height", this._options.maxListHeight);
            this._deselected.css("max-height", this._options.maxListHeight);
        }

        if (typeof active !== "undefined") {
            this.addData(active, true);
        } else {
            this.addData([], true);
        }
        if (typeof inactive !== "undefined") {
            this.addData(inactive, false);
        } else {
            this.addData([], false);
        }

        this._container.show();

        $(this._container).on("click", "i.actionable", function(evt) {
            var type = $(evt.currentTarget).parents(".sortable").data("id");
            if (type === "selected") {
                $(evt.currentTarget).parents("li").appendTo(self._deselected);
            } else {
                $(evt.currentTarget).parents("li").appendTo(self._selected);
            }
            self.onChange($(evt.currentTarget).parents("li"), null);
        });

        this._sortable = this._container.find(".sortable").sortable({
            "group": self._options.linker,
            "distance": 5,
            "delay": 2,
            "handle": "i.draggable",
            "onDrop": function(item, container, _super) {
                self.onChange(item, container);
                _super(item, container);
            },
            "serialize": function(parent, children, parentIsContainer) {
                return self.serialize(parent, children, parentIsContainer);
            }
        });
    };

    /**
     * Add data to the widget.  Items must respond to getID and getLabel.
     * @param data {Array} Items to add to multiselect options.
     * @param selected {Boolean} If true, add items to selected list. Add to
     *        deselected list otherwise.
     */
    Multiselect.prototype.addData = function(data, selected) {
        var i, option, self = this;
        for (i = 0; i < data.length; i++) {
            $("<li>")
                .data("id", data[i].getID())
                .append("<i class='fa fa-bars draggable' title='" + self._options.dragTooltip + "'></i>")
                .append("<i class='actionable fa " + (selected ? "fa-check-square-o" : "fa-square-o") + "'></i>")
                .append("<span>" + data[i].getLabel() + "</span>")
                .appendTo(selected ? this._selected : this._deselected);
        }

        this._uiRefresh();
    };

    /**
     * Move all deselected items to selected list, in order.
     */
    Multiselect.prototype.selectAll = function() {
        var self = this;
        this._deselected.find("li").each(function(idx, el) {
            $(el).appendTo(self._selected);
        });
        this.onChange(null, null);
    };

    /**
     * Move all selected items to deselected list, in order.
     */
    Multiselect.prototype.deselectAll = function() {
        var self = this;
        this._selected.find("li").each(function(idx, el) {
            $(el).appendTo(self._deselected);
        });
        this.onChange(null, null);
    };

    Multiselect.prototype._uiRefresh = function() {
        this._selected.find("i.actionable").toggleClass("fa-check-square-o", true).toggleClass("fa-square-o", false);
        this._deselected.find("i.actionable").toggleClass("fa-check-square-o", false).toggleClass("fa-square-o", true);

        if (this._selected.find("li").length > 0) {
            this._selected.toggleClass("empty", false);
            this._deselectButton.prop("disabled", false);
        } else {
            this._selected.toggleClass("empty", true);
            this._deselectButton.prop("disabled", true);
        }

        if (this._deselected.find("li").length > 0) {
            this._deselected.toggleClass("empty", false);
            this._selectButton.prop("disabled", false);
        } else {
            this._deselected.toggleClass("empty", true);
            this._selectButton.prop("disabled", true);
        }
    };

    /**
     * Call whenever state changes.  Triggers jQuery event for listeners
     * to the widget's signal.
     * Parameters are irrelevant though they mirror jQuery Sortable
     * change function.
     * @param item {Object} Irrelevant
     * @param container {Object} Irrelevant
     */
    Multiselect.prototype.onChange = function(item, container) {
        var data, selected;

        this._uiRefresh();

        data = this._sortable.sortable("serialize").get();
        selected = [];
        // re-format serialization
        $.each(data, function(i, val) {
            if (val.id === "selected") {
                $.each(val.items, function(j, v) {
                    selected.push(v.id);
                });
            }
        });
        $(this._container).trigger(this._options.signal, [selected]);
    };

    /**
     * Rewrite serialization to take parent data into account always.
     * Passed through from jQuery Sortable serialization method.
     * @param parent {Object}
     * @param children {Object}
     * @param parentIsContainer {Boolean}
     */
    Multiselect.prototype.serialize = function(parent, children, parentIsContainer) {
        var result = $.extend({}, parent.data());
        if (children[0]) {
            result.items = children;
        } else {
            result.items = [];
        }

        delete result.subContainers;
        delete result.sortable;

        return result;
    };

    /**
     * Empty widget DOM object and remove pointers.
     */
    Multiselect.prototype.destroy = function() {
        this._container.off('click', 'i.actionable');
        this._container.empty();
        this._container = null;
        this._options = null;
        this._selected = null;
        this._deselected = null;
        this._selectButton = null;
        this._deselectButton = null;
    };

    return Multiselect;
});
