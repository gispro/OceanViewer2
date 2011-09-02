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
            /*{
                "ptype": "gxp_graticulegxptool",
                "controlOptions":{
                    //numPoints: 2, 
                    labelled: true
                    , displayInLayerSwitcher: false
                },
                "outputTarget":"map"
            },*/
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
                id: "gxp_wmsgetfeatureinfo_ctl",
                ptype: "gxp_wmsgetfeatureinfo", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 7}
            }, {
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
                ptype: "gxp_googleearth",
                actionTarget: {target: "paneltbar", index: 17},
                apiKeys: {
                    "localhost": "ABQIAAAAeDjUod8ItM9dBg5_lz0esxTnme5EwnLVtEDGnh-lFVzRJhbdQhQBX5VH8Rb3adNACjSR5kaCLQuBmw",
                    "localhost:8080": "ABQIAAAAeDjUod8ItM9dBg5_lz0esxTnme5EwnLVtEDGnh-lFVzRJhbdQhQBX5VH8Rb3adNACjSR5kaCLQuBmw",
                    "maps.gispro.ru:8888": "ABQIAAAAtUy1UuiFvVDSfU0TG3Fh6xT47jK7DJg6JugxpSJykj2JJa4aHRRf_vXP6M9o-RWHLltQ7_L44SYbBQ",
					"gisbox.ru:8080": "ABQIAAAAtUy1UuiFvVDSfU0TG3Fh6xRakI6Y6CU8176DTpVm6YZhntcRmBRCQGXzWiR0M4aPWBYO8EmChHR_lQ",
					"80.245.248.214": "ABQIAAAAtUy1UuiFvVDSfU0TG3Fh6xTaPfcsKMaIBhJYnvndU7vWyzU75RQSjFz1_DhTzMS5J2xtBNpq8mdgRA"
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
            //disabled: !this.isAuthorized(),
            handler: function() {
                this.save(this.showEmbedWindow);
            },
            scope: this,
            iconCls: 'icon-export'
        }));
        tools.unshift(new Ext.Button({
            tooltip: this.saveMapText,
            needsAuthorization: true,
            //disabled: !this.isAuthorized(),
            handler: function() {
                this.save(this.showUrl);
            },
            scope: this,
            iconCls: "icon-save"
        }));
        tools.unshift(new Ext.Button({
            tooltip: "Сохранить новую",
            needsAuthorization: true,
            //disabled: !this.isAuthorized(),
            handler: function() {
                this.saveNew(this.showUrl);
            },
            scope: this,
            iconCls: "icon-save"
        }));
        
        this.projectionStoreForMenu = {
            'Меркатора': {
                projection: "EPSG:900913",
                units: "m",
                maxResolution: 156543.03392804097,
                maxExtent: [
                    -20037508.34, -20037508.34,
                    20037508.34, 20037508.34
                ]
            }
            ,
            'Географическая': {
                projection: "EPSG:4326",
                units: "degrees",
                maxResolution: 1.40625,
                maxExtent: [
                    -180, -90, 180, 90
                ]
            }
            , 
            'Коническая' : {
                projection: "EPSG:102012",
                units: "m",
                maxResolution: 156543.03392804097,
                maxExtent: [
                    -20037508.342789244, -13717459.765275056,
                    20037508.342789244, 18421795.00817686                
                ]
            }
            , 
            'Стереографическая': {
                projection: "EPSG:3995",
                units: "m",
                maxResolution: 156543.03392804097,
                maxExtent: [
                    -91413530.18878764, -105555252.52414103,
                    91413530.18878764, 105555252.52414103
                ]
            }
        };
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
			text: 'Вид',
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
					}),
                                        {
                                            text: "Проекция",
                                            menu: {
                                                items: [
                                                    new Ext.menu.CheckItem({
                                                            text: 'Меркатора',
                                                            checked: app.map.projection === app.projectionStoreForMenu['Меркатора'].projection,
                                                            handler: function() {
                                                                var callback = function(){
                                                                    window.location.reload(true);
                                                                }
                                                                app.changeProjection(app.projectionStoreForMenu['Меркатора'], app, callback);
                                                            }
                                                    }),
                                                    new Ext.menu.CheckItem({
                                                            text: 'Географическая',
                                                            checked: app.map.projection === app.projectionStoreForMenu['Географическая'].projection,
                                                            handler: function() {
                                                                var callback = function(){
                                                                    window.location.reload(true);
                                                                }
                                                                app.changeProjection(app.projectionStoreForMenu['Географическая'], app, callback);
                                                            }
                                                    }),
                                                    new Ext.menu.CheckItem({
                                                            text: 'Коническая',
                                                            checked: app.map.projection === app.projectionStoreForMenu['Коническая'].projection,
                                                            handler: function() {
                                                                var callback = function(){
                                                                    window.location.reload(true);
                                                                }
                                                                app.changeProjection(app.projectionStoreForMenu['Коническая'], app, callback);
                                                            }
                                                    }),
                                                    new Ext.menu.CheckItem({
                                                            text: 'Стереографическая',
                                                            checked: app.map.projection === app.projectionStoreForMenu['Стереографическая'].projection,
                                                            handler: function() {
                                                                var callback = function(){
                                                                    window.location.reload(true);
                                                                }
                                                                app.changeProjection(app.projectionStoreForMenu['Стереографическая'], app, callback);
                                                            }
                                                    })
                                                ]
                                            }
                                        }
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
                        //bububu: this,
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
                                                //,
						//handler: function() {
                                                //    bububu.save(bububu.showUrl);
                                                //}
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
