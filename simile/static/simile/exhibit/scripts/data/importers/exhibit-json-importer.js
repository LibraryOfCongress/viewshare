/*==================================================
 *  Exhibit.ExhibitJSONImporter
 *==================================================
 */
 
Exhibit.ExhibitJSONImporter = {
};
Exhibit.importers["application/json"] = Exhibit.ExhibitJSONImporter;

Exhibit.ExhibitJSONImporter.load = function(link, database, cont) {
    var url = typeof link == "string" ? link : link.href;
//    url = Exhibit.Persistence.resolveURL(url);

    Exhibit.UI.showBusyIndicator();
//    SimileAjax.XmlHttp.get(url, fError, fDone);
    SimileAjax.jQuery.ajax({
        url: url,
        method: "GET",
        dataType: "json",

        success: function(data, textStatus, jqXHR) {
            Exhibit.UI.hideBusyIndicator();
            database.loadData(data, Exhibit.Persistence.resolveURL(Exhibit.Persistence.getBaseURL(url)));
            if (cont) cont();

        },
        error: function(jqXHR, textStatus, errorThrown) {
            Exhibit.UI.hideBusyIndicator();

            if (textStatus == "parsererror") {
                Exhibit.UI.showJsonFileValidation(Exhibit.l10n.badJsonMessage(url, errorThrown), url);

            } else {
                Exhibit.UI.showHelp(Exhibit.l10n.failedToLoadDataFileMessage(url));
            }
            if (cont) cont();

        }
    });
};

