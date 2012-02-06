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

        //TODO ext_3_ request and ext_3_ iterator
        Ext4.Ajax.request({
                 method: 'post'
                ,url: '/login'
                ,params: {username: config.username, password: config.password}
                ,scope: this
                ,success: function(respond){
                      this.authorizedRoles = ["ROLE_ADMINISTRATOR"];
                      Ext4.Array.each(this.tools, function(tool) {
                          if (tool.needsAuthorization === true) {
                              tool.enable();
                          }
                      })
                    }

                ,failure: function(er){
                      this.authorizedRoles = [];
                      Ext4.Array.each(this.tools, function(tool) {
                          if (tool.needsAuthorization === true) {
                              tool.disable();
                          }
                      })
                    }
            })

        config.tools = [
            /*{
                "ptype": "gxp_graticulegxptool",
                "controlOptions":{
                    //numPoints: 2, 
                    labelled: true
                    , displayInLayerSwitcher: false
                },
                "outputTarget":"map",
                id: "graticulegxptool"
            },*/
            {
                "ptype": "gxp_mouseposgxptool",
                "controlOptions":{
                    displayProjection: new OpenLayers.Projection("EPSG:4326"),
                    numDigits: 3,
                    displayClass: "mousePos",
                    prefix: "X: ",
                    separator: ", Y:"
                },
                "outputTarget":"map"
            },
            /*{
                "ptype": "gxp_overviewgxptool",
                "controlOptions":{
                    maximized: true
                    ,
                    outsideViewport: true
                },
                "outputTarget":"map"
            },*/
             {
                ptype: "gxp_layertree",
                groups: {editable: 'Редактируемые'},
                outputConfig: {
                    id: "layertree",
                },
                outputTarget: "tree"
            }
            ,{
                ptype: "gxp_legend",
                outputTarget: 'legend',
                outputConfig: {autoScroll: true}
            }
            ,{
                id: "gxp_addlayers_ctl",
                ptype: "gxp_addlayers",
                actionTarget: "tree.tbar",
                upload: true
            }
            ,{
                ptype: "gxp_removelayer",
                actionTarget: ["tree.tbar", "layertree.contextMenu"]
            }
            ,{
                ptype: "gxp_layerproperties",
                actionTarget: ["tree.tbar", "layertree.contextMenu"]
            }
            ,{
                ptype: "gxp_styler",
                sameOriginStyling: false,
                actionTarget: ["tree.tbar", "layertree.contextMenu"]
            }
            ,{
                ptype: "gxp_zoomtolayerextent",
                actionTarget: {target: "layertree.contextMenu", index: 0}
            }
            ,{
                id: "gxp_wmsgetfeatureinfo_ctl",
                ptype: "gxp_wmsgetfeatureinfo", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 11}
                
            } 
            ,{
                ptype: "gxp_navigation", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 12}
            }
            ,{
                ptype: "gxp_zoom",
                actionTarget: {target: "paneltbar", index: 14}
            }
            ,{
                ptype: "gxp_navigationhistory",
                actionTarget: {target: "paneltbar", index: 15}
            }
            ,{
                ptype: "gxp_zoomtoextent",
                actionTarget: {target: "paneltbar", index: 16}
            }
            ,{
                leaf: true, 
                text: gxp.plugins.Legend.prototype.tooltip, 
                checked: true, 
                iconCls: "gxp-icon-legend",
                ptype: "gxp_legend",
                actionTarget: {target: "paneltbar", index: 17}
            }
            ,{
                ptype: "gxp_measure", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 37}
            }
            ,{
                ptype: "gxp_prickertool"
                ,actionTarget: "paneltbar"
                ,layers: [ "ru_hydrometcentre_42:ru_hydrometcentre_42_1","ru_hydrometcentre_42:ru_hydrometcentre_42_2","ru_hydrometcentre_42:ru_hydrometcentre_42_3" ]
                ,aliaseUrl: '/translate'
                ,getInfoUrl: '/resources/wms'
                ,saveChartUrl: '/save'
                ,actionTarget: {target: "paneltbar", index: 38}
                //,buffer: 0
            }
            /*,{
              ptype: "gxp_gis_measure", toggleGroup: this.toggleGroup,
              actionTarget: {target: "paneltbar", index: 37}
            }*/
            /*
            ,{
                ptype: "gxp_googleearth",
                actionTarget: {target: "paneltbar", index: 17},
                apiKeys: {
                    "localhost": "ABQIAAAAeDjUod8ItM9dBg5_lz0esxTnme5EwnLVtEDGnh-lFVzRJhbdQhQBX5VH8Rb3adNACjSR5kaCLQuBmw",
                    "localhost:8080": "ABQIAAAAeDjUod8ItM9dBg5_lz0esxTnme5EwnLVtEDGnh-lFVzRJhbdQhQBX5VH8Rb3adNACjSR5kaCLQuBmw",
                    "maps.gispro.ru:8888": "ABQIAAAAtUy1UuiFvVDSfU0TG3Fh6xT47jK7DJg6JugxpSJykj2JJa4aHRRf_vXP6M9o-RWHLltQ7_L44SYbBQ",
					"gisbox.ru:8080": "ABQIAAAAtUy1UuiFvVDSfU0TG3Fh6xRakI6Y6CU8176DTpVm6YZhntcRmBRCQGXzWiR0M4aPWBYO8EmChHR_lQ",
					"80.245.248.214": "ABQIAAAAtUy1UuiFvVDSfU0TG3Fh6xTaPfcsKMaIBhJYnvndU7vWyzU75RQSjFz1_DhTzMS5J2xtBNpq8mdgRA"
                }
            }*/
            ,{
                // shared FeatureManager for feature editing, grid and querying
                ptype: "gxp_featuremanager",
                id: "featuremanager",
                maxFeatures: 20,
                actionTarget: {target: "paneltbar", index:19}
            }
            //,{
                //ptype: "gxp_featureeditor",
                //featureManager: "featuremanager",
                //createFeatureActionText: 'create',
                //editFeatureActionText: 'edit',
                //outputConfig: {panIn: false},
                //toggleGroup: "layertools",
                ////supportAbstractGeometry: true,
                //actionTarget: {target: "paneltbar", index:18}
            //}
            ,{
                ptype: "gxp_featureeditorpanel",
                featureManager: "featuremanager",
                outputConfig: {panIn: false},
                toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index:18},
                createFeatureActionTip: "Создать новый объект слоя",
                editFeatureActionTip: "Редактировать объект слоя",
                editFeatureActionText: '',
                createFeatureActionText: '',
                bodyAttribute: 'message',
                usernameAttribute: 'author',
                featureManagerToolText: '',
                featureManagerToolTip: 'Панель редактирования',
                toolWinText: 'Редактирование'

            }
            //,{
                //ptype: "gxp_featuregrid",
                //featureManager: "featuremanager",
                //outputConfig: {
                    //id: "featuregrid"
                //},
                //outputTarget: "south"
            //}
            //,{
                //ptype: "gxp_queryform",
                //featureManager: "featuremanager",
                //outputConfig: {
                    //title: "Query",
                    //width: 320
                //},
                //actionTarget: ["featuregrid.bbar", "tree.contextMenu"],
                //appendActions: false
            //}
            //,{
                //// not a useful tool - just a demo for additional items
                //actionTarget: "mybbar", // ".bbar" would also work
                //actions: [{text: "Click me - I'm a tool on the portal's bbar"}]
            //}
        ];
    



        GeoExplorer.Composer.superclass.constructor.apply(this, arguments);

    },

    /** api: method[destroy]
     */
    destroy: function() {
        this.loginButton = null;
        GeoExplorer.Composer.superclass.destroy.apply(this, arguments);
    },

    /**
     * api: method[createTools]
     * Create the toolbar configuration for the main view.
     */
    createTools: function() {
        var tools = GeoExplorer.Composer.superclass.createTools.apply(this, arguments);

        // unauthorized, show login button
        /*if (this.authorizedRoles.length === 0) {
            this.loginButton = new Ext.Button({
                iconCls: 'login',
                text: this.loginText,
                handler: this.showLoginDialog,
                scope: this
            });
            tools.push(this.loginButton);
        } else {
        }*/
		/**
        var aboutButton = new Ext.Button({
            text: this.appInfoText,
            iconCls: "icon-geoexplorer",
            handler: this.displayAppInfo,
            scope: this
        });
		**/
        //tools.unshift("-");
        
        /*
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
            tooltip: "Сохранить новую",
            needsAuthorization: true,
            //disabled: !this.isAuthorized(),
            handler: function() {
                this.saveNew(this.showUrl);
            },
            scope: this,
            iconCls: "icon-save"
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
        */
        
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
                    //-20037508.342789244, -13717459.765275056,
                    //20037508.342789244, 18421795.00817686                
                    //-2.0037508342789244E7,-13717459.765275056,20037508.342789244,26357556.920303434
                    //-20037508.34, -16069620,
                    //20037508.34, 16069620
                    //-20037508.34, -20037508.34,
                    //20037508.34, 20037508.34
                    //-900691700374.099, -35565700,
                    //900684359774.099, -28225100
                    //54368.65331014791, -58444533.29569984, 98495607.76719199, 11248883.449091688
                    
                        //-20037508.342789, -13717459.765275, 20037508.342789, 18421795.008177
                        -20037508.342789, -13717459.765275, 20037508.342789, 20037508.342789 // 26357556.920303
                ],
                switchEko3: true
            }
            , 
            'Полярная Север': {
                projection: "EPSG:3576",
                //projection: "EPSG:3995",
                units: "m",
                maxResolution: 156543.03392804097,
                maxExtent: [
                    //-20037508.34, -16069627,
                    //20037508.34, 16069627
                    //3995:
                    //-91413530.18878764, -105555252.52414103,
                    //91413530.18878764, 105555252.52414103
                    //3567:
                    -9036842.762, -9036842.762,
                    9036842.762, 9036842.762                    
                    //-5133549.56760757, 
                    //-5397733.44656832, 
                    //5397733.44656832, 
                    //1667991.36644116
                    //-5133549.56760757,-5397733.44656832,5397733.44656832,5133549.56760757
                ],
                switchEko3: true
            }
            , 
            'Полярная Юг': {
                projection: "EPSG:3976",
                units: "m",
                maxResolution: 156543.03392804097,
                maxExtent: [
                    -9036842.762, -9036842.762,
                    9036842.762, 9036842.762                    
                ],
                switchEko3: true
            }
        };
        //tools.unshift("-");
        //tools.unshift(aboutButton);
		
                tools.unshift({
                    xtype: "gxp_googlegeocodercombo",
                    id: "googSearchCombo",
                    //leaf : true,
                    width: 200,
                    listeners: {
                        select: function(combo, record) {
                            var bounds = record.get("viewport").transform(
                            new OpenLayers.Projection("EPSG:4326"), this.mapPanel.map.getProjectionObject());
                            this.mapPanel.map.zoomToExtent(bounds, true);
                        }
                        ,afterRender: function(c) {
                            c.getEl().dom.setAttribute('ext:qtip', 'Поиск геообъекта')
                        }
                        ,scope: this
                    }
                    ,actionTarget: {target: "paneltbar", index: 10}
                });
                tools.unshift(
                    {
                        xtype: "label",
                        text: "Поиск:",
                        style: "padding-right: 4px;"
                        ,listeners: {
                            afterRender: function(c) {
                                c.getEl().dom.setAttribute('ext:qtip', 'Поиск геообъекта')
                            }
                        }
                        ,actionTarget: {target: "paneltbar", index: 9}
                    }
                );


                
                
		tools.unshift('->');
		/*tools.unshift({
			text: 'Справка',
			tooltip: 'Справка', 
			enableToggle: true,
			id: 'helpWindowCheckButton', 
			checked: false
			//toggleHandler: menuOnCheckHelpWindow
		});*/
		
		tools.unshift({
			text: 'Вид',
			menu: new Ext.menu.Menu({
				items: [
					/*new Ext.menu.CheckItem({

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
					}),*/
                    
                                        new Ext.menu.CheckItem({
                                                text: 'Градусная сетка',
                                                checked: (this.tools.graticulegxptool && this.tools.graticulegxptool.activated),
                                                scope: this,
                                                handler: function() {
                                                    if(!this.tools.graticulegxptool){
                                                        try {
                                                            this.tools.graticulegxptool = Ext.ComponentMgr.createPlugin(
                                                                {
                                                                    "ptype": "gxp_graticulegxptool",
                                                                    "controlOptions":{
                                                                        //numPoints: 2, 
                                                                        labelled: true
                                                                        , displayInLayerSwitcher: false
                                                                        , labelSymbolizer: {fontSize: 10}
                                                                    },
                                                                    "outputTarget":"map",
                                                                    id: "graticulegxptool"
                                                                }, this.defaultToolType
                                                            );
                                                        } catch (err) {
                                                            throw new Error("Could not create tool plugin with ptype: " + this.initialConfig.tools[i].ptype);
                                                        }
                                                        this.tools.graticulegxptool.init(this);
                                                        
                                                    }else
                                                        this.tools.graticulegxptool.toggle();
                                                }
                                        }),
                                        this.overViewMapMenuCheck = new Ext.menu.CheckItem({
                                            text: 'Обзорная карта',
                                            checked: false,
                                            scope: this
                                            ,listeners: {
                                                checkchange: function(item, checked){
                                                    if(checked)
                                                        ovmWindow.show();
                                                    else
                                                        ovmWindow.hide();
                                                }
                                            }
                                        }),
                                        new Ext.menu.CheckItem({
                                                text: 'Информация RSS',
						checked: false,
                                                scope: this,
                                                handler: function() {
                                                    rssVar.show = rssVar.show ^ 1;
                                                }
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
                                                    this.geographMenuItem = new Ext.menu.CheckItem({

                                                            text: 'Географическая',
                                                            checked: app.map.projection === app.projectionStoreForMenu['Географическая'].projection,
                                                            handler: function() {
                                                                var callback = function(){
                                                                    window.location.reload(true);
                                                                }
                                                                app.changeProjection(app.projectionStoreForMenu['Географическая'], app, callback);
                                                            }
                                                    }),
                                                    this.conicalMenuItem = new Ext.menu.CheckItem({

                                                            text: 'Коническая',
                                                            checked: app.map.projection === app.projectionStoreForMenu['Коническая'].projection,
                                                            handler: function() {
                                                                var callback = function(){
                                                                    window.location.reload(true);
                                                                }
                                                                app.changeProjection(app.projectionStoreForMenu['Коническая'], app, callback);
                                                            }
                                                    }),
                                                    this.stereoMenuItem = new Ext.menu.CheckItem({

                                                            text: 'Полярная Север',
                                                            checked: app.map.projection === app.projectionStoreForMenu['Полярная Север'].projection,
                                                            handler: function() {
                                                                var callback = function(){
                                                                    window.location.reload(true);
                                                                }
                                                                app.changeProjection(app.projectionStoreForMenu['Полярная Север'], app, callback);
                                                            }
                                                    }),
                                                    this.southernMenuItem = new Ext.menu.CheckItem({
                                                            text: 'Полярная Юг',
                                                            checked: app.map.projection === app.projectionStoreForMenu['Полярная Юг'].projection,
                                                            handler: function() {
                                                                var callback = function(){
                                                                    window.location.reload(true);
                                                                }
                                                                app.changeProjection(app.projectionStoreForMenu['Полярная Юг'], app, callback);
                                                            }
                                                    })//kill me
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
						text: 'Добавить',
                                                handler: function(){
                                                    return app.tools.gxp_addlayers_ctl.showCapabilitiesGrid();
                                                }






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
						text: 'Новая',
                                                handler: function() {
                                                    window.location.hash = "#";
                                                    window.location.reload(true);
                                                }
					},
					{
						text: 'Сохранить',
                                                handler: function() {
                                                    app.save(app.showUrl);
                                                }
					},
					{
						text: 'Сохранить новую',
                                                handler: function() {
                                                    app.saveNew(app.showUrl);
                                                }
					},
					{
						text: 'Сохранить представление',
                                                handler: function() {
                                                    app.save(app.showEmbedWindow);
                                                }
					},
                                        "-",
                                        {
						text: 'Добавить слой',
                                                handler: function(){
                                                    return app.tools.gxp_addlayers_ctl.showCapabilitiesGrid();
                                                }





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
        Ext.get(iframe).on('load', function() {loading.hide();});
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
