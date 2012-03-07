/**
 * Copyright (c) 2009-2011 The Open Planning Project
 */

Ext.USE_NATIVE_JSON = true;

(function() {
    // backwards compatibility for reading saved maps
    // these source plugins were renamed after 2.3.2
    Ext.preg("gx_wmssource", gxp.plugins.WMSSource);
    Ext.preg("gx_olsource", gxp.plugins.OLSource);
    Ext.preg("gx_googlesource", gxp.plugins.GoogleSource);
    Ext.preg("gx_bingsource", gxp.plugins.BingSource);
    Ext.preg("gx_osmsource", gxp.plugins.OSMSource);
})();

/**
 * api: (define)
 * module = GeoExplorer
 * extends = gxp.Viewer
 */

/** api: constructor
 *  .. class:: GeoExplorer(config)
 *     Create a new GeoExplorer application.
 *
 *     Parameters:
 *     config - {Object} Optional application configuration properties.
 *
 *     Valid config properties:
 *     map - {Object} Map configuration object.
 *     sources - {Object} An object with properties whose values are WMS endpoint URLs
 *
 *     Valid map config properties:
 *         projection - {String} EPSG:xxxx
 *         units - {String} map units according to the projection
 *         maxResolution - {Number}
 *         layers - {Array} A list of layer configuration objects.
 *         center - {Array} A two item array with center coordinates.
 *         zoom - {Number} An initial zoom level.
 *
 *     Valid layer config properties (WMS):
 *     name - {String} Required WMS layer name.
 *     title - {String} Optional title to display for layer.
 */
var GeoExplorer = Ext.extend(gxp.Viewer, {

    // Begin i18n.
    zoomSliderText: "<div>Zoom Level: {zoom}</div><div>Scale: 1:{scale}</div>",
    loadConfigErrorText: "Trouble reading saved configuration: <br />",
    loadConfigErrorDefaultText: "Server Error.",
    xhrTroubleText: "Communication Trouble: Status ",
    layersText: "Layers",
    titleText: "Title",
    saveErrorText: "Trouble saving: ",
    bookmarkText: "Bookmark URL",
    permakinkText: 'Permalink',
    appInfoText: "GeoExplorer",
    aboutText: "About GeoExplorer",
    mapInfoText: "Map Info",
    descriptionText: "Description",
    contactText: "Contact",
    aboutThisMapText: "About this Map",
    // End i18n.
    
    /**
     * private: property[mapPanel]
     * the :class:`GeoExt.MapPanel` instance for the main viewport
     */
    mapPanel: null,
    
    toggleGroup: "toolGroup",

    constructor: function(config) {
        this.mapItems = [
            {
                xtype: "gxp_scaleoverlay"
            }, {
                xtype: "gx_zoomslider",
                vertical: true,
                height: 100,
                plugins: new GeoExt.ZoomSliderTip({
                    template: this.zoomSliderText
                })
            }
        ];

        // both the Composer and the Viewer need to know about the viewerTools
        // First row in each object is needed to correctly render a tool in the treeview
        // of the embed map dialog. TODO: make this more flexible so this is not needed.
        config.viewerTools = [
            {
                leaf: true,
                text: gxp.plugins.Print.prototype.tooltip,
                ptype: "gxp_print",
                iconCls: "gxp-icon-print",
                customParams: {outputFilename: 'map-print'},
                printService: config.printService,
                checked: true
            }, {
                leaf: true, 
                text: gxp.plugins.Navigation.prototype.tooltip, 
                checked: true, 
                iconCls: "gxp-icon-pan",
                ptype: "gxp_navigation", 
                toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 2}
            }, {
                leaf: true, 
                text: gxp.plugins.WMSGetFeatureInfo.prototype.infoActionTip, 
                checked: true, 
                iconCls: "gxp-icon-getfeatureinfo",
                ptype: "gxp_wmsgetfeatureinfo", 
                toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 3}
            }, {
                leaf: true, 
                text: gxp.plugins.Measure.prototype.measureTooltip, 
                checked: true, 
                iconCls: "gxp-icon-measure-length",
                ptype: "gxp_measure", 
                toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 4}
            }, {
                leaf: true, 
                text: gxp.plugins.Zoom.prototype.zoomInTooltip + " / " + gxp.plugins.Zoom.prototype.zoomOutTooltip, 
                checked: true, 
                iconCls: "gxp-icon-zoom-in",
                ptype: "gxp_zoom",
                actionTarget: {target: "paneltbar", index: 5}
            }, {
                leaf: true, 
                text: gxp.plugins.NavigationHistory.prototype.previousTooltip + " / " + gxp.plugins.NavigationHistory.prototype.nextTooltip, 
                checked: true, 
                iconCls: "gxp-icon-zoom-previous",
                ptype: "gxp_navigationhistory",
                actionTarget: {target: "paneltbar", index: 7}
            }, {
                leaf: true, 
                text: gxp.plugins.ZoomToExtent.prototype.tooltip, 
                checked: true, 
                iconCls: gxp.plugins.ZoomToExtent.prototype.iconCls,
                ptype: "gxp_zoomtoextent",
                actionTarget: {target: "paneltbar", index: 9}
            }, {
                leaf: true, 
                text: gxp.plugins.Legend.prototype.tooltip, 
                checked: true, 
                iconCls: "gxp-icon-legend",
                ptype: "gxp_legend",
                actionTarget: {target: "paneltbar", index: 10}
            }, {
                leaf: true,
                text: gxp.plugins.GoogleEarth.prototype.tooltip,
                checked: true,
                iconCls: "gxp-icon-googleearth",
                ptype: "gxp_googleearth",
                actionTarget: {target: "paneltbar", index: 11}
        }];

        GeoExplorer.superclass.constructor.apply(this, arguments);
    }, 

    loadConfig: function(config) {
        
        var mapUrl = window.location.hash.substr(1);
        var match = mapUrl.match(/^maps\/(\d+)$/);
        if (match) {
            this.id = Number(match[1]);
            OpenLayers.Request.GET({
                url: mapUrl,
                success: function(request) {
                    var addConfig = Ext.util.JSON.decode(request.responseText);
                    this.applyConfig(Ext.applyIf(addConfig, config));
                },
                failure: function(request) {
                    var obj;
                    try {
                        obj = Ext.util.JSON.decode(request.responseText);
                    } catch (err) {
                        // pass
                    }
                    var msg = this.loadConfigErrorText;
                    if (obj && obj.error) {
                        msg += obj.error;
                    } else {
                        msg += this.loadConfigErrorDefaultText;
                    }
                    this.on({
                        ready: function() {
                            this.displayXHRTrouble(msg, request.status);
                        },
                        scope: this
                    });
                    delete this.id;
                    window.location.hash = "";
                    this.applyConfig(config);
                    //this.tools.gxp_wmsgetfeatureinfo_ctl.displayPopup = function(evt, title, toShow, isGrid) {
                    },
                scope: this
                });
        } else {
            var query = Ext.urlDecode(document.location.search.substr(1));
            if (query && query.q) {
                var queryConfig = Ext.util.JSON.decode(query.q);
                Ext.apply(config, queryConfig);
            }
            this.applyConfig(config);
        }
        
    },
    
    /** api: method[destroy]
     */
    destroy: function() {
        //TODO there is probably more that needs to be destroyed
        this.mapPanel.destroy();
        //this.portal && 
        this.portal.destroy();
        //this.mapPanelContainer.destroy();
        
        this.toolbar.destroy();
        this.toolbar = null;
        
        //for(tool in this.tools){
            //this.tools[tool].destroy();
        //    delete this.tools[tool];
        //}
        
        //this.portalItems = null;
    },
    
    displayXHRTrouble: function(msg, status) {
        
        Ext.Msg.show({
            title: this.xhrTroubleText + status,
            msg: msg,
            icon: Ext.MessageBox.WARNING
        });
        
    },
    
    initTools: function() {
        this.tools = {};
        if (this.initialConfig.tools && this.initialConfig.tools.length > 0) {
            var tool;
            for (var i=0, len=this.initialConfig.tools.length; i<len; i++) {
                //try {
                    
                    if(this.initialConfig.tools[i]){
                    
                    tool = Ext.ComponentMgr.createPlugin(
                        this.initialConfig.tools[i], this.defaultToolType
                    );
                        
                if(tool.ptype === "gxp_wmsgetfeatureinfo") {
                //
                //TODO Localize to pluin!!!!!!!!!!!!
                //
					//~~~~~~~~~~~~~~~~~~~~~~~~~~~~
					if (wmsTool == null)
						wmsTool = tool;
					//~~~~~~~~~~~~~~~~~~~~~~~~~~~~
					tool.displayPopup = function(evt, title, toShow, isGrid)
					{						
                                                this.addMarker(evt.xy)
						var popup;
						var popupKey = evt.xy.x + "." + evt.xy.y;
						if (!(popupKey in this.popupCache)) {
							popup = this.addOutput({
								xtype: "gx_popup",
								title: this.popupTitle,
								layout: "accordion",
								location: evt.xy,
								map: this.target.mapPanel,
								width: 350,
								height: 300,
								listeners: {
									close: (function(key) {
										return function(panel){
											delete this.popupCache[key];
										};
									})(popupKey),
									scope: this
								}
							});
							this.popupCache[popupKey] = popup;
							
						} else {
							popup = this.popupCache[popupKey];
						}
						// extract just the body content
						if(isGrid){
							popup.add({
//								title: title + " (xy:" + evt.xy.x + "," + evt.xy.y + ")",
								title: title,
								layout: "fit",
								autoScroll: true,
								autoWidth: true,
								collapsible: true,
								items: [toShow]
							});
						} else {
							popup.add({
								title: title,
								layout: "fit",
								html: toShow,
								autoScroll: true,
								autoWidth: true,
								collapsible: true
							});
						}
						popup.doLayout();
					};

				tool.addActions = function() {
					this.popupCache = {};
        
					var actions = gxp.plugins.WMSGetFeatureInfo.superclass.addActions.call(this, [{
						tooltip: this.infoActionTip,
						iconCls: "gxp-icon-getfeatureinfo",
						toggleGroup: this.toggleGroup,
						enableToggle: true,
						allowDepress: true,
					        scope: this,
						toggleHandler: function(button, pressed) {
                                                        if (pressed) { this.vectorLayerOn() } else { this.vectorLayerOff() }
							for (var i = 0, len = info.controls.length; i < len; i++){
								if (pressed) {
									info.controls[i].activate();
								} else {
									info.controls[i].deactivate();
								}
							}
						}
					}]);
					var infoButton = this.actions[0].items[0];

					var info = {controls: []};
					var updateInfo = function() {
						var queryableLayers = this.target.mapPanel.layers.queryBy(function(x){
							return x.get("queryable");
						});
			
						var map = this.target.mapPanel.map;
						var control;
						for (var i = 0, len = info.controls.length; i < len; i++){
							control = info.controls[i];
							control.deactivate();  // TODO: remove when http://trac.openlayers.org/ticket/2130 is closed
							control.destroy();
						}

						info.controls = [];
						queryableLayers.each(function(x){
							var layer = x.getLayer();
				

							var vendorParams = Ext.apply({}, this.vendorParams), param;
							if (this.layerParams) {
								for (var i=this.layerParams.length-1; i>=0; --i) {
									param = this.layerParams[i].toUpperCase();
									vendorParams[param] = layer.params[param];
								}
							}
							var control = new OpenLayers.Control.WMSGetFeatureInfo({
								url: layer.url,
								queryVisible: true,
								layers: [layer],
								infoFormat: "text/plain",
								vendorParams: vendorParams,
								eventListeners: {
									getfeatureinfo: function(evt) {
										var match = evt.text.match(/<body[^>]*>([\s\S]*)<\/body>/);
										if (match && !match[1].match(/^\s*$/)) {
											this.displayPopup(
												evt, (x.get("title") || x.get("name")), match[1], false
											);
										} else {
											if(evt.text.match(/no.*features.*found/)){
												return;
										}
                                
										var lines = evt.text.split("\n");
										var ret = "";
										var arr = [];
										var j = 0;
										var group = 0;
										var wasGroup = false;
										var superGroup = "";
										var needPlusick = false;
                                
										for(i=0;i<lines.length;i++){
											var keyVal = lines[i].match(/([^=]+)=(.*)/);
											if(keyVal){
												keyVal[1] = keyVal[1].replace(/^\s+/g, "").replace(/\s+$/g, "");
												keyVal[2] = keyVal[2].replace(/^\s+/g, "").replace(/\s+$/g, "");
												arr[j] = [keyVal[1], keyVal[2], superGroup, group];
												maxGroup = group;
												j++;
												ret = ret + "key: " + lines[i][0] + ", val: " + lines[i][1] + "\n";
												wasGroup = false;
												if(group>1){
													needPlusick = true;
												}
											} else {
												if(!wasGroup){
													wasGroup = true;
													group++;
												}
												var supGrTry = lines[i].match(/FeatureType\s+[\"\']?([^\"\']+)[\"\']?/);
												if(supGrTry){
													if(superGroup != supGrTry[1]){
														group=1;
														if(superGroup!="")
															needPlusick = true;
													}
													superGroup = supGrTry[1] ;
												}
											}
										}
                                
                                // translate arr
                                var layerNames = [];
                                var fieldNames = [];
                                for(var i=0;i<arr.length;i++){
                                    arr[i][2] = arr[i][2].toUpperCase();
                                    arr[i][0] = arr[i][0].toUpperCase();
                                    layerNames[i] = arr[i][2];
                                    fieldNames[i] = arr[i][0];
                                }
                                var translatedLayerNames = translateSymbols("layer", layerNames);
                                var metadataFieldNames = getMetaData("field", fieldNames);
                                // transform two last columns to one for grouping
                                
                                for(i=0;i<arr.length;i++){
                                    arr[i] = [
                                        metadataFieldNames[arr[i][0]]["Заголовок элемента"]?
                                            metadataFieldNames[arr[i][0]]["Заголовок элемента"]:
                                            arr[i][0], 
                                        (arr[i][1]!="null"?arr[i][1]:""), 
                                        arr[i][0],
                                        translatedLayerNames[arr[i][2]],
                                        arr[i][3],
                                        translatedLayerNames[arr[i][2]] + " grouping " + arr[i][3],
                                        metadataFieldNames[arr[i][0]]
                                    ];
                                };
                                
                                // ext grid
                                var myReader = new Ext.data.ArrayReader({}, [
                                    {name: 'FieldTranslated'},
                                    {name: 'Value'},
                                    {name: 'Field'},
                                    {name: 'LayerTranslated'},
                                    {name: 'NumOfLayerEntry'},
                                    {name: 'GroupingField'},
                                    {name: 'MetaData'}
                                ]);       
                                
                                var metaDataTemplate = "";
                                if(arr[0] && (!(typeof metadataFieldNames[arr[0][2]] == "string"))){
                                    //alert(typeof metadataFieldNames[arr[0][2]]);
                                    for(var metaFlds in metadataFieldNames[arr[0][2]]){
                                        metaDataTemplate = metaDataTemplate +
                                            "<b>"+metaFlds+"</b>" + ": {[values.MetaData['"+metaFlds+"']]}<br/>";
                                    }
                                }
                                
                                var expander;
                                if(metaDataTemplate==""){
                                //if(false){
                                    expander = null;
                                }else{
                                    expander = new Ext.grid.RowExpander({
                                        //tpl: new Ext.XTemplate("Layer: {[values.MetaData['Дата создания']]}")
                                        tpl: new Ext.XTemplate(metaDataTemplate)
                                        //,disabled: (metaDataTemplate=="")
                                    });
                                }
                                
                                var sss = needPlusick?
                                    new Ext.data.GroupingStore({
                                        data: arr,
                                        reader: myReader,
                                        groupField: 'GroupingField'
                                    }):
                                    new Ext.data.GroupingStore({
                                        data: arr,
                                        reader: myReader
                                    });
                                    
                                sss.filterBy(function(record){return record.get("Field")!="THE_GEOM";});
                                        
                                var vvv = new Ext.grid.GroupingView({
                                        forceFit:true,
                                        groupTextTpl: "{[values.rs[values.rs.length-1].data.LayerTranslated]}"+
                                            " {[values.rs[values.rs.length-1].data.NumOfLayerEntry]}"
                                    });
                                    
                                var ccc = [
                                    {
                                        header: 'Поле', 
                                        sortable: true, 
                                        dataIndex: 'FieldTranslated',
                                        groupable: false
                                    },
                                    {
                                        header: 'Значение', 
                                        sortable: true,
                                        dataIndex: 'Value',
                                        groupable: false
                                    },
                                    {
                                        header: 'Код поля', 
                                        sortable: true, 
                                        dataIndex: 'Field',
                                        groupable: false,
                                        hidden: true
                                    },
                                    {
                                        header: 'Слой', 
                                        sortable: true,
                                        dataIndex: 'LayerTranslated',
                                        groupable: false,
                                        hidden: true,
                                        hideable: false
                                    },
                                    {
                                        header: 'Номер в слое', 
                                        sortable: true,
                                        dataIndex: 'NumOfLayerEntry',
                                        groupable: false,
                                        hidden: true,
                                        hideable: false
                                    },
                                    {
                                        header: 'Группа', 
                                        sortable: true,
                                        dataIndex: 'GroupingField',
                                        groupable: false,
                                        hidden: true,
                                        hideable: false
                                    },
                                    {
                                        header: 'Метаданные', 
                                        sortable: true,
                                        dataIndex: 'MetaData',
                                        groupable: false,
                                        hidden: true,
                                        hideable: false
                                    }
                                    ];
                                var ppp;
                                if(expander){
                                    ccc.unshift(expander);
                                    ppp = [expander];
                                }else{
                                    ppp = [];
                                }
                                
                                var grid = new Ext.grid.GridPanel({
                                    plugins: ppp,                                    
                                    store: sss,
                                    view: vvv,
                                    columns: ccc
                                });           
                                
                                this.displayPopup(
                                    evt, x.get("title") || x.get("name"), grid, true
                                );
                            }
                        },
                        scope: this
                    }
                });

				if (control)
				{
					map.addControl(control);
					info.controls.push(control);
					if(infoButton.pressed) {
						control.activate();
					}
				}
            }, this);
        };
       
        this.target.mapPanel.layers.on("update", updateInfo, this);
        this.target.mapPanel.layers.on("add"   , updateInfo, this);
        this.target.mapPanel.layers.on("remove", updateInfo, this);
        
        return actions;
    }
                }
                        
                }
                //} catch (err) {
                    //throw new Error("Could not create tool plugin with ptype: " + this.initialConfig.tools[i].ptype);
                //}
                tool.init(this);
            }
        }
    },
    
    /** private: method[initPortal]
     * Create the various parts that compose the layout.
     */
    initPortal: function() {
        var westPanel = new Ext.TabPanel({//Panel({
            border: false,
            //layout: "border",
            activeTab: 0,
            region: "west",
            width: 350,
			minWidth: 20,
            split: true,
            collapsible: true,
			collapsed: true,
            header: true,
			title: 'Таблица содержания',
            items: [
                {/*region: 'center', */autoScroll: true, tbar: [], border: false, id: 'tree', title: this.layersText}, 
                {/*region: 'south', */xtype: "container", layout: "fit", border: false, /*height: 200, */id: 'legend', title: 'Легенда'}
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            ,{
                xtype: "container", 

                //layout:'ux.accordionvbox',
                    //defaults: {
                        //// applied to each contained panel
                        //bodyStyle: 'padding:15px',
                                //collapsible: true,
                                //flex			: 1			// The sizes of panels are divided according to the flex index
                    //},
                    //layoutConfig: {
                                //align 			: 'stretch',
                                //pack  			: 'start',
                                //animate			: true,
                                //titleCollapse	: true							    
                        //},
                //layout: {
                    //type: 'vbox',
                    //pack  : 'start'
                //},
                //

                border: false, 
                id: 'geoTools', 
                title: 'Инструменты', 
                items: [
                  {
                      xtype: 'panel',
                      title: 'Моя панель',
                      collapsible: true,
                      items: [
                        {
                            xtype: 'button',
                            text : 'Океаны и моря',
                            listeners: {
                                click: function(n) {
                                    openChooserOcean();
                                }
                            }
                        },
                        {
                            xtype: 'button',
                            text : 'Настройка сервисов',
                            leaf : true,
                            listeners: {
                                click: function(n) {
                                  if (!servicesSetting)
                                    servicesSetting = new gxp.ServicesSetting();
                                  servicesSetting.show();
                                }
                            }
                        }
                      ]
                  },
                  {
                      xtype: 'panel',
                      title: 'Запросы',
                      collapsible: true,
                      id: 'geoToolsQueryPanel'
                  }
                /*{*/
                    //xtype: "treepanel",
                    //id: "geoToolsTreepanel",
                    //rootVisible: false,
                    //lines: false,
                    //root: new Ext.tree.AsyncTreeNode({
                        //id: 'isroot',
                        //expanded: true,
                        //children: [
                        //{
                            //id   : '1', 
                            //text : 'Океаны и моря',
                            //leaf : true,
                            //listeners: {
                                //click: function(n) {
                                    //openChooserOcean();
                                //}
                            //}
                        //}
                        //[>,{
                            //id   : '2', 
                            //text : 'Адреса',
                            //leaf : true,
                            //listeners: {
                                //click: function(n) {
                                    //openAddressSearch();
                                //}
                            //}
                        //}*/
                        //,{
                            //id   : '3', 
                            //text : 'Настройка сервисов',
                            //leaf : true,
                            //listeners: {
                                //click: function(n) {
									//if (!servicesSetting)
										//servicesSetting = new gxp.ServicesSetting();
									//servicesSetting.show();
                                //}
                            //}
                        //}]
                    //})
                /*}*/]
            }
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                
            ]
        });


        //var queryPanel = new Ext.Panel(
          //{
            //layout: 'fit'
          //}
        //)
        //var queryPanel = new gxp.QueryPanel({
            //title: "Feature Query",
            //region: "west",
            //width: 390,
            //autoScroll: true,
            //bodyStyle: "padding: 10px",
            //map: this.map,
            //maxFeatures: 100,layout
            //layerStore: new Ext.data.JsonStore({
                //data: {
                    //layers: this.featureTypes
                //},
                //root: "layers",
                //fields: ["title", "name", "namespace", "url", "schema"]
            //}),
            //bbar: ["->",
            //{
                //text: "Query",
                //iconCls: "icon-find",
                //disabled: true,
                //handler: function () {
                    //queryPanel.query();
                //}
            //}],
            //listeners: {
                //ready: function (panel, store) {
                    //panel.getBottomToolbar().enable();
                    //this.featureStore = store;
                    //var control = this.map.getControlsByClass("OpenLayers.Control.DrawFeature")[0];
                    //var button = toolbar.find("iconCls", "icon-addfeature")[0];
                    //var handlers = {
                        //"Point": OpenLayers.Handler.Point,
                        //"Line": OpenLayers.Handler.Path,
                        //"Curve": OpenLayers.Handler.Path,
                        //"Polygon": OpenLayers.Handler.Polygon,
                        //"Surface": OpenLayers.Handler.Polygon
                    //}
                    //var simpleType = panel.geometryType.replace("Multi", "");
                    //var Handler = handlers[simpleType];
                    //if (Handler) {
                        //var active = control.active;
                        //if (active) {
                            //control.deactivate();
                        //}
                        //control.handler = new Handler(control, control.callbacks, Ext.apply(control.handlerOptions, {
                            //multi: (simpleType != panel.geometryType)
                        //}));
                        //if (active) {
                            //control.activate();
                        //}
                        //button.enable();
                        //delete button.initialConfig.disabled
                    //} else {
                        //button.disable();
                    //}
                //},
                //query: function (panel, store) {
                    //featureGrid.setStore(store);
                    //featureGrid.setTitle("Search Results (loading ...)");
                    //new Ext.LoadMask(featureGrid.el, {
                        //msg: 'Please Wait...',
                        //store: store
                    //}).show();
                //},
                //storeload: function (panel, store, records) {
                    //featureGrid.setTitle(this.getSearchResultsTitle(store.getTotalCount()));
                    //store.on({
                        //"remove": function () {
                            //featureGrid.setTitle(this.getSearchResultsTitle(store.getTotalCount() - 1));
                        //},
                        //scope: this
                    //})
                //},
                //scope: this
            //}
        //});
 
        var featureGridWindow = new Ext.Window({
          title: 'Результаты запроса',
          layout: {
              type: 'hbox',
              pack: 'start',
              align: 'stretch'
          },
          defaults: {
            flex: 1
          },
          width: 400,
          height: 300,
          featureGridPanel: "featureGridPanel",
          id: "featureGridWindow",
          closable: false,
          listeners: {
            render: function(){
              this.addTool(
                {
                  id: 'unpin',
                  scope: this,
                  handler: function(){

                    var c = Ext.getCmp(this.featureGridPanel)
                    this.items.each(
                      function(a){
                        c.add(a)
                      }
                    )
                    c.show()
                    c.doLayout()
                    c.expand()
                    c.ownerCt.doLayout()
                    this.hide()

                  }
                }
              )
              this.addTool({
                id: 'close',
                scope: this,
                handler: function(){
                  this.hide()
                }
              })
            }
          }
        });

        var featureGridPanel = new Ext.Panel({
          title: 'Результаты запроса',
          layout: {
              type: 'hbox',
              pack: 'start',
              align: 'stretch'
          },
          defaults: {
            flex: 1
          },
          id: "featureGridPanel",
          hidden: true,
          region: "south",
          height: 180,
          split: true,
          collapsible: true,
          //hasContent: false,
          //collapsed: true,
          featureGridWindow: "featureGridWindow",
          listeners: {
            render: function(){
              this.addTool(
                {
                  id: 'pin',
                  scope: this,
                  handler: function(){

                    var c = Ext.getCmp(this.featureGridWindow)
                    this.items.each(
                      function(a){
                        c.add(a)
                      }
                    )
                    c.show()
                    c.doLayout()
                    this.hide()
                    this.ownerCt.doLayout()

                  }
                }
              )
              this.addTool(
                {
                  id: 'close',
                  scope: this,
                  handler: function(){

                    var c = Ext.getCmp(this.featureGridWindow)
                    this.items.each(
                      function(a){
                        c.add(a)
                      }
                    )
                    c.doLayout()
                    this.hide()
                    this.ownerCt.doLayout()

                  }
                }
              )
            }
          }
        });
        //window.featureGridPanel = featureGridPanel

        this.toolbar = new Ext.Toolbar({
            disabled: true,
            id: 'paneltbar',
            items: this.createTools()
        });
        this.on("ready", function() {
            // enable only those items that were not specifically disabled
            var disabled = this.toolbar.items.filterBy(function(item) {
                return item.initialConfig && item.initialConfig.disabled;
            });
            this.toolbar.enable();
            disabled.each(function(item) {
                item.disable();
            });
        });

        var googleEarthPanel = new gxp.GoogleEarthPanel({
            mapPanel: this.mapPanel,
            listeners: {
                beforeadd: function(record) {
                    return record.get("group") !== "background";
                }
            }
        });

        // TODO: continue making this Google Earth Panel more independent
        // Currently, it's too tightly tied into the viewer.
        // In the meantime, we keep track of all items that the were already
        // disabled when the panel is shown.
        var preGoogleDisabled = [];

        googleEarthPanel.on("show", function() {
            preGoogleDisabled.length = 0;
            this.toolbar.items.each(function(item) {
                if (item.disabled) {
                    preGoogleDisabled.push(item);
                }
            })
            this.toolbar.disable();
            // loop over all the tools and remove their output
            for (var key in this.tools) {
                var tool = this.tools[key];
                if (tool.outputTarget === "map") {
                    tool.removeOutput();
                }
            }
            var layersContainer = Ext.getCmp("tree");
            var layersToolbar = layersContainer && layersContainer.getTopToolbar();
            if (layersToolbar) {
                layersToolbar.items.each(function(item) {
                    if (item.disabled) {
                        preGoogleDisabled.push(item);
                    }
                });
                layersToolbar.disable();
            }
        }, this);

        googleEarthPanel.on("hide", function() {
            // re-enable all tools
            this.toolbar.enable();

            var layersContainer = Ext.getCmp("tree");
            var layersToolbar = layersContainer && layersContainer.getTopToolbar();
            if (layersToolbar) {
                layersToolbar.enable();
            }
            // now go back and disable all things that were disabled previously
            for (var i=0, ii=preGoogleDisabled.length; i<ii; ++i) {
                preGoogleDisabled[i].disable();
            }

        }, this);

        this.mapPanelContainer = new Ext.Panel({
            layout: "card",
            region: "center",
            defaults: {
                border: false
            },
            items: [
                this.mapPanel,
                googleEarthPanel
            ],
            activeItem: 0
        });
        
        this.portalItems = [{
            region: "center",
            layout: "border",
            tbar: this.toolbar,
            items: [
                this.mapPanelContainer,
                westPanel
                ,featureGridPanel
            ]
        }];
        
        GeoExplorer.superclass.initPortal.apply(this, arguments);        
    },
    
    /** private: method[createTools]
     * Create the toolbar configuration for the main panel.  This method can be 
     * overridden in derived explorer classes such as :class:`GeoExplorer.Composer`
     * or :class:`GeoExplorer.Viewer` to provide specialized controls.
     */
    createTools: function() {
        var tools = [
            "-"
        ];
        return tools;
    },
    
    /** private: method[save]
     *
     * Saves the map config and displays the URL in a window.
     */ 
    save: function(callback, scope, configStr) {
        if (!configStr) 
            configStr = Ext.util.JSON.encode(this.getState());
        var method, url;
        if (this.id) {
            method = "PUT";
            url = "maps/" + this.id;
        } else {
            method = "POST";
            url = "maps";
        }
        OpenLayers.Request.issue({
            method: method,
            url: url,
            data: configStr,
            callback: function(request) {
                this.handleSave(request);
                if (callback) {
                    callback.call(scope || this);
                }
            },
            scope: this
        });
    },
        
    saveNew: function(callback, scope) {
        var configStr = Ext.util.JSON.encode(this.getState());
        var method, url;
        //if (this.id) {
        //    method = "PUT";
        //    url = "maps/" + this.id;
        //} else {
            method = "POST";
            url = "maps";
        //}
        OpenLayers.Request.issue({
            method: method,
            url: url,
            data: configStr,
            callback: function(request) {
                this.handleSave(request);
                if (callback) {
                    callback.call(scope || this);
                }
            },
            scope: this
        });
    },
        

    //changeProjection: function(desiredConfig, map, callback) {

        //var curConfigObj = this.getState();
        
        //var desiredProj = new OpenLayers.Projection(desiredConfig.projection);
        //var currentCenter;
        //currentCenter = new OpenLayers.LonLat(curConfigObj.map.center[0], curConfigObj.map.center[1]);
        //var currentProj = new OpenLayers.Projection(curConfigObj.map.projection);
        //currentCenter.transform(currentProj, desiredProj);
        //desiredConfig.center = [currentCenter.lon, currentCenter.lat];
        
        //if(desiredConfig.switchEko3){
           //for(var i=0;i<curConfigObj.map.layers.length;i++) {
               //if(curConfigObj.map.layers[i].name === 'eko_merge'){
                   //curConfigObj.map.layers[i].name = 'eko_merge_v';
               //}
           //}
           //delete desiredConfig.switchEko3;
        //}else{
           //for(i=0;i<curConfigObj.map.layers.length;i++) {
               //if(curConfigObj.map.layers[i].name === 'eko_merge_v'){
                   //curConfigObj.map.layers[i].name = 'eko_merge';
               //}
           //}
        //}
        
       //for(var src in curConfigObj.sources) {
           //if(curConfigObj.sources[src].projection){
               //curConfigObj.sources[src].projection = 
                   //desiredConfig.projection;
           //}
       //}
        
        //Ext.apply(curConfigObj.map, desiredConfig);
        //this.save(callback, null, Ext.util.JSON.encode(curConfigObj));
    //},
        

/** private: method[handleSave]
     *  :arg: ``XMLHttpRequest``
     */
    handleSave: function(request) {
        if (request.status == 200) {
            var config = Ext.util.JSON.decode(request.responseText);
            var mapId = config.id;
            if (mapId) {
                this.id = mapId;
                window.location.hash = "#maps/" + mapId;
            }
        } else {
            throw this.saveErrorText + request.responseText;
        }
    },
    
    /** private: method[showUrl]
     */
    showUrl: function() {
        var win = new Ext.Window({
            title: this.bookmarkText,
            layout: 'form',
            labelAlign: 'top',
            modal: true,
            bodyStyle: "padding: 5px",
            width: 300,
            items: [{
                xtype: 'textfield',
                fieldLabel: this.permakinkText,
                readOnly: true,
                anchor: "100%",
                selectOnFocus: true,
                value: window.location.href
            }]
        });
        win.show();
        win.items.first().selectText();
    },
    
    /** api: method[getBookmark]
     *  :return: ``String``
     *
     *  Generate a bookmark for an unsaved map.
     */
    getBookmark: function() {
        var params = Ext.apply(
            OpenLayers.Util.getParameters(),
            {q: Ext.util.JSON.encode(this.getState())}
        );
        
        // disregard any hash in the url, but maintain all other components
        var url = 
            document.location.href.split("?").shift() +
            "?" + Ext.urlEncode(params);
        
        return url;
    },

    /** private: method[displayAppInfo]
     * Display an informational dialog about the application.
     */
    displayAppInfo: function() {
        var appInfo = new Ext.Panel({
            title: this.appInfoText,
            html: "<iframe style='border: none; height: 100%; width: 100%' src='about.html' frameborder='0' border='0'><a target='_blank' href='about.html'>"+this.aboutText+"</a> </iframe>"
        });

        var about = Ext.applyIf(this.about, {
            title: '', 
            "abstract": '', 
            contact: ''
        });

        var mapInfo = new Ext.Panel({
            title: this.mapInfoText,
            html: '<div class="gx-info-panel">' +
                  '<h2>'+this.titleText+'</h2><p>' + about.title +
                  '</p><h2>'+this.descriptionText+'</h2><p>' + about['abstract'] +
                  '</p> <h2>'+this.contactText+'</h2><p>' + about.contact +'</p></div>',
            height: 'auto',
            width: 'auto'
        });

        var tabs = new Ext.TabPanel({
            activeTab: 0,
            items: [mapInfo, appInfo]
        });

        var win = new Ext.Window({
            title: this.aboutThisMapText,
            modal: true,
            layout: "fit",
            width: 300,
            height: 300,
            items: [tabs]
        });
        win.show();
    }
});

    var alertMeFedd = function(shit){
        alert(shit);
    }
    
    // translation of fields annd layer codes (fedd)
    var translatedSymbols = {
        field: {},
        layer: {}
    };
    
    var translateSymbols = function(symbolType, symbolCodes){
        var cached = translatedSymbols[symbolType];
        if(cached){
            var toAsk = [];
            for(var i=0;i<symbolCodes.length;i++){
                if(!cached[symbolCodes[i]]){
                    toAsk.push(symbolCodes[i]);
                }
            }
            if(toAsk.length>0){
                //call the servlet
                var url = "translate";
                var request = OpenLayers.Request.issue({
                    method: "GET",
                    url: url,
                    async: false,
                    params:{
                        type: symbolType,
                        code: toAsk
                    }
                });

                if(request.status==200){
                    var answered = Ext.util.JSON.decode(request.responseText);
                    for(var prop in answered){
                        cached[prop] = answered[prop];
                    }
                }
            }
        }
        var ret = {};
        for(i=0;i<symbolCodes.length;i++){
            if(cached && cached[symbolCodes[i]])
                ret[symbolCodes[i]] = cached[symbolCodes[i]];
            else
                ret[symbolCodes[i]] = symbolCodes[i];
        }
        
        return ret;
    }

    // metadata of fields and of layer codes (fedd)
    var metaData = {
        field: {},
        layer: {}
    };
    
    var getMetaData = function(symbolType, symbolCodes){
//	console.log ('getMetaData : symbolType = ' + symbolType + ', symbolCodes = ' + symbolCodes);
        var cached = metaData[symbolType];
        if(cached){
            var toAsk = [];
            for(var i=0;i<symbolCodes.length;i++){
                if(!cached[symbolCodes[i]]){
                    toAsk.push(symbolCodes[i]);
                }
            }
            if(toAsk.length>0){
                //call the servlet
                var url = "metadata";
                var request = OpenLayers.Request.issue({
                    method: "GET",
                    url: url,
                    async: false,
                    params:{
                        type: symbolType,
                        code: toAsk
                    }
                });

                if(request.status==200){
                    var answered = Ext.util.JSON.decode(request.responseText);
                    for(var prop in answered){
                        cached[prop] = answered[prop];
                    }
                }
            }
        }
        var ret = {};
        for(i=0;i<symbolCodes.length;i++){
            if(cached && cached[symbolCodes[i]])
                ret[symbolCodes[i]] = cached[symbolCodes[i]];
            else
                ret[symbolCodes[i]] = symbolCodes[i];
        }
        
        return ret;
    }

