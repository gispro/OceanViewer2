/**
 * Copyright (c) 2009-2010 The Open Planning Project
 *
 * @requires GeoExplorer.js
 */

/** api: (define)
 *  module = GeoExplorer
 *  class = GeoExplorer.Composer(config)
 *  extends = GeoExplorer
 */

/** api: constructor
 *  .. class:: GeoExplorer.Composer(config)
 *
 *      Create a GeoExplorer application intended for full-screen display.
 */
GeoExplorer.Composer = Ext.extend(GeoExplorer, {

    // Begin i18n.
    saveMapText: "Save Map",
    exportMapText: "Export Map",
    toolsTitle: "Choose tools to include in the toolbar:",
    previewText: "Preview",
    backText: "Back",
    nextText: "Next",
    loginText: "Login",
    loginErrorText: "Invalid username or password.",
    userFieldText: "User",
    passwordFieldText: "Password", 
    // End i18n.

    constructor: function(config) {
        if (config.authStatus === 401) {
            // user has not authenticated or is not authorized
            this.authorizedRoles = [];
        } else {
            // user has authenticated or auth back-end is not available
            this.authorizedRoles = ["ROLE_ADMINISTRATOR"];
        }
        // should not be persisted or accessed again
        delete config.authStatus;

        config.tools = [
            {
                ptype: "gxp_layertree",
                outputConfig: {
                    id: "layertree"
                },
                outputTarget: "tree"
            }, {
                ptype: "gxp_legend",
                outputTarget: 'legend',
                outputConfig: {autoScroll: true}
            }, {
                ptype: "gxp_addlayers",
                actionTarget: "tree.tbar",
                upload: true
            }, {
                ptype: "gxp_removelayer",
                actionTarget: ["tree.tbar", "layertree.contextMenu"]
            }, {
                ptype: "gxp_layerproperties",
                actionTarget: ["tree.tbar", "layertree.contextMenu"]
            }, {
                ptype: "gxp_styler",
                actionTarget: ["tree.tbar", "layertree.contextMenu"]
            }, {
                ptype: "gxp_zoomtolayerextent",
                actionTarget: {target: "layertree.contextMenu", index: 0}
            }, {
                ptype: "gxp_navigation", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 6}
            }, {
                ptype: "gxp_wmsgetfeatureinfo", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 7}
                
                

    , displayPopup: function(evt, title, toShow, isGrid) {
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
    },


    addActions: function() {
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
                                        arr[j] = [keyVal[1], keyVal[2], superGroup + " No." + group];
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

                
            }, {
//                ptype: "gxp_featuremanager",
//                id: "featuremanager",
//                maxFeatures: 20,
//                paging: false
//            }, {
//                ptype: "gxp_featureeditor",
//                featureManager: "featuremanager",
//                autoLoadFeatures: true,
//                toggleGroup: this.toggleGroup,
//                actionTarget: {target: "paneltbar", index: 8}
//            }, {
                ptype: "gxp_measure", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 10}
            }, {
                ptype: "gxp_zoom",
                actionTarget: {target: "paneltbar", index: 11}
            }, {
                ptype: "gxp_navigationhistory",
                actionTarget: {target: "paneltbar", index: 13}
            }, {
                ptype: "gxp_zoomtoextent",
                actionTarget: {target: "paneltbar", index: 15}
            }, {
//                ptype: "gxp_print",
//                customParams: {outputFilename: 'GeoExplorer-print'},
//                printService: config.printService,
//                actionTarget: {target: "paneltbar", index: 5}
//            }, {
                ptype: "gxp_googleearth",
                actionTarget: {target: "paneltbar", index: 17},
                apiKeys: {
                    "localhost": "ABQIAAAAeDjUod8ItM9dBg5_lz0esxTnme5EwnLVtEDGnh-lFVzRJhbdQhQBX5VH8Rb3adNACjSR5kaCLQuBmw",
                    "localhost:8080": "ABQIAAAAeDjUod8ItM9dBg5_lz0esxTnme5EwnLVtEDGnh-lFVzRJhbdQhQBX5VH8Rb3adNACjSR5kaCLQuBmw",
                    "maps.gispro.ru:8888": "ABQIAAAAtUy1UuiFvVDSfU0TG3Fh6xT47jK7DJg6JugxpSJykj2JJa4aHRRf_vXP6M9o-RWHLltQ7_L44SYbBQ",
					"gisbox.ru:8080": "ABQIAAAAtUy1UuiFvVDSfU0TG3Fh6xRakI6Y6CU8176DTpVm6YZhntcRmBRCQGXzWiR0M4aPWBYO8EmChHR_lQ"
                }
            }
        ];
    
        GeoExplorer.Composer.superclass.constructor.apply(this, arguments);
    },

    /** api: method[destroy]
     */
    destroy: function() {
        this.loginButton = null;
        GeoExplorer.Composer.superclass.destroy.apply(this, arguments);
    },

    /** private: method[showLoginDialog]
     * Show the login dialog for the user to login.
     */
    showLoginDialog: function() {
        var panel = new Ext.FormPanel({
            url: "login",
            frame: true,
            labelWidth: 77,
            defaultType: "textfield",
            errorReader: {
                read: function(response) {
                    var success = false;
                    var records = [];
                    if (response.status === 200) {
                        success = true;
                    } else {
                        records = [
                            {data: {id: "username", msg: this.loginErrorText}},
                            {data: {id: "password", msg: this.loginErrorText}}
                        ];
                    }
                    return {
                        success: success,
                        records: records
                    };
                }
            },
            items: [{
                fieldLabel: this.userFieldText,
                name: "username",
                allowBlank: false
            }, {
                fieldLabel: this.passwordFieldText,
                name: "password",
                inputType: "password",
                allowBlank: false
            }],
            buttons: [{
                text: this.loginText,
                formBind: true,
                handler: submitLogin,
                scope: this
            }],
            keys: [{ 
                key: [Ext.EventObject.ENTER], 
                handler: submitLogin,
                scope: this
            }]
        });

        function submitLogin() {
            panel.buttons[0].disable();
            panel.getForm().submit({
                success: function(form, action) {
                    this.authorizedRoles = ["ROLE_ADMINISTRATOR"];
                    Ext.getCmp('paneltbar').items.each(function(tool) {
                        if (tool.needsAuthorization === true) {
                            tool.enable();
                        }
                    });
                    this.loginButton.hide();
                    win.close();
                },
                failure: function(form, action) {
                    this.authorizedRoles = [];
                    panel.buttons[0].enable();
                    form.markInvalid({
                        "username": this.loginErrorText,
                        "password": this.loginErrorText
                    });
                },
                scope: this
            });
        }
                
        var win = new Ext.Window({
            title: this.loginText,
            layout: "fit",
            width: 235,
            height: 130,
            plain: true,
            border: false,
            modal: true,
            items: [panel]
        });
        win.show();
    },

    /**
     * api: method[createTools]
     * Create the toolbar configuration for the main view.
     */
    createTools: function() {
		var tools = GeoExplorer.Composer.superclass.createTools.apply(this, arguments);

        // unauthorized, show login button
        if (this.authorizedRoles.length === 0) {
            this.loginButton = new Ext.Button({
                iconCls: 'login',
                text: this.loginText,
                handler: this.showLoginDialog,
                scope: this
            });
            tools.push(this.loginButton);
        } else {
        }
		/**
        var aboutButton = new Ext.Button({
            text: this.appInfoText,
            iconCls: "icon-geoexplorer",
            handler: this.displayAppInfo,
            scope: this
        });
		**/
        //tools.unshift("-");
        tools.unshift(new Ext.Button({
            tooltip: this.exportMapText,
            needsAuthorization: true,
            disabled: !this.isAuthorized(),
            handler: function() {
                this.save(this.showEmbedWindow);
            },
            scope: this,
            iconCls: 'icon-export'
        }));
        tools.unshift(new Ext.Button({
            tooltip: this.saveMapText,
            needsAuthorization: true,
            disabled: !this.isAuthorized(),
            handler: function() {
                this.save(this.showUrl);
            },
            scope: this,
            iconCls: "icon-save"
        }));
        //tools.unshift("-");
        //tools.unshift(aboutButton);
		
		tools.unshift('->');
		tools.unshift({
			text: 'Справка',
			tooltip: 'Справка', 
			enableToggle: true,
			id: 'helpWindowCheckButton', 
			checked: false
			//toggleHandler: menuOnCheckHelpWindow
		});
		
		tools.unshift({
			text: 'Окно',
			menu: new Ext.menu.Menu({
				items: [
					new Ext.menu.CheckItem({
						text: 'Каталог ресурсов',
						checkHandler: checkHandler
					}),
					'-',
					new Ext.menu.CheckItem({
						text: 'Окно результатов',
						checkHandler: checkHandler
					}),
					new Ext.menu.CheckItem({
						text: 'Справка',
						checkHandler: checkHandler
					})
				]
			})
		});
		tools.unshift({
			text: 'Слой',
			menu: new Ext.menu.Menu({
				items: [
					{
						text: 'Добавить'
						//handler: date
					},
					{
						text: 'Удалить'
						//handler: date
					}
				]
			})
		});
		tools.unshift({
			text: 'Карта',
			menu: new Ext.menu.Menu({
				items: [
					{
						text: 'Новая'
						//handler: date
					},
					{
						text: 'Загрузить'
						//handler: date
					},
					{
						text: 'Сохранить'
						//handler: date
					}
				]
			})
		});
		
		// Remove this alert in production
		function checkHandler(item, e) {
			alert('Checked the item: ' + item.text);
		}
		
        return tools;
    },

    /** private: method[openPreview]
     */
    openPreview: function(embedMap) {
        var preview = new Ext.Window({
            title: this.previewText,
            layout: "fit",
            items: [{border: false, html: embedMap.getIframeHTML()}]
        });
        preview.show();
        var body = preview.items.get(0).body;
        var iframe = body.dom.firstChild;
        var loading = new Ext.LoadMask(body);
        loading.show();
        Ext.get(iframe).on('load', function() { loading.hide(); });
    },

    /** private: method[showEmbedWindow]
     */
    showEmbedWindow: function() {
       var toolsArea = new Ext.tree.TreePanel({title: this.toolsTitle, 
           autoScroll: true,
           root: {
               nodeType: 'async', 
               expanded: true,
               children: this.viewerTools
           }, 
           rootVisible: false,
           id: 'geobuilder-0'
       });

       var previousNext = function(incr){
           var l = Ext.getCmp('geobuilder-wizard-panel').getLayout();
           var i = l.activeItem.id.split('geobuilder-')[1];
           var next = parseInt(i, 10) + incr;
           l.setActiveItem(next);
           Ext.getCmp('wizard-prev').setDisabled(next==0);
           Ext.getCmp('wizard-next').setDisabled(next==1);
           if (incr == 1) {
               this.save();
           }
       };

       var embedMap = new gxp.EmbedMapDialog({
           id: 'geobuilder-1',
           url: "viewer" + "#maps/" + this.id
       });

       var wizard = {
           id: 'geobuilder-wizard-panel',
           border: false,
           layout: 'card',
           activeItem: 0,
           defaults: {border: false, hideMode: 'offsets'},
           bbar: [{
               id: 'preview',
               text: this.previewText,
               handler: function() {
                   this.save(this.openPreview.createDelegate(this, [embedMap]));
               },
               scope: this
           }, '->', {
               id: 'wizard-prev',
               text: this.backText,
               handler: previousNext.createDelegate(this, [-1]),
               scope: this,
               disabled: true
           },{
               id: 'wizard-next',
               text: this.nextText,
               handler: previousNext.createDelegate(this, [1]),
               scope: this
           }],
           items: [toolsArea, embedMap]
       };

       new Ext.Window({
            layout: 'fit',
            width: 500, height: 300,
            title: this.exportMapText,
            items: [wizard]
       }).show();
    }

});
