/*==================================================
 *  Exhibit.OLMapView
 *
 *  Utilizing OpenLayers map API
 *  http://openlayers.org/
 *
 *  Funding for development of this extension in part
 *  by Zepheira.  Copyright (c) Zepheira 2009.
 *  http://zepheira.com/
 *  See the main Exhibit LICENSE.txt for licensing.
 *==================================================
 */

define("ext/map/scripts/base",[],function(){var e={params:{bundle:!1,gmapKey:null,service:null,mapPrefix:"http://api.simile-widgets.org"},paramTypes:{bundle:Boolean,service:String,gmapKey:String,mapPrefix:String},cssFiles:["styles/main.css"],bundledCssFile:"styles/map-extension-bundle.css",urlPrefix:null,markerUrlPrefix:"http://service.simile-widgets.org/painter/painter?",initialized:!1,hasCanvas:!1,_CORSWarned:!1};return e}),define("ext/map/scripts/canvas",["lib/jquery"],function(e){var t={};return t.makeShadow=function(t,n){var r,i,s,o,u;return r=e(t).width(),i=e(t).height(),s=r+i,o=e("<canvas>").css("width",s).css("height",i).attr("width",s).attr("height",i),u=e(o).get(0).getContext("2d"),u.scale(1,.5),u.translate(i/2,i),u.transform(1,0,-0.5,1,0,0),u.fillRect(0,0,r,i),u.globalAlpha=n.shapeAlpha,u.globalCompositeOperation="destination-in",u.drawImage(t,0,0),o},t.makeIcon=function(n,r,i,s,o,u,a){var f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A;f=a.pin,u>0&&(n=u,r=u,f=!1),l=a.pinWidth,c=a.pinHeight,h=1,p=a.borderColor||"black",d=a.shapeAlpha,v=n-h,m=r-h,g=r+(f?c:0),b=e("<canvas>").css("width",n).css("height",g).attr("width",n).attr("height",g),w=e(b).get(0).getContext("2d"),w.clearRect(0,0,n,g),w.beginPath(),a&&a.shape==="circle"?(y=v/2,f?(E=Math.atan2(l/2,m/2),w.arc(n/2,r/2,y,Math.PI/2+E,Math.PI/2-E),w.lineTo(n/2,r+c-h/2)):w.arc(n/2,r/2,y,0,2*Math.PI)):(y=v/4,S=T=h/2,x=r-h/2,N=n-h/2,w.moveTo(N-y,S),w.arcTo(N,S,N,S+y,y),w.lineTo(N,x-y),w.arcTo(N,x,N-y,x,y),f&&(w.lineTo(n/2+l/2,x),w.lineTo(n/2,r+c-h/2),w.lineTo(n/2-l/2,x)),w.lineTo(T+y,x),w.arcTo(T,x,T,x-y,y),w.lineTo(T,S+y),w.arcTo(T,S,T+y,S,y)),w.closePath(),w.fillStyle=i,w.globalAlpha=d,w.fill();if(o!==null){w.save(),w.clip(),w.globalAlpha=1,w.translate(n/2+a.iconOffsetX,r/2+a.iconOffsetY),k=parseFloat(r)/o.naturalHeight,L=parseFloat(n)/o.naturalWidth;switch(a.iconFit){case"width":C=L;break;case"height":C=k;break;case"both":case"larger":C=Math.min(k,L);break;case"smaller":C=Math.max(k,L)}w.scale(C,C),w.scale(a.iconScale,a.iconScale),w.drawImage(o,-o.naturalWidth/2,-o.naturalHeight/2),w.restore()}return w.strokeStyle=p,w.lineWidth=h,w.stroke(),A=t.makeShadow(b.get(0),a),typeof s!="undefined"&&s!==null&&s.length>0&&(w.textBaseline="middle",w.textAlign="center",w.globalAlpha=1,w.font=a.markerFontFamily,w.fillStyle=a.markerFontColor,w.fillText(s,n/2,r/2,n/1.4)),{iconURL:b.get(0).toDataURL(),shadowURL:A.get(0).toDataURL()}},t}),define("ext/map/scripts/painter",["./base"],function(e){var t={};return t.makeIcon=function(t,n,r,i,s,o,u){var a,f,l,c,h;return o>0&&(t=o,n=o,u.pin=!1),a=["renderer=map-marker","shape="+u.shape,"alpha="+u.shapeAlpha,"width="+t,"height="+n,"background="+r.substr(1),"label="+i],f=["renderer=map-marker-shadow","shape="+u.shape,"width="+t,"height="+n],l=[],u.pin&&o<=0?(c=u.pinHeight,h=Math.ceil(u.pinWidth/2),l.push("pinHeight="+c),l.push("pinWidth="+h*2)):l.push("pin=false"),s!==null&&(a.push("icon="+s),u.iconFit!=="smaller"&&a.push("iconFit="+u.iconFit),u.iconScale!==1&&a.push("iconScale="+u.iconScale),u.iconOffsetX!==1&&a.push("iconX="+u.iconOffsetX),u.iconOffsetY!==1&&a.push("iconY="+u.iconOffsetY)),{iconURL:e.markerUrlPrefix+a.concat(l).join("&")+"&.png",shadowURL:e.markerUrlPrefix+f.concat(l).join("&")+"&.png"}},t}),define("ext/map/scripts/marker",["lib/jquery","scripts/exhibit-core","./base","./canvas","./painter"],function(e,t,n,r,i){var s=function(e,t,n,r){this.icon=e,this.shadow=t,this.shape=n,this.settings=r};return s.detectCanvas=function(){var t=e("<canvas>");n.hasCanvas=typeof t.get(0).getContext!="undefined"&&t.get(0).getContext("2d")!==null,t=null},s.makeIcon=function(e,t,s,o,u,a,f){return n.hasCanvas?r.makeIcon(e,t,s,o,u,a,f):i.makeIcon(e,t,s,o,u,a,f)},s._makeMarkerKey=function(e,t,n,r,i){return"#"+[e,t,n,r,i].join("#")},s.makeMarker=function(o,u,a,f,l,c,h){var p,d,v,m,g,y,b,w,E,S,x,T,N,C,k;return p=l.length*3,d=Math.ceil(c.shapeWidth/2)+p,v=c.shapeHeight+2*p,m=d*2,g=v,y=c.pin,a>0&&(m=a,d=Math.ceil(a/2),g=a,v=a),b={anchor:null,size:null,url:null},w={type:"poly",coords:null},E={anchor:null,size:null,url:null},y?(S=c.pinHeight,x=Math.ceil(c.pinWidth/2),g+=S,b.anchor=[d,g],E.anchor=[d,g],w.coords=[0,0,0,v,d-x,v,d,g,d+x,v,m,v,m,0],b.infoWindowAnchor=c.bubbleTip==="bottom"?[d,g]:[d,0]):(b.anchor=[d,Math.ceil(g/2)],E.anchor=[d,Math.ceil(g/2)],w.coords=[0,0,0,v,m,v,m,0],b.infoWindowAnchor=[d,0]),b.size=[m,g],E.size=[m+g/2,g],n.hasCanvas?T=r.makeIcon(m,v,u,l,null,a,c):T=i.makeIcon(m,v,u,l,f,a,c),b.url=T.iconURL,E.url=T.shadowURL,N=new s(b,E,w,c),f!==null&&(C=new Image,e(C).one("load error",function(e){var p,d,g;if(e.type!=="error"){try{p=r.makeIcon(m,v,u,l,C,a,c).iconURL}catch(y){n._CORSWarned||(n._CORSWarned=!0,t.Debug.warn(t._("%MapView.error.remoteImage",f))),p=i.makeIcon(m,v,u,l,f,a,c).iconURL}g=s._makeMarkerKey(o,u,a,f,l),h.updateMarkerIcon(g,p)}}).attr("src",f)),N},s.prototype.hasShadow=function(){return this.shadow!==null},s.prototype.setIcon=function(e){this.icon=e},s.prototype.getIcon=function(){return this.icon},s.prototype.setShadow=function(e){this.shadow=e},s.prototype.getShadow=function(){return this.shadow},s.prototype.setShape=function(e){this.shape=e},s.prototype.getShape=function(){return this.shape},s.prototype.setSettings=function(e){this.settings=e},s.prototype.getSettings=function(){return this.settings},s.prototype.dispose=function(){this.icon=null,this.shadow=null,this.shape=null,this.settings=null},s}),define("ext/map/nls/locale",{root:!0,de:!0,es:!0,fr:!0,nl:!0,sv:!0}),define("scripts/ui/coordinator",["lib/jquery","./ui-context"],function(e,t){var n=function(t,r){this._listeners=[];var i,s,o,u,a,f;a=this,i=r,s=null,o=t,u=!1,this.getID=function(){return s},this.getUIContext=function(){return o},this.getContainer=function(){return e(i)},f=function(){typeof i!="undefined"&&i!==null&&(s=e(i).attr("id"));if(typeof s=="undefined"||s===null)s=a.getUIContext().getCollection().getID()+"-"+a.getUIContext().getMain().getRegistry().generateIdentifier(n.getRegistryKey())},this.register=function(){this.getUIContext().getMain().getRegistry().register(n.getRegistryKey(),this.getID(),this),u=!0},this.unregister=function(){a.getUIContext().getMain().getRegistry().unregister(n.getRegistryKey(),a.getID()),u=!1},this.dispose=function(){typeof this._dispose!="undefined"&&this._dispose(),this.unregister(),this.getUIContext().dispose(),s=null,i=null,o=null,a=null},f()};return n._registryKey="coordinator",n.getRegistryKey=function(){return n._registryKey},n.registerComponent=function(e,t){t.hasRegistry(n.getRegistryKey())||t.createRegistry(n.getRegistryKey())},n.create=function(e,t){var r=new n(t);return r.register(),r},n.createFromDOM=function(e,r){var i=new n(t.createFromDOM(e,r,!1),e);return i.register(),i},n.prototype.addListener=function(e){var t=new n._Listener(this,e);return this._listeners.push(t),t},n.prototype._removeListener=function(e){var t;for(t=0;t<this._listeners.length;t++)if(this._listeners[t]===e){this._listeners.splice(t,1);return}},n.prototype._fire=function(e,t){var n,r;for(n=0;n<this._listeners.length;n++)r=this._listeners[n],r!==e&&r._callback(t)},n._Listener=function(e,t){this._coordinator=e,this._callback=t},n._Listener.prototype.dispose=function(){this._coordinator._removeListener(this)},n._Listener.prototype.fire=function(e){this._coordinator._fire(this,e)},e(document).on("registerComponents.exhibit",n.registerComponent),n}),define("scripts/ui/coders/coder",["lib/jquery"],function(e){var t=function(n,r,i){var s,o,u,a,f,l,c;s=this,l=e(r),f=i,o=n,u=!1,a=null,this._settingSpecs={},this._settings={},this.addSettingSpecs=function(t){e.extend(!0,this._settingSpecs,t)},this.getSettingSpecs=function(){return this._settingSpecs},this.getID=function(){return a},this.getUIContext=function(){return f},this.getContainer=function(){return l},this.register=function(){this.getUIContext().getMain().getRegistry().register(t.getRegistryKey(),this.getID(),this),u=!0},this.unregister=function(){s.getUIContext().getMain().getRegistry().unregister(t.getRegistryKey(),s.getID()),u=!1},this._dispose=function(){this._settingSpecs=null,this._settings=null,e(l).empty(),l=null,this.unregister(),f=null},c=function(){a=e(l).attr("id");if(typeof a=="undefined"||a===null)a=o+"-"+s.getUIContext().getCollection().getID()+"-"+s.getUIContext().getMain().getRegistry().generateIdentifier(t.getRegistryKey())},c()};return t._registryKey="coder",t.getRegistryKey=function(){return t._registryKey},t.registerComponent=function(e,n){n.hasRegistry(t.getRegistryKey())||n.createRegistry(t.getRegistryKey())},e(document).on("registerComponents.exhibit",t.registerComponent),t}),define("ext/openlayers/scripts/openlayers-view",["lib/jquery","exhibit","openlayers","ext/map/scripts/base","ext/map/scripts/marker","scripts/util/debug","scripts/util/set","scripts/util/accessors","scripts/util/settings","scripts/util/views","scripts/data/expression-parser","scripts/ui/ui-context","scripts/ui/views/view","scripts/ui/coordinator","scripts/ui/coders/coder","scripts/ui/formatter","scripts/ui/coders/default-color-coder","lib/jquery.simile.dom"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m){var g=function(t,n){g._initialize();var r=this;e.extend(this,new h("map",t,n)),this.addSettingSpecs(g._settingSpecs),this._settings={},this._accessors={getProxy:function(e,t,n){n(e)},getColorKey:null,getSizeKey:null,getIconKey:null,getIcon:null},this._colorCoder=null,this._sizeCoder=null,this._iconCoder=null,this._selectListener=null,this._itemIDToMarker={},this._markerLabelExpression=null,this._markerCache={},this._shown=!1,this._onItemsChanged=function(){r._reconstruct()},e(n.getCollection().getElement()).bind("onItemsChanged.exhibit",r._onItemsChanged),this.register()};return g.contexts={},g._settingSpecs={latlngOrder:{type:"enum",defaultValue:"latlng",choices:["latlng","lnglat"]},latlngPairSeparator:{type:"text",defaultValue:";"},center:{type:"float",defaultValue:null,dimensions:2},zoom:{type:"float",defaultValue:null},scrollWheelZoom:{type:"boolean",defaultValue:!0},scaleControl:{type:"boolean",defaultValue:!0},overviewControl:{type:"boolean",defaultValue:!1},type:{type:"enum",defaultValue:"osm",choices:["osm","wms","gmap","gsat","ghyb","gter","vmap","vsat","vhyb","ymap","ysat","yhyb"]},bubbleTip:{type:"enum",defaultValue:"top",choices:["top","bottom"]},mapHeight:{type:"int",defaultValue:400},mapConstructor:{type:"function",defaultValue:null},markerLabel:{type:"text",defaultValue:".label"},projection:{type:"function",defaultValue:null},color:{type:"text",defaultValue:"#FF9000"},colorCoder:{type:"text",defaultValue:null},sizeCoder:{type:"text",defaultValue:null},iconCoder:{type:"text",defaultValue:null},selectCoordinator:{type:"text",defaultValue:null},iconSize:{type:"int",defaultValue:0},iconFit:{type:"text",defaultValue:"smaller"},iconScale:{type:"float",defaultValue:1},iconOffsetX:{type:"float",defaultValue:0},iconOffsetY:{type:"float",defaultValue:0},shape:{type:"text",defaultValue:"circle"},shapeWidth:{type:"int",defaultValue:24},shapeHeight:{type:"int",defaultValue:24},shapeAlpha:{type:"float",defaultValue:.7},pin:{type:"boolean",defaultValue:!0},pinHeight:{type:"int",defaultValue:6},pinWidth:{type:"int",defaultValue:6},borderOpacity:{type:"float",defaultValue:.5},borderWidth:{type:"int",defaultValue:1},borderColor:{type:"text",defaultValue:null},opacity:{type:"float",defaultValue:.7},sizeLegendLabel:{type:"text",defaultValue:null},colorLegendLabel:{type:"text",defaultValue:null},iconLegendLabel:{type:"text",defaultValue:null},markerFontFamily:{type:"text",defaultValue:"12pt sans-serif"},markerFontColor:{type:"text",defaultValue:"black"},markerScale:{type:"text",defaultValue:null},showHeader:{type:"boolean",defaultValue:!0},showSummary:{type:"boolean",defaultValue:!0},showFooter:{type:"boolean",defaultValue:!0},showToolbox:{type:"boolean",defaultValue:!0},mapURL:{type:"text",defaultValue:"http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"},aerialURL:{type:"text",defaultValue:"http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg"},mapAttribution:{type:"text",defaultValue:"&copy; <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors. Tiles Courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>"},aerialAttribution:{type:"text",defaultValue:"Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency. Tiles Courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>"}},g._accessorSpecs=[{accessorName:"getProxy",attributeName:"proxy"},{accessorName:"getLatlng",alternatives:[{bindings:[{attributeName:"latlng",types:["float","float"],bindingNames:["lat","lng"]},{attributeName:"maxAutoZoom",type:"float",bindingName:"maxAutoZoom",optional:!0}]},{bindings:[{attributeName:"lat",type:"float",bindingName:"lat"},{attributeName:"lng",type:"float",bindingName:"lng"},{attributeName:"maxAutoZoom",type:"float",bindingName:"maxAutoZoom",optional:!0}]}]},{accessorName:"getPolygon",attributeName:"polygon",type:"text"},{accessorName:"getPolyline",attributeName:"polyline",type:"text"},{accessorName:"getColorKey",attributeName:"marker",type:"text"},{accessorName:"getColorKey",attributeName:"colorKey",type:"text"},{accessorName:"getSizeKey",attributeName:"sizeKey",type:"text"},{accessorName:"getIconKey",attributeName:"iconKey",type:"text"},{accessorName:"getIcon",attributeName:"icon",type:"url"}],g._initialize=function(){if(!r.initialized){var s,o;e("head link").each(function(t,n){s=e(n).attr("rel"),s.match(/\b(exhibit-map-painter|exhibit\/map-painter)\b/)&&(r.markerUrlPrefix=e(n).attr("href")+"?")}),i.detectCanvas(),r.urlPrefix!==null?n.ImgPath=r.urlPrefix+"images/":t.urlPrefix!==null?n.ImgPath=t.urlPrefix+"extensions/openlayers/images/":n.ImgPath="http://openlayers/org/api/"+r.openLayersVersion+"/img/",r.initialized=!0}},g.create=function(e,t,n){var r=new g(t,c.create(e,n));return g._configure(r,e),r._internalValidate(),r._initializeUI(),r},g.createFromDOM=function(e,n,r){var i,s;return i=t.getConfigurationFromDOM(e),s=new g(typeof n!="undefined"&&n!==null?n:e,c.createFromDOM(e,r)),u.createAccessorsFromDOM(e,g._accessorSpecs,s._accessors),a.collectSettingsFromDOM(e,s.getSettingSpecs(),s._settings),g._configure(s,i),s._internalValidate(),s._initializeUI(),s},g._configure=function(e,t){var n;u.createAccessors(t,g._accessorSpecs,e._accessors),a.collectSettings(t,e.getSettingSpecs(),e._settings),n=e._accessors,e._getLatlng=typeof n.getLatlng!="undefined"&&n.getLatlng!==null?function(e,t,r){n.getProxy(e,t,function(e){n.getLatlng(e,t,r)})}:null,e._markerLabelExpression=l.parse(e._settings.markerLabel)},g.prototype.dispose=function(){var t=this;e(this.getUIContext().getCollection().getElement()).unbind("onItemsChanged.exhibit",t._onItemsChanged),this._map.destroy(),this._map=null,this._selectListener!==null&&(this._selectListener.dispose(),this._selectListener=null),this._itemIDToMarker={},this._markerCache=null,this._dom.dispose(),this._dom=null,this._dispose()},g.prototype._internalValidate=function(){var e,t,n;e=this.getUIContext().getMain(),this._accessors.getColorKey!==null&&(this._settings.colorCoder!==null&&(this._colorCoder=this.getUIContext().getMain().getRegistry().get(d.getRegistryKey(),this._settings.colorCoder)),this._colorCoder===null&&(this._colorCoder=new m(this.getUIContext()))),this._accessors.getSizeKey!==null&&this._settings.sizeCoder!==null&&(this._sizeCoder=this.getUIContext().getMain().getRegistry().get(d.getRegistryKey(),this._settings.sizeCoder),typeof this._settings.markerScale!="undefined"&&this._settings.markerScale!==null&&(this._sizeCoder._settings.markerScale=this._settings.markerScale)),this._accessors.getIconKey!==null&&this._settings.iconCoder!==null&&(this._iconCoder=this.getUIContext().getMain().getRegistry().get(d.getRegistryKey(),this._settings.iconCoder)),typeof this._settings.selectCoordinator!="undefined"&&(t=this.getUIContext().getMain().getRegistry().get(p.getRegistryKey(),this._settings.selectCoordinator),t!==null&&(n=this,this._selectListener=t.addListener(function(e){n._select(e)})))},g.prototype._initializeUI=function(){var t,n,r;t=this,n={},n.colorGradient=this._colorCoder!==null&&typeof this._colorCoder._gradientPoints!="undefined",n.colorMarkerGenerator=this._createColorMarkerGenerator(),n.sizeMarkerGenerator=this._createSizeMarkerGenerator(),n.iconMarkerGenerator=this._createIconMarkerGenerator(),e(this.getContainer()).empty(),this._dom=f.constructPlottingViewDom(this.getContainer(),this.getUIContext(),this._settings.showSummary&&this._settings.showHeader,{onResize:function(){t._map.checkResize()}},n),r=this._dom.plotContainer,e(r).attr("class","exhibit-mapView-map").css("height",this._settings.mapHeight),this._map=this._constructMap(r),this._reconstruct()},g.prototype._constructMap=function(e){var t,r,i,s,o,u,a,f,l;return t=this._settings,typeof t.projection!="undefined"&&t.projection!==null?this._projection=t.projection():this._projection=new n.Projection("EPSG:4326"),typeof t.mapConstructor!="undefined"&&t.mapConstructor!==null?t.mapConstructor(e):(r=new n.Map({div:e,controls:[],projection:new n.Projection("EPSG:900913"),displayProjection:this._projection,units:"m",numZoomLevels:18,maxResolution:156543.0339,maxExtent:new n.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),theme:null}),i=new n.Layer.OSM("Street",t.mapURL,{wrapDateLine:!0,attribution:t.mapAttribution}),i.setVisibility(!1),s=new n.Layer.OSM("Aerial",t.aerialURL,{wrapDateLine:!0,attribution:t.aerialAttribution}),s.setVisibility(!1),o=[i,s],u={osm:i,aerial:s},a=new n.Layer.Vector("Features",{wrapDateLine:!0,projection:new n.Projection("EPSG:900913")}),o.push(a),typeof u[t.type]!="undefined"?u[t.type].setVisibility(!0):i.setVisibility(!0),r.addLayers(o),t.center!==null&&typeof t.center[0]!="undefined"&&typeof t.center[1]!="undefined"&&(t.zoom!==null?r.setCenter((new n.LonLat(t.center[1],t.center[0])).transform(this._projection,r.getProjectionObject()),t.zoom):r.setCenter((new n.LonLat(t.center[1],t.center[0])).transform(this._projection,r.getProjectionObject()))),r.addControl(new n.Control.PanPanel),t.overviewControl&&r.addControl(new n.Control.OverviewMap),t.scaleControl&&r.addControl(new n.Control.ZoomPanel),f=this,l=new n.Control.SelectFeature(a,{onSelect:function(e){f._onFeatureSelect(f,e)},onUnselect:function(e){f._onFeatureUnselect(f,e)}}),r.addControl(l),l.activate(),r.addControl(new n.Control.Navigation(t.scrollWheelZoom,!0,n.Handler.MOD_SHIFT,!0)),r.addControl(new n.Control.LayerSwitcher),r.addControl(new n.Control.Attribution),r)},g.prototype._createColorMarkerGenerator=function(){var t=this._settings;return function(n){return e.simileBubble("createTranslucentImage",i.makeIcon(t.shapeWidth,t.shapeHeight,n,null,null,t.iconSize,t).iconURL,"middle")}},g.prototype._createSizeMarkerGenerator=function(){var t=e.extend({},this._settings);return t.pinHeight=0,function(n){return e.simileBubble("createTranslucentImage",i.makeIcon(t.shapeWidth,t.shapeHeight,t.color,null,null,n,t).iconURL,"middle")}},g.prototype._createIconMarkerGenerator=function(){return function(t){var n=e("img").attr("src",t).css("vertical-align","middle").css("height",40);return e(n).get(0)}},g.prototype._clearOverlays=function(){var e;e=this._map.getLayersByClass("OpenLayers.Layer.Vector"),e.length===1&&e[0].destroyFeatures();while(this._map.popups.length>0)this._map.removePopup(this._map.popups[0])},g.prototype._reconstruct=function(){var e,t;this._clearOverlays(),typeof this._dom.legendWidget!="undefined"&&this._dom.legendWidget!==null&&this._dom.legendWidget.clear(),typeof this._dom.legendGradientWidget!="undefined"&&this._dom.legendWidgetGradient!==null&&this._dom.legendGradientWidget.reconstruct(),this._itemIDToMarker={},e=this.getUIContext().getCollection().countRestrictedItems(),t=[],e>0&&this._rePlotItems(t),this._dom.setUnplottableMessage(e,t)},g.prototype._rePlotItems=function(t){var r,i,s,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A,O,M,_,D,P,H,B,j,F,I,q;r=this,i=this.getUIContext().getCollection(),s=this.getUIContext().getDatabase(),u=this._settings,a=this._accessors,f=i.getRestrictedItems(),l={},c=a.getColorKey!==null,h=a.getSizeKey!==null,p=a.getIconKey!==null,d=a.getIcon!==null,v=this._getLatlng!==null,m=a.getPolygon!==null,g=a.getPolyline!==null,y={mixed:!1,missing:!1,others:!1,keys:new o},b={mixed:!1,missing:!1,others:!1,keys:new o},w={mixed:!1,missing:!1,others:!1,keys:new o},E=u.latlngOrder==="latlng"?function(e,t){return new n.Geometry.Point(t,e)}:function(e,t){return new n.Geometry.Point(e,t)},f.visit(function(e){var n,i,u,f,d,b,w,S,x,T,N,C;n=[],i=[],u=[],v&&r._getLatlng(e,s,function(e){e!==null&&e.hasOwnProperty("lat")&&e.hasOwnProperty("lng")&&n.push(e)}),m&&a.getPolygon(e,s,function(e){e!==null&&i.push(e)}),g&&a.getPolyline(e,s,function(e){e!==null&&u.push(e)});if(n.length>0||i.length>0||u.length>0){f=r._settings.color,d=null,c&&(d=new o,a.getColorKey(e,s,function(e){d.add(e)}),f=r._colorCoder.translateSet(d,y));if(n.length>0){b=null,h&&(b=new o,a.getSizeKey(e,s,function(e){b.add(e)})),w=null,p&&(w=new o,a.getIconKey(e,s,function(e){w.add(e)}));for(S=0;S<n.length;S++)x=n[S],T=x.lat+","+x.lng,l.hasOwnProperty(T)?(N=l[T],N.items.push(e),c&&N.colorKeys.addSet(d),h&&N.sizeKeys.addSet(b),p&&N.iconKeys.addSet(w)):(N={latlng:x,items:[e]},c&&(N.colorKeys=d),h&&(N.sizeKeys=b),p&&(N.iconKeys=w),l[T]=N)}for(C=0;C<i.length;C++)r._plotPolygon(e,i[C],f,E);for(C=0;C<u.length;C++)r._plotPolyline(e,u[C],f,E)}else t.push(e)}),x=Infinity,T=function(t){var i,o,u,f,l,v,m,g,E,T,N;i=t.items.length;if(typeof S=="undefined"||S===null)S=new n.Bounds;o=r._settings.shape,u=r._settings.color,c&&(u=r._colorCoder.translateSet(t.colorKeys,y)),f=r._settings.iconSize,h&&(f=r._sizeCoder.translateSet(t.sizeKeys,b)),l=null,i===1&&d&&a.getIcon(t.items[0],s,function(e){l=e}),p&&(l=r._iconCoder.translateSet(t.iconKeys,w)),v=(new n.LonLat(t.latlng.lng,t.latlng.lat)).transform(r._projection,r._map.getProjectionObject()),g=r._makeMarker(v,o,u,f,l,i===1?"":i.toString(),r._settings),g.map=r._map,g.attributes={locationData:t},m=r._map.getLayersByClass("OpenLayers.Layer.Vector")[0],m.addFeatures([g]),T=r._createInfoWindow(t.items),E=new n.Popup.FramedCloud("markerPoup"+Math.floor(Math.random()*1e4),v,new n.Size(200,200),e(T).html(),null,!0),g.attributes.dom=T,g.popup=E,E.feature=g,E.autoSize=!0,x>t.latlng.maxAutoZoom&&(x=t.latlng.maxAutoZoom),S.extend(v);for(N=0;N<t.items.length;N++)r._itemIDToMarker[t.items[N]]=g};for(N in l)l.hasOwnProperty(N)&&T(l[N]);if(c){C=this._dom.legendWidget,k=this._colorCoder,L=y.keys.toArray().sort(),u.colorLegendLabel!==null&&C.addLegendLabel(u.colorLegendLabel,"color");if(typeof k._gradientPoints!="undefined"&&k._gradientPoints!==null)A=this._dom.legendWidget,A.addGradient(this._colorCoder._gradientPoints),typeof u.colorLegendLabel!="undefined"&&u.colorLegendLabel!==null&&A.addLegendLabel(u.colorLegendLabel);else for(O=0;O<L.length;O++)M=L[O],_=k.translate(M),C.addEntry(_,M);y.others&&C.addEntry(k.getOthersColor(),k.getOthersLabel()),y.mixed&&C.addEntry(k.getMixedColor(),k.getMixedLabel()),y.missing&&C.addEntry(k.getMissingColor(),k.getMissingLabel())}if(h){C=this._dom.legendWidget,D=this._sizeCoder,L=b.keys.toArray().sort(),u.sizeLegendLabel!==null&&C.addLegendLabel(u.sizeLegendLabel,"size");if(D._gradientPoints!==null){P=D._gradientPoints,H=(P[P.length-1].value-P[0].value)/5,L=[];for(B=0;B<6;B++)L.push(Math.floor(P[0].value+H*B));for(O=0;O<L.length;O++)M=L[O],j=D.translate(M),C.addEntry(j,M,"size")}else{for(O=0;O<L.length;O++)M=L[O],j=D.translate(M),C.addEntry(j,M,"size");b.others&&C.addEntry(D.getOthersSize(),D.getOthersLabel(),"size"),b.mixed&&C.addEntry(D.getMixedSize(),D.getMixedLabel(),"size"),b.missing&&C.addEntry(D.getMissingSize(),D.getMissingLabel(),"size")}}if(p){C=this._dom.legendWidget,F=this._iconCoder,L=w.keys.toArray().sort(),u.iconLegendLabel!==null&&C.addLegendLabel(u.iconLegendLabel,"icon");for(O=0;O<L.length;O++)M=L[O],I=F.translate(M),C.addEntry(I,M,"icon");w.others&&C.addEntry(F.getOthersIcon(),F.getOthersLabel(),"icon"),w.mixed&&C.addEntry(F.getMixedIcon(),F.getMixedLabel(),"icon"),w.missing&&C.addEntry(F.getMissingIcon(),F.getMissingLabel(),"icon")}typeof S!="undefined"&&S!==null&&u.zoom===null&&!this._shown?(x>12&&(x=12),q=Math.max(0,r._map.getZoomForExtent(S)-1),q=Math.min(q,x),r._map.zoomTo(q)):r._map.zoomTo(u.zoom),typeof S!="undefined"&&S!==null&&u.zoom===null&&u.center===null&&r._map.setCenter(S.getCenterLonLat()),this._shown=!0},g.prototype._plotPolygon=function(e,t,r,i){var s,o,u,a,f,l;return s=this._parsePolygonOrPolyline(t,i),s.length>1?(o=this._settings,u=o.borderColor!==null?o.borderColor:r,a=(new n.Geometry.LinearRing(s)).transform(this._projection,this._map.getProjectionObject()),f={strokeColor:u,strokeWidth:o.borderWidth,strokeOpacity:o.borderOpacity,fillColor:r,fillOpacity:o.opacity},l=new n.Feature.Vector(a,null,f),l.map=this._map,l.attributes={locationData:{items:[e]}},this._addPolygonOrPolyline(e,l)):null},g.prototype._plotPolyline=function(e,t,r,i){var s,o,u,a,f,l;return s=this._parsePolygonOrPolyline(t,i),s.length>1?(o=this._settings,u=o.borderColor!==null?o.borderColor:r,a=(new n.Geometry.LineString(s)).transform(this._projection,this._map.getProjectionObject()),f={strokeColor:u,strokeWidth:o.borderWidth,strokeOpacity:o.borderOpacity},l=new n.Feature.Vector(a,null,f),l.map=this._map,l.attributes={locationData:{items:[e]}},this._addPolygonOrPolyline(e,l)):null},g.prototype._addPolygonOrPolyline=function(e,t){var r,i,s,o,u;return r=this._map.getLayersByClass("OpenLayers.Layer.Vector"),r.length>0?(i=r[0],i.addFeatures([t]),s=this,o=t.geometry.getCentroid(),u=new n.Popup.FramedCloud("vectorPopup"+Math.floor(Math.random()*1e4),new n.LonLat(o.x,o.y),null,s._createInfoWindow([e]).innerHTML,null,!0),t.popup=u,u.feature=t,u.autoSize=!0,this._itemIDToMarker[e]=t,t):null},g.prototype._parsePolygonOrPolyline=function(e,t){var n,r,i,s;n=[],r=e.split(this._settings.latlngPairSeparator);for(i=0;i<r.length;i++)s=r[i].split(","),n.push(t(parseFloat(s[0]),parseFloat(s[1])));return n},g.prototype._onFeatureSelect=function(t,n){t._map.addPopup(n.popup,!0),e(n.popup.contentDiv).html(n.attributes.dom),t._selectListener!==null&&t._selectListener.fire({itemIDs:n.attributes.locationData.items})},g.prototype._onFeatureUnselect=function(e,t){e._map.removePopup(t.popup)},g.prototype._select=function(e){var t,n,r;t=this,n=e.itemIDs[0],r=this._itemIDToMarker[n],typeof r!="undefined"&&r!==null&&(t._map.addPopup(r.popup,!0),r.popup.show())},g.prototype._createInfoWindow=function(e){return f.fillBubbleWithItems(null,e,e._markerLabelExpression,this.getUIContext())},g.markerToMap=function(e,t){var r,i,s;return r=e.getIcon(),new n.Feature.Vector(new n.Geometry.Point(t.lon,t.lat),null,{fill:!1,stroke:!1,graphic:!0,externalGraphic:r.url,graphicWidth:r.size[0],graphicHeight:r.size[1],graphicXOffset:-r.anchor[0],graphicYOffset:-r.anchor[1]})},g.prototype.updateMarkerIcon=function(e,t){var n;n=this._markerCache[e],typeof n!="undefined"&&n!==null&&(n.style.externalGraphic=t,n.layer.redraw())},g.prototype._makeMarker=function(e,t,n,r,s,o,u){var a,f,l,c;return a=i._makeMarkerKey(t,n,r,s,o),f=this._markerCache[a],typeof f!="undefined"&&f.settings===u?c=g.markerToMap(f,e):(l=i.makeMarker(t,n,r,s,o,u,this),c=g.markerToMap(l,e),this._markerCache[a]=c),c},g}),define("ext/openlayers/openlayers-extension",["require","module","lib/jquery","scripts/util/localizer","scripts/util/debug","exhibit","ext/map/scripts/base","ext/map/scripts/marker","ext/map/scripts/canvas","ext/map/scripts/painter","i18n!ext/map/nls/locale","./scripts/openlayers-view"],function(e,t,n,r,i,s,o,u,a,f,l,c){return o.Painter=u,o.Canvas=f,o.Marker=a,o.OLMapView=c,o.bundledCssFile="styles/openlayers-extension-bundle.css",o.openLayersVersion="2.13.1",o.register=function(e){e.MapExtension=o,e.OLMapView=c},o.setup=function(){var e,u,a,f,c,h;n(document).trigger("loadLocale.exhibit",l),u=null,f=t.config();if(typeof Exhibit_MapExtension_urlPrefix=="string")e=Exhibit_MapExtension_urlPrefix;else if(f!==null&&f.hasOwnProperty("prefix"))e=f.prefix;else{c=["/openlayers-extension.js","/openlayers-extension-bundle.js"];for(a=0;a<c.length;a++){u=s.findScript(document,c[a]);if(u!==null){e=u.substr(0,u.indexOf(c[a]));break}}if(u===null){i.exception(new Error("Failed to derive URL prefix for SIMILE Exhibit OpenLayers Map Extension files"));return}}e.substr(-1)!=="/"&&(e+="/"),o.urlPrefix=e,typeof Exhibit_MapExtension_parameters!="undefined"?o.params=s.parseURLParameters(Exhibit_MapExtension_parameters,o.params,o.paramTypes):f!==null?o.params=f:u!==null&&(o.params=s.parseURLParameters(u,o.params,o.paramTypes)),o.params.bundle?s.includeCssFile(document,o.urlPrefix+o.bundledCssFile):s.includeCssFiles(document,o.urlPrefix,o.cssFiles),typeof o.params.service=="string"&&i.warn(r("%MapExtension.error.serviceDeprecated"))},n(document).ready(o.setup),o}),define("ext/map/nls/de/locale",{"%MapView.label":"Landkarte","%MapView.tooltip":"Zeige diese Elemente auf einer Landkarte"}),define("ext/map/nls/es/locale",{"%MapView.label":"Mapa","%MapView.tooltip":"Visualizar elementos en un mapa"}),define("ext/map/nls/fr/locale",{"%MapView.label":"Carte","%MapView.tooltip":"Voir les items sur une carte"}),define("ext/map/nls/nl/locale",{"%MapView.label":"Kaart","%MapView.tooltip":"Bekijk items met een kaart"}),define("ext/map/nls/root/locale",{"%MapView.label":"Map","%MapView.tooltip":"View items on a map","%MapView.error.remoteImage":"A map icon attempted to load a remote image (%1$s) which could not be completed due to browser security restrictions.  Either the remote host must enable CORS requests or you must host the image on the same host as this page; otherwise you'll end up relying on a Painter service.","%MapView.error.deprecated":"Parameter '%1$s' is deprecated.","%MapView.error.serviceDeprecated":"Parameter 'service' is deprecated, separate services now have their own extensions.  The MapExtension tracks with the latest Google Maps service.","%MapView.error.otherExtension":"To make use of the service you indicated, please use the '%1$s' extension instead of the 'map' extension."}),define("ext/map/nls/sv/locale",{"%MapView.label":"Karta","%MapView.tooltip":"Visa på karta"});