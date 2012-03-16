/** * Copyright (c) 2009-2010 The Open Planning Project
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
                ,url: 'login'
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
                id: "composer_layertree",
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
                actionTarget: ["tree.tbar", "layertree.contextMenu"],
                featureManager: "featuremanager"
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
                ptype: "gxp_gridwmsgetfeatureinfo", toggleGroup: this.toggleGroup,
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
            },
            {
                ptype: "gxp_print",
                customParams: {outputFilename: 'map-print'},
                printService: config.printService,
                actionTarget: {target: "paneltbar", index: 40}
            }
            ,{
                ptype: "gxp_prickertool"
                ,actionTarget: "paneltbar"
                ,layers: [ "ru_hydrometcentre_42:ru_hydrometcentre_42_1",
                           "ru_hydrometcentre_42:ru_hydrometcentre_42_2",
                           "ru_hydrometcentre_42:ru_hydrometcentre_42_3",
                           "ru_hydrometcentre_42:ru_hydrometcentre_42_4",
                           "ru_hydrometcentre_42:ru_hydrometcentre_42_5",
                           "ru_hydrometcentre_42:ru_hydrometcentre_42_6",
                           "ru_hydrometcentre_42:ru_hydrometcentre_42_7",
                           "ru_hydrometcentre_42:ru_hydrometcentre_42_8",
                           "ru_hydrometcentre_42:ru_hydrometcentre_42_9",
                           "ru_hydrometcentre_42:ru_hydrometcentre_42_10",
                           "ru_hydrometcentre_42:ru_hydrometcentre_42_11" ]
                ,aliaseUrl: 'translate'
                ,getInfoUrl: '/resources/wms'
                ,saveChartUrl: '/save'
                ,actionTarget: {target: "paneltbar", index: 38}
                ,toggleGroup: this.toggleGroup
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
                maxFeatures: 100,
                paging: false,
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
                toolWinText: 'Редактирование',
                autoLoadFeature: true

            }
            ,{
                ptype: 'gispro_viewmenu'
                ,actionTarget: {target: "paneltbar", index:2}
                ,graticulOptions: {displayInLayerSwitcher: false}
                ,ovLayer: ["http://oceanviewer.ru/cache/service/wms", "eko_merge_v"]
            }
            ,{
                ptype: "gxp_queryform",
                featureManager: "featuremanager",
                featureGrid: "featureGrid",
                actionTarget: {target: "geoToolsQueryPanel"}
            }
            ,{
                ptype: "gxp_featuregrid",
                featureManager: "featuremanager",
                outputConfig: {
                    id: "featureGrid"
                },
                outputTarget: "featureGridWindow"
            }
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
                                                }
					},
					{
						text: 'Печать',
                                                handler: function() {
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

                //var MyWindowUi = Ext.create({
                    //xtype: 'window',
                    //height: 250,
                    //width: 400,
                    //title: 'My Window',
                    //items: [
                      //new gxp.QueryPanel
                    //]
                  //}
                //)

                //MyWindowUi.show()

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
       })

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
       }

       var embedMap = new gxp.EmbedMapDialog({
           id: 'geobuilder-1',
           url: "viewer" + "#maps/" + this.id
       })

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
       }

       new Ext.Window({
            layout: 'fit',
            width: 500, height: 300,
            title: this.exportMapText,
            items: [wizard]
       }).show();
    }, 

    // translation of fields and layer codes (fedd)
    translatedSymbols: {
        field: {},
        layer: {}
    },

    translateSymbols: function(symbolType, symbolCodes){
        var cached = this.translatedSymbols[symbolType];
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
    },

    // metadata of fields and of layer codes (fedd)
    metaData: {
        field: {},
        layer: {}
    },

    getMetaData: function(symbolType, symbolCodes){
//	console.log ('getMetaData : symbolType = ' + symbolType + ', symbolCodes = ' + symbolCodes);
        var cached = this.metaData[symbolType];
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


});
