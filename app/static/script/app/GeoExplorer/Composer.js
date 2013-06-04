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

    // Begin i18n
	saveMap: locale.composer.saveMap,	
	exportMapText: locale.composer.exportMapText,
	toolsTitle: locale.composer.toolsTitle,
	previewText: locale.composer.previewText,
	backText: locale.composer.backText,
	nextText: locale.composer.nextText,
	loginText: locale.composer.loginText,
	loginErrorText: locale.composer.loginErrorText,
	userFieldText: locale.composer.userFieldText,
	passwordFieldText: locale.composer.passwordFieldText,
	helpTip: locale.composer.helpTip,
    // End i18n.

    constructor: function(config) {
        

        var authUrl = ''
        ,authMethod = ''
        ,authParams = {}

        if( config.authWay == 'ov' ){

          authUrl = 'login'
          authMethod = 'POST'
          authParams =  {username: config.username, password: config.password}

        } else if ( config.authWay == 'josso' ){

          authUrl = config.proxy + encodeURIComponent( config.authUrl + 'usernamePasswordLogin.do?josso_cmd=login&josso_back_to=&josso_username='+config.username+'&josso_password='+config.password )
          authMethod = 'GET'
          config.jossoAuthUrl = config.authUrl + 'usernamePasswordLogin.do?josso_cmd=login&josso_back_to=&josso_username='+config.username+'&josso_password='+config.password

        }

        config.jossoInfoUrl = config.authUrl + 'info.do'

        if(config.authWay !== false){

          OpenLayers.Request[authMethod]({
            url: authUrl,
            data: OpenLayers.Util.getParameterString(authParams),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            callback: function(request){
              if(request.status == 200){




                this.authorizedRoles = ["ROLE_ADMINISTRATOR"];
                Ext4.Array.each(this.tools, function(tool) {
                    if (tool.needsAuthorization === true) {
                        tool.enable();
                    }
                })

              }else{

                this.authorizedRoles = [];
                Ext4.Array.each(this.tools, function(tool) {
                    if (tool.needsAuthorization === true) {
                        tool.disable();
                    }
                })

              }

              this.fireEvent('authorizationchange')

            },
            scope: this,
            proxy: config.proxy
          })

        } else {

          this.authorizedRoles = ["ROLE_ADMINISTRATOR"];

        }



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
            }
            /*{
                "ptype": "gxp_overviewgxptool",
                "controlOptions":{
                    maximized: true
                    ,
                    outsideViewport: true
                },
                "outputTarget":"map"
            },*/
            ,{
                ptype: "gxp_layertree",
                //id: "composer_layertree",
                groups: {editable: locale.composer.editable},
                outputConfig: {
                    id: "layertree"
                },
                outputTarget: "tree"
            }
            ,{
                ptype: "gxp_legend",
                outputTarget: 'legend',
                outputConfig: {autoScroll: true}
            }
			,{
                ptype: "gxp_rubricatortree",
                id: "gxp_rubricatortree_ctl",                
                outputTarget: "rubricatorTree"
            }
            ,{
                id: "gxp_addlayers_ctl",
                ptype: "gxp_addlayers",
                actionTarget: "tree.tbar",
                upload: true
            }
			,{
                id: "gxp_animationManager_ctl",
                ptype: "gxp_animationManager"                
            }
			,{
                id: "gxp_animationGrid_ctl",
                ptype: "gxp_animationGrid"                
            }
			,{
                id: "gxp_chartManager_ctl",
                ptype: "gxp_chartManager"                
            }
			,{
                id: "gxp_chartEditor_ctl",
                ptype: "gxp_chartEditor"                
            }
			,{
                id: "gxp_chartSource_ctl",
                ptype: "gxp_chartsource"                
            }			
            ,{
                id: "gxp_removelayer_ctl",
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
                id: "gxp_uploadplugin_ctl",
				ptype: "gxp_uploadplugin",
                actionTarget: ["tree.tbar"]
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
                ,layers: config.prickerLayers
                ,aliaseUrl: config.prickerAliaseUrl
                ,getInfoUrl: config.prickerGetInfoUrl
                ,saveChartUrl: config.prickerSaveChartUrl
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
                actionTarget: {target: "paneltbar", index:18}
            }
            ,{
                ptype: "gxp_logger",                
                actionTarget: {target: "paneltbar", index: 17}
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
                actionTarget: {target: "paneltbar", index:19},
                createFeatureActionTip: locale.composer.createFeatureActionTip,
                editFeatureActionTip: locale.composer.editFeatureActionTip,
                editFeatureActionText: locale.composer.editFeatureActionTip,
                createFeatureActionText: locale.composer.createFeatureActionText,
                bodyAttribute: 'message',
                usernameAttribute: 'author',
                featureManagerToolText: locale.composer.featureManagerToolText,
                featureManagerToolTip: locale.composer.featureManagerToolTip,
                toolWinText: locale.composer.toolWinText,
                autoLoadFeature: true

            }
            ,'-'
            //,{
                //ptype: "gispro_josso_username",
                //actionTarget: {target: "paneltbar", index: 20}
            //}
            ,{
                ptype: "gispro_upload",
                actionTarget: {target: "layertree.contextMenu", index: 5},
                featureManager: "featuremanager"
            }
            /*,{
                ptype: "gispro_josso_login",
                actionTarget: {target: "paneltbar", index:2},
                jossoLoginUrl: config.jossoLoginUrl,
                jossoOutUrl: config.jossoOutUrl
            }*/
            ,{
                ptype: 'gispro_viewmenu'
                ,actionTarget: {target: "paneltbar", index:2}
                ,graticulOptions: {displayInLayerSwitcher: false}
                ,ovLayer: config.ovLayer
            }
            ,{
                ptype: "gxp_queryform",
                featureManager: "featuremanager",
                featureGrid: "featureGrid",
                //TODO toggleGroup: this.toggleGroup,
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
                            c.getEl().dom.setAttribute('ext:qtip', locale.composer.geocode)
                        }
                        ,scope: this
                    }
                    ,actionTarget: {target: "paneltbar", index: 10}
                });
                tools.unshift(
                    {
                        xtype: "label",
                        text: locale.composer.search+":",
                        style: "padding-right: 4px;"
                        ,listeners: {
                            afterRender: function(c) {
                                c.getEl().dom.setAttribute('ext:qtip', locale.composer.geocode)
                            }
                        }
                        ,actionTarget: {target: "paneltbar", index: 9}
                    }
                );
				tools.unshift(
                    {
						xtype: 'tbspacer',
						width: 5
						,actionTarget: {target: "paneltbar", index: 8}
					}
					
                );
	
	
	
	var wait =  new Ext.BoxComponent({
				id : 'waitIndicator',
				autoEl: {
					tag: 'img', 
					src: OVROOT+'theme/app/img/silk/loading.gif',					
				},
				scope: this,
				actionTarget: {target: "paneltbar", index: 7}
			});

    tools.unshift(wait);	



    var aboutButton = new Ext.Button({
        tooltip: this.helpTip,
        iconCls: "icon-about",
        id: "helpButton",
        //handler: this.displayAppInfo,
        scope: this
    });

    tools.unshift("->");
    tools.unshift(aboutButton);
	
	

		tools.unshift('->');

		tools.unshift({
			text: locale.composer.layer,
			menu: new Ext.menu.Menu({
				items: [
					{
						text: locale.composer.addLayer,
                                                handler: function(){
                                                    return app.tools.gxp_addlayers_ctl.showCapabilitiesGrid();
                                                }
					},
					{
						text: locale.composer.removeLayer,
                                                handler: function(a,b,c){
                                                    app.tools.gxp_removelayer_ctl.tryRemoveCurrent();
                                                }
					},
					{
						text: locale.composer.upload,
                                                handler: function(){
                                                    app.tools.gxp_uploadplugin_ctl.showImporterWindow();
                                                }
					},
					{
						text: locale.composer.editStyle,
                                                handler: function(){                                                    
													if (!Ext.getCmp("layerStyleButton").disabled) {
														Ext.getCmp("layerStyleButton").handler.call(Ext.getCmp("layerStyleButton").scope);
													}else {
														Ext.Msg.alert(locale.composer.warning,locale.composer.styleReadOnlyError);
													}
                                                }
					},
					{
						text: locale.composer.layerProperties,
                                                handler: function(){
                                                    if (!Ext.getCmp("layerPropertiesButton").disabled){
														Ext.getCmp("layerPropertiesButton").handler.call(Ext.getCmp("layerPropertiesButton").scope);}
													else {
														Ext.Msg.alert(locale.composer.warning,locale.composer.propertiesUnavailableError);
													}
                                                }
					}
					
				]
			})
		});

		tools.unshift({
			text: locale.composer.map,
                        //bububu: this,
			menu: new Ext.menu.Menu({
				items: [
					{
						text: locale.composer.newMap,
                                                handler: function() {
                                                    window.location.hash = "#";
                                                    window.location.reload(true);
                                                }
					},
					{
						text: locale.composer.saveMap,
                                                handler: function() {
                                                    app.save(app.showUrl);
                                                }
					},
					{
						text: locale.composer.saveNewMap,
                                                handler: function() {
                                                    app.saveNew(app.showUrl);
                                                }
					},
					{
						text: locale.composer.saveView,
                                                handler: function() {
                                                  app.save(app.showEmbedWindow);
                                                }
					},
                                        "-",
					{
						text: locale.composer.print,
                                                handler: function() {
													Ext.getCmp("printMapButton").handler.call(Ext.getCmp("printMapButton").scope);
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
            width: 500,
            height: 300,
            title: this.exportMapText,
            items: [wizard]
       }).show();
    }
});
