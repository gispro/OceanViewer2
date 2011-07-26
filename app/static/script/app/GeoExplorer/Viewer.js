/**
 * Copyright (c) 2009-2010 The Open Planning Project
 *
 * @requires GeoExplorer.js
 */

/** api: (define)
 *  module = GeoExplorer
 *  class = Embed
 *  base_link = GeoExplorer
 */
Ext.namespace("GeoExplorer");

/** api: constructor
 *  ..class:: GeoExplorer.Viewer(config)
 *
 *  Create a GeoExplorer application suitable for embedding in larger pages.
 */
GeoExplorer.Viewer = Ext.extend(GeoExplorer, {
    
    applyConfig: function(config) {
        var allTools = config.viewerTools || this.viewerTools;
        var tools = [];
        var toolConfig;
        for (var i=0, len=allTools.length; i<len; i++) {
            var tool = allTools[i];
            if (tool.checked === true) {
                toolConfig = {
                    ptype: tool.ptype, 
                    toggleGroup: tool.toggleGroup, 
                    actionTarget: tool.actionTarget
                };
                // TODO: Remove this hack for getting the apiKey into the viewer
                if (tool.ptype === "gxp_googleearth") {
                    // look for apiKey and apiKeys in saved composer config
                    var jj = config.tools ? config.tools.length : 0;
                    var composerConfig;
                    for (var j=0; j<jj; ++j) {
                        composerConfig = config.tools[j];
                        if (composerConfig.ptype === tool.ptype) {
                            toolConfig.apiKey = composerConfig.apiKey;
                            toolConfig.apiKeys = composerConfig.apiKeys;
                            break;
                        }
                    }
                }
                
                /*if(tool.ptype === "gxp_wmsgetfeatureinfo") {

    toolConfig.displayPopup = function(evt, title, toShow, isGrid) {
        var popup;
        var popupKey = evt.xy.x + "." + evt.xy.y;

        if (!(popupKey in this.popupCache)) {
            popup = this.addOutput({
                xtype: "gx_popup",
                title: this.popupTitle,
                layout: "accordion",
                location: evt.xy,
                map: this.target.mapPanel,
                width: 250,
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
                title: title,
                layout: "fit",
                autoScroll: true,
                autoWidth: true,
                collapsible: true,
                items: [toShow]
            });
        }else{
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


    toolConfig.addActions = function() {
        this.popupCache = {};
        
        var actions = gxp.plugins.WMSGetFeatureInfo.superclass.addActions.call(this, [{
            tooltip: this.infoActionTip,
            iconCls: "gxp-icon-getfeatureinfo",
            toggleGroup: this.toggleGroup,
            enableToggle: true,
            allowDepress: true,
            toggleHandler: function(button, pressed) {
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
                            }else{
                                var lines = evt.text.split("\n");
                                var ret = "";
                                var arr = [];
                                var j = 0;
                                var group = 0;
                                var wasGroup = false;
                                var superGroup = "";
                                
                                for(i=0;i<lines.length;i++){
                                    var keyVal = lines[i].match(/([^=]+)=(.*)/);
                                    if(keyVal){
                                        keyVal[1] = keyVal[1].replace(/^\s+/g, "").replace(/\s+$/g, "");
                                        keyVal[2] = keyVal[2].replace(/^\s+/g, "").replace(/\s+$/g, "");
                                        arr[j] = [keyVal[1], keyVal[2], superGroup + " Объект " + group];
                                        maxGroup = group;
                                        j++;
                                        ret = ret + "key: " + lines[i][0] + ", val: " + lines[i][1] + "\n";
                                        wasGroup = false;
                                    }else{
                                        if(!wasGroup){
                                            wasGroup = true;
                                            group++;
                                        }
                                        var supGrTry = lines[i].match(/FeatureType\s+[\"\']?([^\"\']+)[\"\']?/);
                                        if(supGrTry){
                                            if(superGroup != supGrTry[1]){
                                                group=1;
                                            }
                                            superGroup = supGrTry[1] ;
                                        }
                                    }
                                }
                                
                                // ext grid
                                var myReader = new Ext.data.ArrayReader({}, [
                                    {name: 'Field'},
                                    {name: 'Value'},
                                    {name: 'Layer'}
                                ]);                                
                                
                                var grid = new Ext.grid.GridPanel({
                                    store: new Ext.data.GroupingStore({
                                        data: arr,
                                        reader: myReader,
                                        groupField: 'Layer'
                                    }),
                                    view: new Ext.grid.GroupingView({
                                        forceFit:true,
                                        groupTextTpl: "{text}"
                                    }),
                                    columns: [
                                    {
                                        header: 'Поле', 
                                        sortable: true, 
                                        dataIndex: 'Field',
                                        groupable: false
                                    },
                                    {
                                        header: 'Значение', 
                                        sortable: true,
                                        dataIndex: 'Value',
                                        groupable: false
                                    },
                                    {
                                        header: 'Слой', 
                                        sortable: true,
                                        dataIndex: 'Layer',
                                        groupable: false,
                                        hidden: true
                                    }
                                    ]
                                });                                   
                                
                                this.displayPopup(
                                    evt, x.get("title") || x.get("name"), grid, true
                                );
                            }
                        },
                        scope: this
                    }
                });
                map.addControl(control);
                info.controls.push(control);
                if(infoButton.pressed) {
                    control.activate();
                }
            }, this);

        };
        
        this.target.mapPanel.layers.on("update", updateInfo, this);
        this.target.mapPanel.layers.on("add", updateInfo, this);
        this.target.mapPanel.layers.on("remove", updateInfo, this);
        
        return actions;
    }

                
                
                
                    
                    
                    
                }
                
                */
                tools.push(toolConfig);
            }
        }
        config.tools = tools;
        GeoExplorer.Viewer.superclass.applyConfig.call(this, config);
    },

    /** private: method[initPortal]
     * Create the various parts that compose the layout.
     */
    initPortal: function() {

        this.toolbar = new Ext.Toolbar({
            disabled: true,
            id: "paneltbar",
            items: this.createTools()
        });
        this.on("ready", function() {this.toolbar.enable();}, this);

        this.mapPanelContainer = new Ext.Panel({
            layout: "card",
            region: "center",
            defaults: {
                border: false
            },
            items: [
                this.mapPanel,
                new gxp.GoogleEarthPanel({
                    mapPanel: this.mapPanel,
                    listeners: {
                        beforeadd: function(record) {
                            return record.get("group") !== "background";
                        }
                    }
                })
            ],
            activeItem: 0
        });

        this.portalItems = [{
            region: "center",
            layout: "border",
            tbar: this.toolbar,
            items: [
                this.mapPanelContainer
            ]
        }];
        
        GeoExplorer.superclass.initPortal.apply(this, arguments);        

    },

    /**
     * api: method[createTools]
     * Create the various parts that compose the layout.
     */
    createTools: function() {
        var tools = GeoExplorer.Viewer.superclass.createTools.apply(this, arguments);

        var layerChooser = new Ext.Button({
            tooltip: 'Layer Switcher',
            iconCls: 'icon-layer-switcher',
            menu: new gxp.menu.LayerMenu({
                layers: this.mapPanel.layers
            })
        });

        tools.unshift("-");
        tools.unshift(layerChooser);

        var aboutButton = new Ext.Button({
            tooltip: this.aboutText,
            iconCls: "icon-about",
            handler: this.displayAppInfo,
            scope: this
        });

        tools.push("->");
        tools.push(aboutButton);

        return tools;
    }
});
