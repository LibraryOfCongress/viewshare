define("ext/map/scripts/base",[],function(){var e={params:{bundle:!1,gmapKey:null,service:null,mapPrefix:"http://api.simile-widgets.org"},paramTypes:{bundle:Boolean,service:String,gmapKey:String,mapPrefix:String},cssFiles:["styles/main.css"],bundledCssFile:"styles/map-extension-bundle.css",urlPrefix:null,markerUrlPrefix:"http://service.simile-widgets.org/painter/painter?",initialized:!1,hasCanvas:!1,_CORSWarned:!1};return e}),define("ext/map/scripts/canvas",["lib/jquery"],function(e){var t={};return t.makeShadow=function(t,n){var r,i,s,o,u;return r=e(t).width(),i=e(t).height(),s=r+i,o=e("<canvas>").css("width",s).css("height",i).attr("width",s).attr("height",i),u=e(o).get(0).getContext("2d"),u.scale(1,.5),u.translate(i/2,i),u.transform(1,0,-0.5,1,0,0),u.fillRect(0,0,r,i),u.globalAlpha=n.shapeAlpha,u.globalCompositeOperation="destination-in",u.drawImage(t,0,0),o},t.makeIcon=function(n,r,i,s,o,u,a){var f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A;f=a.pin,u>0&&(n=u,r=u,f=!1),l=a.pinWidth,c=a.pinHeight,h=1,p=a.borderColor||"black",d=a.shapeAlpha,v=n-h,m=r-h,g=r+(f?c:0),b=e("<canvas>").css("width",n).css("height",g).attr("width",n).attr("height",g),w=e(b).get(0).getContext("2d"),w.clearRect(0,0,n,g),w.beginPath(),a&&a.shape==="circle"?(y=v/2,f?(E=Math.atan2(l/2,m/2),w.arc(n/2,r/2,y,Math.PI/2+E,Math.PI/2-E),w.lineTo(n/2,r+c-h/2)):w.arc(n/2,r/2,y,0,2*Math.PI)):(y=v/4,S=T=h/2,x=r-h/2,N=n-h/2,w.moveTo(N-y,S),w.arcTo(N,S,N,S+y,y),w.lineTo(N,x-y),w.arcTo(N,x,N-y,x,y),f&&(w.lineTo(n/2+l/2,x),w.lineTo(n/2,r+c-h/2),w.lineTo(n/2-l/2,x)),w.lineTo(T+y,x),w.arcTo(T,x,T,x-y,y),w.lineTo(T,S+y),w.arcTo(T,S,T+y,S,y)),w.closePath(),w.fillStyle=i,w.globalAlpha=d,w.fill();if(o!==null){w.save(),w.clip(),w.globalAlpha=1,w.translate(n/2+a.iconOffsetX,r/2+a.iconOffsetY),k=parseFloat(r)/o.naturalHeight,L=parseFloat(n)/o.naturalWidth;switch(a.iconFit){case"width":C=L;break;case"height":C=k;break;case"both":case"larger":C=Math.min(k,L);break;case"smaller":C=Math.max(k,L)}w.scale(C,C),w.scale(a.iconScale,a.iconScale),w.drawImage(o,-o.naturalWidth/2,-o.naturalHeight/2),w.restore()}return w.strokeStyle=p,w.lineWidth=h,w.stroke(),A=t.makeShadow(b.get(0),a),typeof s!="undefined"&&s!==null&&s.length>0&&(w.textBaseline="middle",w.textAlign="center",w.globalAlpha=1,w.font=a.markerFontFamily,w.fillStyle=a.markerFontColor,w.fillText(s,n/2,r/2,n/1.4)),{iconURL:b.get(0).toDataURL(),shadowURL:A.get(0).toDataURL()}},t}),define("ext/map/scripts/painter",["./base"],function(e){var t={};return t.makeIcon=function(t,n,r,i,s,o,u){var a,f,l,c,h;return o>0&&(t=o,n=o,u.pin=!1),a=["renderer=map-marker","shape="+u.shape,"alpha="+u.shapeAlpha,"width="+t,"height="+n,"background="+r.substr(1),"label="+i],f=["renderer=map-marker-shadow","shape="+u.shape,"width="+t,"height="+n],l=[],u.pin&&o<=0?(c=u.pinHeight,h=Math.ceil(u.pinWidth/2),l.push("pinHeight="+c),l.push("pinWidth="+h*2)):l.push("pin=false"),s!==null&&(a.push("icon="+s),u.iconFit!=="smaller"&&a.push("iconFit="+u.iconFit),u.iconScale!==1&&a.push("iconScale="+u.iconScale),u.iconOffsetX!==1&&a.push("iconX="+u.iconOffsetX),u.iconOffsetY!==1&&a.push("iconY="+u.iconOffsetY)),{iconURL:e.markerUrlPrefix+a.concat(l).join("&")+"&.png",shadowURL:e.markerUrlPrefix+f.concat(l).join("&")+"&.png"}},t}),define("ext/map/scripts/marker",["lib/jquery","scripts/exhibit-core","./base","./canvas","./painter"],function(e,t,n,r,i){var s=function(e,t,n,r){this.icon=e,this.shadow=t,this.shape=n,this.settings=r};return s.detectCanvas=function(){var t=e("<canvas>");n.hasCanvas=typeof t.get(0).getContext!="undefined"&&t.get(0).getContext("2d")!==null,t=null},s.makeIcon=function(e,t,s,o,u,a,f){return n.hasCanvas?r.makeIcon(e,t,s,o,u,a,f):i.makeIcon(e,t,s,o,u,a,f)},s._makeMarkerKey=function(e,t,n,r,i){return"#"+[e,t,n,r,i].join("#")},s.makeMarker=function(o,u,a,f,l,c,h){var p,d,v,m,g,y,b,w,E,S,x,T,N,C,k;return p=l.length*3,d=Math.ceil(c.shapeWidth/2)+p,v=c.shapeHeight+2*p,m=d*2,g=v,y=c.pin,a>0&&(m=a,d=Math.ceil(a/2),g=a,v=a),b={anchor:null,size:null,url:null},w={type:"poly",coords:null},E={anchor:null,size:null,url:null},y?(S=c.pinHeight,x=Math.ceil(c.pinWidth/2),g+=S,b.anchor=[d,g],E.anchor=[d,g],w.coords=[0,0,0,v,d-x,v,d,g,d+x,v,m,v,m,0],b.infoWindowAnchor=c.bubbleTip==="bottom"?[d,g]:[d,0]):(b.anchor=[d,Math.ceil(g/2)],E.anchor=[d,Math.ceil(g/2)],w.coords=[0,0,0,v,m,v,m,0],b.infoWindowAnchor=[d,0]),b.size=[m,g],E.size=[m+g/2,g],n.hasCanvas?T=r.makeIcon(m,v,u,l,null,a,c):T=i.makeIcon(m,v,u,l,f,a,c),b.url=T.iconURL,E.url=T.shadowURL,N=new s(b,E,w,c),f!==null&&(C=new Image,e(C).one("load error",function(e){var p,d,g;if(e.type!=="error"){try{p=r.makeIcon(m,v,u,l,C,a,c).iconURL}catch(y){n._CORSWarned||(n._CORSWarned=!0,t.Debug.warn(t._("%MapView.error.remoteImage",f))),p=i.makeIcon(m,v,u,l,f,a,c).iconURL}g=s._makeMarkerKey(o,u,a,f,l),h.updateMarkerIcon(g,p)}}).attr("src",f)),N},s.prototype.hasShadow=function(){return this.shadow!==null},s.prototype.setIcon=function(e){this.icon=e},s.prototype.getIcon=function(){return this.icon},s.prototype.setShadow=function(e){this.shadow=e},s.prototype.getShadow=function(){return this.shadow},s.prototype.setShape=function(e){this.shape=e},s.prototype.getShape=function(){return this.shape},s.prototype.setSettings=function(e){this.settings=e},s.prototype.getSettings=function(){return this.settings},s.prototype.dispose=function(){this.icon=null,this.shadow=null,this.shape=null,this.settings=null},s}),define("ext/map/nls/locale",{root:!0,de:!0,es:!0,fr:!0,nl:!0,sv:!0}),define("scripts/ui/coordinator",["lib/jquery","./ui-context"],function(e,t){var n=function(t,r){this._listeners=[];var i,s,o,u,a,f;a=this,i=r,s=null,o=t,u=!1,this.getID=function(){return s},this.getUIContext=function(){return o},this.getContainer=function(){return e(i)},f=function(){typeof i!="undefined"&&i!==null&&(s=e(i).attr("id"));if(typeof s=="undefined"||s===null)s=a.getUIContext().getCollection().getID()+"-"+a.getUIContext().getMain().getRegistry().generateIdentifier(n.getRegistryKey())},this.register=function(){this.getUIContext().getMain().getRegistry().register(n.getRegistryKey(),this.getID(),this),u=!0},this.unregister=function(){a.getUIContext().getMain().getRegistry().unregister(n.getRegistryKey(),a.getID()),u=!1},this.dispose=function(){typeof this._dispose!="undefined"&&this._dispose(),this.unregister(),this.getUIContext().dispose(),s=null,i=null,o=null,a=null},f()};return n._registryKey="coordinator",n.getRegistryKey=function(){return n._registryKey},n.registerComponent=function(e,t){t.hasRegistry(n.getRegistryKey())||t.createRegistry(n.getRegistryKey())},n.create=function(e,t){var r=new n(t);return r.register(),r},n.createFromDOM=function(e,r){var i=new n(t.createFromDOM(e,r,!1),e);return i.register(),i},n.prototype.addListener=function(e){var t=new n._Listener(this,e);return this._listeners.push(t),t},n.prototype._removeListener=function(e){var t;for(t=0;t<this._listeners.length;t++)if(this._listeners[t]===e){this._listeners.splice(t,1);return}},n.prototype._fire=function(e,t){var n,r;for(n=0;n<this._listeners.length;n++)r=this._listeners[n],r!==e&&r._callback(t)},n._Listener=function(e,t){this._coordinator=e,this._callback=t},n._Listener.prototype.dispose=function(){this._coordinator._removeListener(this)},n._Listener.prototype.fire=function(e){this._coordinator._fire(this,e)},e(document).on("registerComponents.exhibit",n.registerComponent),n}),define("scripts/ui/coders/coder",["lib/jquery"],function(e){var t=function(n,r,i){var s,o,u,a,f,l,c;s=this,l=e(r),f=i,o=n,u=!1,a=null,this._settingSpecs={},this._settings={},this.addSettingSpecs=function(t){e.extend(!0,this._settingSpecs,t)},this.getSettingSpecs=function(){return this._settingSpecs},this.getID=function(){return a},this.getUIContext=function(){return f},this.getContainer=function(){return l},this.register=function(){this.getUIContext().getMain().getRegistry().register(t.getRegistryKey(),this.getID(),this),u=!0},this.unregister=function(){s.getUIContext().getMain().getRegistry().unregister(t.getRegistryKey(),s.getID()),u=!1},this._dispose=function(){this._settingSpecs=null,this._settings=null,e(l).empty(),l=null,this.unregister(),f=null},c=function(){a=e(l).attr("id");if(typeof a=="undefined"||a===null)a=o+"-"+s.getUIContext().getCollection().getID()+"-"+s.getUIContext().getMain().getRegistry().generateIdentifier(t.getRegistryKey())},c()};return t._registryKey="coder",t.getRegistryKey=function(){return t._registryKey},t.registerComponent=function(e,n){n.hasRegistry(t.getRegistryKey())||n.createRegistry(t.getRegistryKey())},e(document).on("registerComponents.exhibit",t.registerComponent),t}),define("ext/map/scripts/map-view",["lib/jquery","exhibit","gmaps","./base","./marker","scripts/util/debug","scripts/util/set","scripts/util/accessors","scripts/util/settings","scripts/util/views","scripts/data/expression-parser","scripts/ui/ui-context","scripts/ui/views/view","scripts/ui/coordinator","scripts/ui/coders/coder","scripts/ui/coders/default-color-coder"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v){var m=function(t,n){m._initialize();var r=this;e.extend(this,new h("map",t,n)),this.addSettingSpecs(m._settingSpecs),this._overlays=[],this._accessors={getProxy:function(e,t,n){n(e)},getColorKey:null,getSizeKey:null,getIconKey:null,getIcon:null},this._colorCoder=null,this._sizeCoder=null,this._iconCoder=null,this._selectListener=null,this._itemIDToMarker={},this._markerLabelExpression=null,this._markerCache={},this._shown=!1,this._onItemsChanged=function(){r._reconstruct()},e(n.getCollection().getElement()).bind("onItemsChanged.exhibit",r._onItemsChanged),this.register()};return m._settingSpecs={latlngOrder:{type:"enum",defaultValue:"latlng",choices:["latlng","lnglat"]},latlngPairSeparator:{type:"text",defaultValue:";"},center:{type:"float",defaultValue:[20,0],dimensions:2},zoom:{type:"float",defaultValue:2},autoposition:{type:"boolean",defaultValue:!1},scrollWheelZoom:{type:"boolean",defaultValue:!0},size:{type:"text",defaultValue:"small"},scaleControl:{type:"boolean",defaultValue:!0},overviewControl:{type:"boolean",defaultValue:!1},type:{type:"enum",defaultValue:"normal",choices:["normal","satellite","hybrid","terrain"]},bubbleTip:{type:"enum",defaultValue:"top",choices:["top","bottom"]},mapHeight:{type:"int",defaultValue:400},mapConstructor:{type:"function",defaultValue:null},markerLabel:{type:"text",defaultValue:".label"},color:{type:"text",defaultValue:"#FF9000"},colorCoder:{type:"text",defaultValue:null},sizeCoder:{type:"text",defaultValue:null},iconCoder:{type:"text",defaultValue:null},selectCoordinator:{type:"text",defaultValue:null},iconSize:{type:"int",defaultValue:0},iconFit:{type:"text",defaultValue:"smaller"},iconScale:{type:"float",defaultValue:1},iconOffsetX:{type:"float",defaultValue:0},iconOffsetY:{type:"float",defaultValue:0},shape:{type:"text",defaultValue:"circle"},shapeWidth:{type:"int",defaultValue:24},shapeHeight:{type:"int",defaultValue:24},shapeAlpha:{type:"float",defaultValue:.7},pin:{type:"boolean",defaultValue:!0},pinHeight:{type:"int",defaultValue:6},pinWidth:{type:"int",defaultValue:6},borderOpacity:{type:"float",defaultValue:.5},borderWidth:{type:"int",defaultValue:1},borderColor:{type:"text",defaultValue:null},opacity:{type:"float",defaultValue:.7},sizeLegendLabel:{type:"text",defaultValue:null},colorLegendLabel:{type:"text",defaultValue:null},iconLegendLabel:{type:"text",defaultValue:null},markerScale:{type:"text",defaultValue:null},markerFontFamily:{type:"text",defaultValue:"12pt sans-serif"},markerFontColor:{type:"text",defaultValue:"black"},showHeader:{type:"boolean",defaultValue:!0},showSummary:{type:"boolean",defaultValue:!0},showFooter:{type:"boolean",defaultValue:!0}},m._accessorSpecs=[{accessorName:"getProxy",attributeName:"proxy"},{accessorName:"getLatlng",alternatives:[{bindings:[{attributeName:"latlng",types:["float","float"],bindingNames:["lat","lng"]},{attributeName:"maxAutoZoom",type:"float",bindingName:"maxAutoZoom",optional:!0}]},{bindings:[{attributeName:"lat",type:"float",bindingName:"lat"},{attributeName:"lng",type:"float",bindingName:"lng"},{attributeName:"maxAutoZoom",type:"float",bindingName:"maxAutoZoom",optional:!0}]}]},{accessorName:"getPolygon",attributeName:"polygon",type:"text"},{accessorName:"getPolyline",attributeName:"polyline",type:"text"},{accessorName:"getColorKey",attributeName:"marker",type:"text"},{accessorName:"getColorKey",attributeName:"colorKey",type:"text"},{accessorName:"getSizeKey",attributeName:"sizeKey",type:"text"},{accessorName:"getIconKey",attributeName:"iconKey",type:"text"},{accessorName:"getIcon",attributeName:"icon",type:"url"}],m._initialize=function(){if(!r.initialized){var t,n;e("head link").each(function(n,i){t=e(i).attr("rel"),t.match(/\b(exhibit-map-painter|exhibit\/map-painter)\b/)&&(r.markerUrlPrefix=e(i).attr("href")+"?")}),i.detectCanvas(),r.initialized=!0}},m.create=function(e,t,n){var r=new m(t,c.create(e,n));return m._configure(r,e),r._internalValidate(),r._initializeUI(),r},m.createFromDOM=function(e,n,r){var i,s;return i=t.getConfigurationFromDOM(e),s=new m(n!==null?n:e,c.createFromDOM(e,r)),u.createAccessorsFromDOM(e,m._accessorSpecs,s._accessors),a.collectSettingsFromDOM(e,s.getSettingSpecs(),s._settings),m._configure(s,i),s._internalValidate(),s._initializeUI(),s},m._configure=function(e,t){var n;u.createAccessors(t,m._accessorSpecs,e._accessors),a.collectSettings(t,e.getSettingSpecs(),e._settings),n=e._accessors,e._getLatlng=n.getLatlng!==null?function(e,t,r){n.getProxy(e,t,function(e){n.getLatlng(e,t,r)})}:null,e._markerLabelExpression=l.parse(e._settings.markerLabel)},m.lookupLatLng=function(e,t,n,r,i,s){var o,u,a,f,c;if(typeof s=="undefined"||s===null)s=4;o=l.parse(t),u=[],e.visit(function(e){var t=o.evaluateSingle({value:e},{value:"item"},"value",i).value;t!==null&&u.push({item:e,address:t})}),a=[],f=new GClientGeocoder,c=function(){var e;u.length>0?(e=u.shift(),f.getLocations(e.address,function(t){var r,i,o,f;typeof t.Placemark!="undefined"&&t.Placemark.sort(function(e,t){return t.AddressDetails.Accuracy-e.AddressDetails.Accuracy}),typeof t.Placemark!="undefined"&&t.Placemark.length>0&&t.Placemark[0].AddressDetails.Accuracy>=s?(r=t.Placemark[0].Point.coordinates,i=r[1],o=r[0],a.push("	{ id: '"+e.item+"', "+n+": '"+i+","+o+"' }")):(f=e.address.split(","),f.length===1?a.push("	{ id: '"+e.item+"' }"):(e.address=f.slice(1).join(",").replace(/^\s+/,""),u.unshift(e))),c()})):r.value=a.join(",\n")},c()},m.prototype.dispose=function(){var t=this;e(this.getUIContext().getCollection().getElement()).unbind("onItemsChanged.exhibit",t._onItemsChanged),this._clearOverlays(),this._map=null,this._selectListener!==null&&(this._selectListener.dispose(),this._selectListener=null),this._itemIDToMarker=null,this._markerCache=null,this._dom.dispose(),this._dom=null,this._dispose()},m.prototype._internalValidate=function(){var e,t,n;e=this.getUIContext().getMain();if(typeof this._accessors.getColorKey!="undefined"&&this._accessors.getColorKey!==null){typeof this._settings.colorCoder!="undefined"&&this._settings.colorCoder!==null&&(this._colorCoder=this.getUIContext().getMain().getRegistry().get(d.getRegistryKey(),this._settings.colorCoder));if(typeof this._colorCoder=="undefined"||this._colorCoder===null)this._colorCoder=new v(this.getUIContext())}typeof this._accessors.getSizeKey!="undefined"&&this._accessors.getSizeKey!==null&&typeof this._settings.sizeCoder!="undefined"&&this._settings.sizeCoder!==null&&(this._sizeCoder=this.getUIContext().getMain().getRegistry().get(d.getRegistryKey(),this._settings.sizeCoder),typeof this._settings.markerScale!="undefined"&&this._settings.markerScale!==null&&(this._sizeCoder._settings.markerScale=this._settings.markerScale)),typeof this._accessors.getIconKey!="undefined"&&this._accessors.getIconKey!==null&&typeof this._settings.iconCoder!="undefined"&&this._settings.iconCoder!==null&&(this._iconCoder=this.getUIContext().getMain().getRegistry().get(d.getRegistryKey(),this._settings.iconCoder)),typeof this._settings.selectCoordinator!="undefined"&&(t=this.getUIContext().getMain().getRegistry().get(p.getRegistryKey(),this._settings.selectCoordinator),t!==null&&(n=this,this._selectListener=t.addListener(function(e){n._select(e)})))},m.prototype._initializeUI=function(){var t,r,i;t=this,r={},r.colorGradient=this._colorCoder!==null&&typeof this._colorCoder._gradientPoints!="undefined",r.colorMarkerGenerator=this._createColorMarkerGenerator(),r.sizeMarkerGenerator=this._createSizeMarkerGenerator(),r.iconMarkerGenerator=this._createIconMarkerGenerator(),e(this.getContainer()).empty(),this._dom=f.constructPlottingViewDom(this.getContainer(),this.getUIContext(),this._settings.showSummary&&this._settings.showHeader,{onResize:function(){n.maps.event.trigger(t._map,"resize")}},r),i=this._dom.plotContainer,e(i).attr("class","exhibit-mapView-map").css("height",this._settings.mapHeight),this._map=this._constructGMap(i),this._reconstruct()},m.prototype._constructGMap=function(e){var t,r,i;t=this._settings;if(typeof t.mapConstructor!="undefined"&&t.mapConstructor!==null)return t.mapConstructor(e);r={center:new n.maps.LatLng(t.center[0],t.center[1]),zoom:t.zoom,panControl:!0,zoomControl:{style:n.maps.ZoomControlStyle.DEFAULT},mapTypeId:n.maps.MapTypeId.ROADMAP},t.size==="small"?r.zoomControl.style=n.maps.ZoomControlStyle.SMALL:t.size==="large"&&(r.zoomControl.style=n.maps.ZoomControlStyle.LARGE),typeof t.overviewControl!="undefined"&&(r.overviewControl=t.overviewControl),typeof t.scaleControl!="undefined"&&(r.scaleControl=t.scaleControl),typeof t.scrollWheelZoom!="undefined"&&!t.scrollWheelZoom&&(r.scrollWheel=!1);switch(t.type){case"satellite":r.mapTypeId=n.maps.MapTypeId.SATELLITE;break;case"hybrid":r.mapTypeId=n.maps.MapTypeId.HYBRID;break;case"terrain":r.mapTypeId=n.maps.MapTypeId.TERRAIN}return i=new n.maps.Map(e,r),i},m.prototype._createColorMarkerGenerator=function(){var t=this._settings;return function(n){return e.simileBubble("createTranslucentImage",i.makeIcon(t.shapeWidth,t.shapeHeight,n,null,null,t.iconSize,t).iconURL,"middle")}},m.prototype._createSizeMarkerGenerator=function(){var t=e.extend({},this._settings);return t.pinHeight=0,function(n){return e.simileBubble("createTranslucentImage",i.makeIcon(t.shapeWidth,t.shapeHeight,t.color,null,null,n,t).iconURL,"middle")}},m.prototype._createIconMarkerGenerator=function(){return function(t){var n=e("img").attr("src",t).css("vertical-align","middle").css("height",40);return e(n).get(0)}},m.prototype._clearOverlays=function(){var e;typeof this._infoWindow!="undefined"&&this._infoWindow!==null&&this._infoWindow.setMap(null);for(e=0;e<this._overlays.length;e++)this._overlays[e].setMap(null);this._overlays=[]},m.prototype._reconstruct=function(){var e,t;this._clearOverlays(),typeof this._dom.legendWidget!="undefined"&&this._dom.legendWidget!==null&&this._dom.legendWidget.clear(),typeof this._dom.legendGradientWidget!="undefined"&&this._dom.legendWidgetGradient!==null&&this._dom.legendGradientWidget.reconstruct(),this._itemIDToMarker={},e=this.getUIContext().getCollection().countRestrictedItems(),t=[],e>0&&this._rePlotItems(t),this._dom.setUnplottableMessage(e,t)},m.prototype._rePlotItems=function(e){var t,r,i,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A,O,M,_,D,P,H,B,j,F,I;t=this,r=this.getUIContext().getCollection(),i=this.getUIContext().getDatabase(),u=this._settings,a=this._accessors,f=r.getRestrictedItems(),l={},c=a.getColorKey!==null,h=a.getSizeKey!==null,p=a.getIconKey!==null,d=a.getIcon!==null,v=this._getLatlng!==null,m=a.getPolygon!==null,g=a.getPolyline!==null,y=u.latlngOrder==="latlng"?function(e,t){return new n.maps.LatLng(e,t)}:function(e,t){return new n.maps.LatLng(t,e)},E={mixed:!1,missing:!1,others:!1,keys:new o},S={mixed:!1,missing:!1,others:!1,keys:new o},x={mixed:!1,missing:!1,others:!1,keys:new o},b=Infinity,w=Infinity,f.visit(function(n){var r,s,u,f,d,b,w,S,x,T,N,C;r=[],s=[],u=[],v&&t._getLatlng(n,i,function(e){e!==null&&typeof e.lat!="undefined"&&e.lat!==null&&typeof e.lng!="undefined"&&e.lng!==null&&r.push(e)}),m&&a.getPolygon(n,i,function(e){e!==null&&s.push(e)}),g&&a.getPolyline(n,i,function(e){e!==null&&u.push(e)});if(r.length>0||s.length>0||u.length>0){f=t._settings.color,d=null,c&&(d=new o,a.getColorKey(n,i,function(e){d.add(e)}),f=t._colorCoder.translateSet(d,E));if(r.length>0){b=null,h&&(b=new o,a.getSizeKey(n,i,function(e){b.add(e)})),w=null,p&&(w=new o,a.getIconKey(n,i,function(e){w.add(e)}));for(S=0;S<r.length;S++)x=r[S],T=x.lat+","+x.lng,typeof l[T]!="undefined"?(N=l[T],N.items.push(n),c&&N.colorKeys.addSet(d),h&&N.sizeKeys.addSet(b),p&&N.iconKeys.addSet(w)):(N={latlng:x,items:[n]},c&&(N.colorKeys=d),h&&(N.sizeKeys=b),p&&(N.iconKeys=w),l[T]=N)}for(S=0;S<s.length;S++)t._plotPolygon(n,s[S],f,y);for(S=0;S<u.length;S++)t._plotPolyline(n,u[S],f,y)}else e.push(n)}),T=function(e){var r,s,o,u,f,l,v,m;r=e.items.length;if(typeof b=="undefined"||b===null||!isFinite(b))b=new n.maps.LatLngBounds;s=t._settings.shape,o=t._settings.color,c&&(o=t._colorCoder.translateSet(e.colorKeys,E)),u=t._settings.iconSize,h&&(u=t._sizeCoder.translateSet(e.sizeKeys,S)),f=null,r===1&&d&&a.getIcon(e.items[0],i,function(e){f=e}),p&&(f=t._iconCoder.translateSet(e.iconKeys,x)),l=new n.maps.LatLng(e.latlng.lat,e.latlng.lng),typeof e.latlng.maxAutoZoom!="undefined"&&w>e.latlng.maxAutoZoom&&(w=e.latlng.maxAutoZoom),b.extend(l),v=t._makeMarker(l,s,o,u,f,r===1?"":r.toString(),t._settings),n.maps.event.addListener(v,"click",function(){t._showInfoWindow(e.items,null,v),t._selectListener!==null&&t._selectListener.fire({itemIDs:e.items})}),v.setMap(t._map),t._overlays.push(v);for(m=0;m<e.items.length;m++)t._itemIDToMarker[e.items[m]]=v};try{for(N in l)l.hasOwnProperty(N)&&T(l[N])}catch(q){s.exception(q)}if(c){C=this._dom.legendWidget,k=this._colorCoder,L=E.keys.toArray().sort();if(typeof k._gradientPoints!="undefined"&&k._gradientPoints!==null)A=this._dom.legendGradientWidget,A.addGradient(this._colorCoder._gradientPoints),typeof u.colorLegendLabel!="undefined"&&u.colorLegendLabel!==null&&A.addLegendLabel(u.colorLegendLabel);else{for(O=0;O<L.length;O++)M=L[O],_=k.translate(M),C.addEntry(_,M);typeof u.colorLegendLabel!="undefined"&&u.colorLegendLabel!==null&&C.addLegendLabel(u.colorLegendLabel,"color")}E.others&&C.addEntry(k.getOthersColor(),k.getOthersLabel()),E.mixed&&C&&C.addEntry(k.getMixedColor(),k.getMixedLabel()),E.missing&&C.addEntry(k.getMissingColor(),k.getMissingLabel())}if(h){C=this._dom.legendWidget,D=this._sizeCoder,L=S.keys.toArray().sort(),typeof u.sizeLegendLabel!="undefined"&&u.sizeLegendLabel!==null&&C.addLegendLabel(u.sizeLegendLabel,"size");if(typeof D._gradientPoints!="undefined"&&D._gradientPoints!==null){P=D._gradientPoints,H=(P[P.length-1].value-P[0].value)/5,L=[];for(B=0;B<6;B++)L.push(Math.floor(P[0].value+H*B));for(O=0;O<L.length;O++)M=L[O],j=D.translate(M),C.addEntry(j,M,"size")}else{for(O=0;O<L.length;O++)M=L[O],j=D.translate(M),C.addEntry(j,M,"size");S.others&&C.addEntry(D.getOthersSize(),D.getOthersLabel(),"size"),S.mixed&&C.addEntry(D.getMixedSize(),D.getMixedLabel(),"size"),S.missing&&C.addEntry(D.getMissingSize(),D.getMissingLabel(),"size")}}if(p){C=this._dom.legendWidget,F=this._iconCoder,L=x.keys.toArray().sort(),typeof u.iconLegendLabel!="undefined"&&u.iconLegendLabel!==null&&C.addLegendLabel(u.iconLegendLabel,"icon");for(O=0;O<L.length;O++)M=L[O],I=F.translate(M),C.addEntry(I,M,"icon");x.others&&C.addEntry(F.getOthersIcon(),F.getOthersLabel(),"icon"),x.mixed&&C.addEntry(F.getMixedIcon(),F.getMixedLabel(),"icon"),x.missing&&C.addEntry(F.getMissingIcon(),F.getMissingLabel(),"icon")}typeof b!="undefined"&&b!==null&&u.autoposition&&!this._shown&&(t._map.fitBounds(b),t._map.getZoom>w&&t._map_setZoom(w)),this._shown=!0},m.prototype._plotPolygon=function(e,t,r,i){var s,o,u,a;return s=this._parsePolygonOrPolyline(t,i),s.length>1?(o=this._settings,u=typeof o.borderColor!="undefined"&&o.borderColor!==null?o.borderColor:r,a=new n.maps.Polygon({paths:s,strokeColor:u,strokeWeight:o.borderWidth,strokeOpacity:o.borderOpacity,fillColor:r,fillOpacity:o.opacity}),this._addPolygonOrPolyline(e,a)):null},m.prototype._plotPolyline=function(e,t,r,i){var s,o,u,a;return s=this._parsePolygonOrPolyline(t,i),s.length>1?(o=this._settings,u=typeof o.borderColor!="undefined"&&o.borderColor!==null?o.borderColor:r,a=new n.maps.Polyline({path:s,strokeColor:u,strokeWeight:o.borderWidth,strokeOpacity:o.borderOpacity}),this._addPolygonOrPolyline(e,a)):null},m.prototype._addPolygonOrPolyline=function(e,t){var r,i;return t.setMap(this._map),this._overlays.push(t),r=this,i=function(t){r._showInfoWindow([e],t.latLng),r._selectListener!==null&&r._selectListener.fire({itemIDs:[e]})},n.maps.event.addListener(t,"click",i),this._itemIDToMarker[e]=t,t},m.prototype._parsePolygonOrPolyline=function(e,t){var n,r,i,s;n=[],r=e.split(this._settings.latlngPairSeparator);for(i=0;i<r.length;i++)s=r[i].split(","),n.push(t(parseFloat(s[0]),parseFloat(s[1])));return n},m.prototype._select=function(e){var t,n;t=e.itemIDs[0],n=this._itemIDToMarker[t],typeof n!="undefined"&&n!==null&&this._showInfoWindow([t],null,n)},m.prototype._showInfoWindow=function(e,t,r){var i,s,o,u;typeof this._infoWindow!="undefined"&&this._infoWindow!==null&&this._infoWindow.setMap(null),i=this._createInfoWindow(e),o=r.getIcon().size,u=new n.maps.Size(0,this._settings.bubbleTip==="bottom"?o.height:0),s=new n.maps.InfoWindow({content:i,pixelOffset:u}),typeof t!="undefined"&&t!==null&&s.setPosition(t),s.open(this._map,r),this._infoWindow=s},m.prototype._createInfoWindow=function(e){return f.fillBubbleWithItems(null,e,this._markerLabelExpression,this.getUIContext())},m.markerToMap=function(e,t){var r,i;return r=e.getIcon(),i=e.getShadow(),new n.maps.Marker({icon:new n.maps.MarkerImage(r.url,new n.maps.Size(r.size[0],r.size[1]),null,new n.maps.Point(r.anchor[0],r.anchor[1]),null),shadow:new n.maps.MarkerImage(i.url,new n.maps.Size(i.size[0],i.size[1]),null,new n.maps.Point(i.anchor[0],i.anchor[1]),null),shape:e.getShape(),position:t})},m.prototype.updateMarkerIcon=function(e,t){var n;n=this._markerCache[e],typeof n!="undefined"&&n!==null&&n.setIcon(t)},m.prototype._makeMarker=function(e,t,n,r,s,o,u){var a,f,l,c;return a=i._makeMarkerKey(t,n,r,s,o),f=this._markerCache[a],typeof f!="undefined"&&f.settings===u?c=m.markerToMap(f,e):(l=i.makeMarker(t,n,r,s,o,u,this),c=m.markerToMap(l,e),this._markerCache[a]=c),c},m}),define("ext/map/map-extension",["require","module","lib/jquery","scripts/util/localizer","scripts/util/debug","exhibit","./scripts/base","./scripts/marker","./scripts/canvas","./scripts/painter","i18n!ext/map/nls/locale","./scripts/map-view"],function(e,t,n,r,i,s,o,u,a,f,l,c){return o.Painter=u,o.Canvas=f,o.Marker=a,o.register=function(e){e.MapExtension=o,e.MapView=c},o.setup=function(){var e,u,a,f,c,h;n(document).trigger("loadLocale.exhibit",l),u=null,f=t.config();if(typeof Exhibit_MapExtension_urlPrefix=="string")e=Exhibit_MapExtension_urlPrefix;else if(f!==null&&f.hasOwnProperty("prefix"))e=f.prefix;else{c=["/map-extension.js","/map-extension-bundle.js"];for(a=0;a<c.length;a++){u=s.findScript(document,c[a]);if(u!==null){e=u.substr(0,u.indexOf(c[a]));break}}if(u===null){i.exception(new Error("Failed to derive URL prefix for SIMILE Exhibit Map Extension files"));return}}e.substr(-1)!=="/"&&(e+="/"),o.urlPrefix=e,typeof Exhibit_MapExtension_parameters!="undefined"?o.params=s.parseURLParameters(Exhibit_MapExtension_parameters,o.params,o.paramTypes):f!==null?o.params=f:u!==null&&(o.params=s.parseURLParameters(u,o.params,o.paramTypes)),o.params.bundle?s.includeCssFile(document,o.urlPrefix+o.bundledCssFile):s.includeCssFiles(document,o.urlPrefix,o.cssFiles),s.params.gmapKey!==null?h="&key="+s.params.gmapKey:h="",typeof o.params.service=="string"&&(i.warn(r("%MapExtension.error.serviceDeprecated")),o.params.service==="google2"?i.warn(r("%MapExtension.error.otherExtension","gmap2")):o.params.service==="openlayers"&&i.warn(r("%MapExtension.error.otherExtension","openlayers")))},n(document).ready(o.setup),o}),define("ext/map/nls/de/locale",{"%MapView.label":"Landkarte","%MapView.tooltip":"Zeige diese Elemente auf einer Landkarte"}),define("ext/map/nls/es/locale",{"%MapView.label":"Mapa","%MapView.tooltip":"Visualizar elementos en un mapa"}),define("ext/map/nls/fr/locale",{"%MapView.label":"Carte","%MapView.tooltip":"Voir les items sur une carte"}),define("ext/map/nls/nl/locale",{"%MapView.label":"Kaart","%MapView.tooltip":"Bekijk items met een kaart"}),define("ext/map/nls/root/locale",{"%MapView.label":"Map","%MapView.tooltip":"View items on a map","%MapView.error.remoteImage":"A map icon attempted to load a remote image (%1$s) which could not be completed due to browser security restrictions.  Either the remote host must enable CORS requests or you must host the image on the same host as this page; otherwise you'll end up relying on a Painter service.","%MapView.error.deprecated":"Parameter '%1$s' is deprecated.","%MapView.error.serviceDeprecated":"Parameter 'service' is deprecated, separate services now have their own extensions.  The MapExtension tracks with the latest Google Maps service.","%MapView.error.otherExtension":"To make use of the service you indicated, please use the '%1$s' extension instead of the 'map' extension."}),define("ext/map/nls/sv/locale",{"%MapView.label":"Karta","%MapView.tooltip":"Visa på karta"});