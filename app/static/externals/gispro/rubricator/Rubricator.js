/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = RubricatorTree
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: RubricatorTree(config)
 *
 *    Plugin for adding a tree of layers to a :class:`gxp.Viewer`. Also
 *    provides a context menu on layer nodes.
 */   
gxp.plugins.RubricatorTree = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_rubricatortree */
    ptype: "gxp_rubricatortree",

    /** api: config[rootNodeText]
     *  ``String``
     *  Text for root node of layer tree (i18n).
     */
    rootNodeText: "Layers",

    /** api: config[overlayNodeText]
     *  ``String``
     *  Text for overlay node of layer tree (i18n).
     */
    overlayNodeText: "Overlays",

    /** api: config[baseNodeText]
     *  ``String``
     *  Text for baselayer node of layer tree (i18n).
     */
    baseNodeText: "Base Layers",
	
	capabilitiesURL: "",
    
    /** api: config[groups]
     *  ``Object`` The groups to show in the layer tree. Keys are group names,
     *  and values are either group titles or an object with ``title`` and
     *  ``exclusive`` properties. ``exclusive`` means that nodes will have
     *  radio buttons instead of checkboxes, so only one layer of the group can
     *  be active at a time. Optional, the default is
     *
     *  .. code-block:: javascript
     *
     *      groups: {
     *          "default": "Overlays", // title can be overridden with overlayNodeText
     *          "background": {
     *              title: "Base Layers", // can be overridden with baseNodeText
     *              exclusive: true
     *          }
     *      }
     */
    groups: null,
    
    /** api: config[defaultGroup]
     *  ``String`` The name of the default group, i.e. the group that will be
     *  used when none is specified. Defaults to ``default``.
     */
    defaultGroup: "default",
	
	errorTitle: "Error",
	
	proxyException: "Can not add this layer. Check resource configuration and proxy settings",

    denyDefaultTree: false,
	
	title: "Rubrics",
    
    /** private: method[constructor]
     *  :arg config: ``Object``
     */
    constructor: function(config) {
        gxp.plugins.RubricatorTree.superclass.constructor.apply(this, arguments);
        /*if (!this.denyDefaultTree) {
            var groups = {}

            groups["default"] = this.overlayNodeText
            groups["background"] = { title: this.baseNodeText, exclusive: true }

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Added by gispro (before me)
            this.groups["animation"] = {
              title : animationNodeTitle //
            }
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

            //Add groups from config to the end of layer list
            for(k in this.groups){
              groups[k] = this.groups[k]
            }
            this.groups = groups
        }*/
    },

    showProjectionError: function(node,record,projection){
      var icoEl = node.ui.getEl()
      if(!record.get('srs') || record.get('srs')[projection]){
        node.attributes.iconCls = node.attributes.correctProjectionIconCls
        if( icoEl ) icoEl.firstChild.getElementsByClassName('x-tree-node-icon')[0].setAttribute('class','x-tree-node-icon ' + node.attributes.correctProjectionIconCls)
        node.enable()
      }else{
        node.attributes.iconCls = 'gxp-tree-projectionerror-icon'
        if( icoEl ) icoEl.firstChild.getElementsByClassName('x-tree-node-icon')[0].setAttribute('class','x-tree-node-icon gxp-tree-projectionerror-icon')
        if(record.get('isHardProjection')) node.disable()
      }
    },

    
    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
		
		var addChildren = function(node,jsonNode) {
			for (var i = 0; i<jsonNode.children.length;i++) {			
				var n;				
				var getStore = function(jsonNode){
					var store = new Ext.data.Store();//app.mapPanel.layers.constructor();
					if (jsonNode) {
						
						
								
						for (var i=0; i<jsonNode.children.length;i++) {
					
							if (jsonNode.children[i].islayer=="1") {

								var rec = new GeoExt.data.LayerRecord({
									title: jsonNode.children[i].nodename, 
									layerStore: app.mapPanel.layers,
									properties: "gxp_wmslayerpanel",
									resource: jsonNode.children[i].workspace,
									id: 'rubricatorLayer'+jsonNode.children[i].nodeid,
									layer : jsonNode.children[i].servicetype=="wms" ? 
											new OpenLayers.Layer.WMS( 
												jsonNode.children[i].nodename, 
												jsonNode.children[i].serverpath+"/"+jsonNode.children[i].workspace+"/wms", 
												{layers: jsonNode.children[i].layername, transparent: true, styles:jsonNode.children[i].stylename},
												{singleTile: true, jsonNode:jsonNode.children[i]}										
											) 
										:
											new OpenLayers.Layer.GeoRSS( 
												jsonNode.children[i].nodename, 
												jsonNode.children[i].serverpath,
												{jsonNode: jsonNode.children[i]}												
											)
								});
								store.add(rec);
							}
							
						}	
					}
					return store;
				};
				
				var containsLayers = function(jsonNode){
					if ((jsonNode)&&(jsonNode.children))
					for (var i=0; i<jsonNode.children.length; i++){
						if (jsonNode.children[i].islayer=="1") return true;
					}
				};
				
				var preparedStore = getStore (jsonNode.children[i]);
				
				//if ((jsonNode.children[i].islayer!="1")&&(jsonNode.children[i].children.length>0)&&(containsLayers(jsonNode.children[i]))) {
				if ((jsonNode.children[i].islayer!="1")&&(jsonNode.children[i].children.length>0)&&(jsonNode.children[i].children[0].islayer=="1")) {
				//if (jsonNode.children[i].isservice=="1") {
					var descrLayer = function(server,layername) {
						var format = new OpenLayers.Format.WMSCapabilities({
							version: "1.1.1"
						});
						var caplayers = [];
						OpenLayers.Request.GET({
							url: server+"?request=getCapabilities",
							async: false,
							params: {
								SERVICE: "WMS",
								VERSION: "1.1.1",
								REQUEST: "GetCapabilities"
							},
							success: function(request) {
								var doc = request.responseXML;
								if (!doc || !doc.documentElement) {
									doc = request.responseText;
								}
								var capabilities = format.read(doc);         
								caplayers.concat(capabilities.capability.layers);																		
							}, 
							failure: function(e) {            
								console.log ("GetCapabilities error:"+e.status);
							}
						});

						
						if (!caplayers) return;
						for (var i=0; i<caplayers.length; i++) {
							if (caplayers[i].name==layername) return caplayers[i];
						}
					};

					n = new GeoExt.tree.LayerContainer({
						text: jsonNode.children[i].nodename,
						group: jsonNode.children[i].nodeid,
						jsonNode: jsonNode.children[i],
						iconCls: jsonNode.children[i].isservice=="1" ? "gxp-isservice" : jsonNode.children[i].islayer=="1" ? "gxp-islayer" : "gxp-folder",
						expanded: false,
						singleClickExpand: true,
						allowDrag: false,
						applyLoader: false,
						layerStore: null,
						isTarget: false,
						id: 'rubricatorLayer'+jsonNode.children[i].nodeid,
						listeners: {
						},
						loader: new GeoExt.tree.LayerLoader({							
							store: preparedStore,
							filter: function(layer) {
								//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
								if (layer)
								{
									//return layer.isChildNode();
									return true;
								}else
								   return false;
								//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
							},
							addLayerNode: function(node, layerRecord, index) {
								//app.mapPanel.layers.add(layerRecord);
								layerRecord.getLayer().setVisibility(false);
								index = index || 0;
								var child = this.createNode({
									//nodeType: 'gx_layer',
									layer: layerRecord.getLayer(),
									iconCls: layerRecord.get('layer').jsonNode.servicetype=="wms" ? "gxp-islayer" 
											 : layerRecord.get('layer').jsonNode.servicetype=="rss" ? "gxp-feed"
											 : layerRecord.get('layer').jsonNode.servicetype=="animation" ? "gxp-control" : "gxp-islayer" , // else: default. may be different
									id: layerRecord.get('id'),
									checked: false,
									listeners: {
										'checkchange' :  function(node, checked){																		
												if (checked) {
													// TRUE
													 var conf = {url: (node.attributes.layer.jsonNode.serverpath+"/"+node.attributes.layer.jsonNode.servicepath).replace("//","/"), 
																 restUrl: (node.attributes.layer.jsonNode.serverpath+"/rest").replace("//","/")};
													//var conf = {url: "http://oceanviewer.ru/resources/ru_hydrometcentre_42/wms", restUrl: "http://oceanviewer.ru/resources/rest"};													
													conf.title = node.parentNode.attributes.jsonNode.nodename;
													
													if (!app.layerSources[node.attributes.layer.jsonNode.resourceid]) {
														
														if (!Ext.getCmp('rubricatorTree').loadMask)
															Ext.getCmp('rubricatorTree').loadMask = new Ext.LoadMask(Ext.getCmp('rubricatorTree').getEl(), {msg:gxp.plugins.RubricatorTree.prototype.resourceLoadMask});
														Ext.getCmp('rubricatorTree').loadMask.show();
														app.addLayerSource({                
															id : node.attributes.layer.jsonNode.resourceid,
															config: conf, // assumes default of gx_wmssource
															callback: function(id) {															
																var addLayersPlugin = app.tools.gxp_addlayers_ctl;
																// TRUE
																 var name = node.attributes.layer.jsonNode.layername;
																 var ws = node.attributes.layer.jsonNode.workspace;
																//var name = "ru_hydrometcentre_42_1";
																var records = [];
																node.attributes.storeId = id;
																app.layerSources[id].store.each(function(record, index) {
																	if (record.get("name") == ws+":"+name) {
																		last = index;
																		records.push(record);
																	}
																});
																if (records.length==0) {
																	Ext.Msg.alert(gxp.plugins.RubricatorTree.prototype.errorTitle, gxp.plugins.RubricatorTree.prototype.noRecordsFound);
																	node.ui.checkbox.checked = false;
																}
																addLayersPlugin.addLayers(records,app.layerSources[id],false);															
																Ext.getCmp('rubricatorTree').loadMask.hide();
															},
															fallback: function(source, msg) {
																Ext.Msg.alert(gxp.plugins.RubricatorTree.prototype.errorTitle, gxp.plugins.RubricatorTree.prototype.proxyException);
																node.ui.checkbox.checked = false;
																Ext.getCmp('rubricatorTree').loadMask.hide();
															},
															scope: this
														});
													} else {
														
														var id = node.attributes.layer.jsonNode.resourceid;
														var addLayersPlugin = app.tools.gxp_addlayers_ctl;
														// TRUE
														var name = node.attributes.layer.jsonNode.layername;
														 var ws = node.attributes.layer.jsonNode.workspace;
														//var name = "ru_hydrometcentre_42_1";
														var records = [];
														node.attributes.storeId = id;
														app.layerSources[id].store.each(function(record, index) {
															if (record.get("name") == ws+":"+name) {
																last = index;
																records.push(record);
															}
														});
														if (records.length==0) {
															Ext.Msg.alert(gxp.plugins.RubricatorTree.prototype.errorTitle, gxp.plugins.RubricatorTree.prototype.noRecordsFound);
															node.ui.checkbox.checked = false;
														}
														else 
															addLayersPlugin.addLayers(records,app.layerSources[id],false);
													}
																																	
												}
												else 
													app.mapPanel.layers.data.each(function(record, index) {
														// TRUE
														if (record.get("name") == node.attributes.layer.jsonNode.workspace+":"+node.attributes.layer.jsonNode.layername) {
														//if (record.get("name") == "ru_hydrometcentre_42_1") {
															last = index;
															//app.mapPanel.layers.remove(record);
															app.mapPanel.map.removeLayer(record.get('layer'), false);
														}
													});
										}
									},
								});
								var sibling = node.item(index);
								if(sibling) {
									node.insertBefore(child, sibling);
								} else {
									node.appendChild(child);
								}
								//app.mapPanel.layers.remove(layerRecord);
							}
						}),
					});
				} else {	
					if (jsonNode.children[i].servicetype!='animation'){
						n = new Ext.tree.TreeNode({
							text: jsonNode.children[i].nodename,
							iconCls: jsonNode.children[i].isservice=="1" ? "gxp-isservice" : jsonNode.children[i].islayer=="1" ? 
													layerRecord.get('layer').jsonNode.servicetype=="wms" ? "gxp-islayer" 
												 : layerRecord.get('layer').jsonNode.servicetype=="rss" ? "gxp-feed"
												 : layerRecord.get('layer').jsonNode.servicetype=="animation" ? "gxp-control" : "gxp-islayer" 
									: "gxp-folder",
							expanded: false,
							singleClickExpand: true,
							isTarget: false,
							id: 'rubricatorLayer'+jsonNode.children[i].nodeid,
							jsonNode: jsonNode.children[i]
						});
						addChildren(n,jsonNode.children[i]);
					}
				}
				
				if (jsonNode.children[i].servicetype!='animation') node.appendChild(n);
			}	
		}
		
		var treeRoot = new Ext.tree.TreeNode({
            text: this.title,
            expanded: true,
            isTarget: true,
			id: 'rubricatorLayerRoot',
            allowDrop: false
        });
	
	
		var layers;
	
		OpenLayers.Request.issue({
			method: "GET",
			url: "maps",
			async: true,
			params:{
				action: "getLayers"
			},
			callback: function(request) 
			{					
				//try {
					layers = JSON.parse(request.responseText);
					if (!layers) return;
					addChildren(treeRoot, layers);
				/*}
				catch(e) {
					console.log(e.toString());
				}*/
			}	 				
		});
	 

	
        config = Ext.apply({
            xtype: "treepanel",
			cls: 'customTree',
            root: treeRoot,
            rootVisible: true,
            border: false,
            enableDD: true,
            selModel: new Ext.tree.DefaultSelectionModel({               
            }),
            listeners: {
                contextmenu: function(node, e) {
                    //f(node && node.layer) {
                        if (node.isRoot) return;
						node.select();
                        var tree = node.getOwnerTree();
                        if (tree.getSelectionModel().getSelectedNode() === node) {
                            var c = tree.contextMenu;
                            c.contextNode = node;
                            c.items.getCount() > 0 && c.showAt(e.getXY());							
                        }
                   // }
                },
                beforemovenode: function(tree, node, oldParent, newParent, i) {
                    // change the group when moving to a new container
                    if(oldParent !== newParent) {
                        var store = newParent.loader.store;
                        var index = store.findBy(function(r) {
                            return r.getLayer() === node.layer;
                        });
                        var record = store.getAt(index);
                        record.set("group", newParent.attributes.group);
                    }
                },                
                scope: this
            },
            contextMenu: new Ext.menu.Menu({
                items: [
					{
						text: gxp.plugins.RubricatorTree.prototype.metadata,
						handler: function(e) {
							var rec = e.ownerCt.contextNode.layer ? e.ownerCt.contextNode.layer.jsonNode: e.ownerCt.contextNode.attributes.jsonNode;
							var w = new Ext.Window({
								title: gxp.plugins.RubricatorTree.prototype.metadata,
								width: 500,								
								heigth: 600,
								resizable: false,
								id: 'rubricatorMetadataWindow'+(new Date()).getTime(),
								items: [
									{
										xtype: 'tabpanel',
										id: 'rubricatorMetadataWindowTabpanel',
										activeTab: 0,
										items: [
											{
												title: gxp.plugins.RubricatorTree.prototype.geoserviceMetadata,
												id: 'geoserviceMetadata',
												defaults: {
													border: false
												},
												items: [{
													layout: "form",
													width: "99%",
													style: {"padding": "5px"},
													labelWidth: 150,
													items: [													
														{
															xtype: "textfield",
															fieldLabel: gxp.plugins.RubricatorTree.prototype.nodeid,
															anchor: "99%",
															value: rec.nodeid || gxp.plugins.RubricatorTree.prototype.defaultValue,
															readOnly: true
														},{
															xtype: "textfield",
															fieldLabel: gxp.plugins.RubricatorTree.prototype.nodename,
															anchor: "99%",
															value: rec.nodename|| gxp.plugins.RubricatorTree.prototype.defaultValue,
															readOnly: true
														},{
															xtype: "textfield",
															fieldLabel: gxp.plugins.RubricatorTree.prototype.layername,
															anchor: "99%",
															value: rec.layername|| gxp.plugins.RubricatorTree.prototype.defaultValue,
															readOnly: true
														},{
															xtype: "textfield",
															fieldLabel: gxp.plugins.RubricatorTree.prototype.resourceid,
															anchor: "99%",
															value: rec.resourceid|| gxp.plugins.RubricatorTree.prototype.defaultValue,
															readOnly: true
														},{
															xtype: "textfield",
															fieldLabel: gxp.plugins.RubricatorTree.prototype.workspace,
															anchor: "99%",
															value: rec.workspace|| gxp.plugins.RubricatorTree.prototype.defaultValue,
															readOnly: true
														},{
															xtype: "textfield",
															fieldLabel: gxp.plugins.RubricatorTree.prototype.parentnode,
															anchor: "99%",
															value: rec.parentnode|| gxp.plugins.RubricatorTree.prototype.defaultValue,
															readOnly: true
														},{
															xtype: "textfield",
															fieldLabel: gxp.plugins.RubricatorTree.prototype.serverpath,
															anchor: "99%",
															value: rec.serverpath|| gxp.plugins.RubricatorTree.prototype.defaultValue,
															readOnly: true
														},{
															xtype: "textfield",
															fieldLabel: gxp.plugins.RubricatorTree.prototype.servicepath,
															anchor: "99%",
															value: rec.servicepath|| gxp.plugins.RubricatorTree.prototype.defaultValue,
															readOnly: true
														},{
															xtype: "textfield",
															fieldLabel: gxp.plugins.RubricatorTree.prototype.servicetype,
															anchor: "99%",
															value: rec.servicetype|| gxp.plugins.RubricatorTree.prototype.defaultValue,
															readOnly: true
														},{
															xtype: "textfield",
															fieldLabel: gxp.plugins.RubricatorTree.prototype.stylename,
															anchor: "99%",
															value: rec.stylename|| gxp.plugins.RubricatorTree.prototype.defaultValue,
															readOnly: true
														},
													]
												}]
											},
											{
												title: gxp.plugins.RubricatorTree.prototype.resourceMetadata,
												id: 'resourceMetadata',
												defaults: {
													border: false
												},
												items: [{
													xtype: 'panel',
													style: {"padding": "5px"},
													autoWidth: true,
													html: "<iframe width=\"100%\" height=\"300\" src=\"http://www.esimo.ru/srbd_data/resource?id="+rec.workspace+"\"/>"
												 }]												
											},
										]
									}
								]
							});
							w.show();
						}
					}
				]
            })
        }, config || {});

        var rubricatorTree = gxp.plugins.RubricatorTree.superclass.addOutput.call(this, config);

        return rubricatorTree;
    }
});

Ext.preg(gxp.plugins.RubricatorTree.prototype.ptype, gxp.plugins.RubricatorTree);
