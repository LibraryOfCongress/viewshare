define(function() {
    // Returns a string which is just the contents of exhibit-wrapper.html.
    // This is necessary to get around cross-browser issues when embedding in
    // development.  This file should be ignored in an optimized build.
    return '<div> <div class="exhibit-wrap"> <div class="row-fluid"> <div id = "top-facets" class="facet-container facet-container-horizontal"></div> </div> <div class="row-fluid"> <div id = "left-facets" class="facet-container"></div> <div id = "views" class="view-container view-default" data-ex-role="viewPanel"></div><div id="right-facets" class="facet-container"></div></div></div></div>';
});
