var animationNodeTitle = 'Анимация';

var animLayers         = []        ;
var animServices       = []        ;
var selectedNode       = null      ; 
var wmsMaxResolution   = 1.4054492187499998;

var animWindow;
var	slider    ;
var maxAnimeOpacity = .71;

var TIMER_INTERVAL        = 25     ;
var TEMPL_LAYER_ANIMATION = 'Scale';
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var servicesLoader = new Ext.data.JsonStore({ 
	url       : 'services.json',
	root      : 'services',
	fields    : ['url', 'title', 'x_axis', 'layers'],
	listeners :
    {
   		load : function()
   		{
			parseServices();
   		},
		loadexception : function(o, arg, nul, e)
		{
			alert("servicesLoader.listeners - LoadException : " + e);         
		} 
	}  
});
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function parseServices()
{
	animLayers = new Array(servicesLoader.getRange().length);
	for (var row = 0; row < servicesLoader.getRange().length; row++)
	{
   		var x_axis = servicesLoader.getAt(row).get('x_axis');
 		var object = servicesLoader.getAt(row).get('layers');
		var service = {title  : servicesLoader.getAt(row).get('title'),
		               url    : servicesLoader.getAt(row).get('url'  ),
					   names  : new Array(object.length),
					   layers : new Array(object.length),
					   scale  : new Array(object.length)};
 		for (items = 0; items < object.length; items++)
		{
			service.scale  [items] = x_axis[items];
			service.names  [items] = object[items];
			service.layers [items] = null;
		}
		animServices.push (service)
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function showAnimWindow(rootNode, selectedNode)
{ 
	if (animWindow)
		console.log ('animation.showAnimWindow : animWindow.animWinClosed = ' + animWindow.animWinClosed + ', animWindow = ' + animWindow);
//	if (!animWindow || animWindow.animWinClosed)
	if (!animWindow)
	{
		slider = new Ext.Slider({
			name         : 'slider',
			id           : 'slider',
			width        : 200,
			minValue     : 0,
			maxValue     : 100.0,
			maxValue     : 100,
			x            : 65,
			y            : 6,
			scale_length : 100/10,
			listeners    : 
			{
				change: function(el, value)
				{
					if (!timer.isRunning())
						timer.setTimeInSeconds(value, TIMER_INTERVAL);

                                        
                                        // affected layers:
                                        var layerUnit = this.maxValue / (animLayers.length-1);
                                        var halfLayerUnit = layerUnit / 2.0;
                                        var curLayer = Math.floor(value/layerUnit);
                                        var transition = value - curLayer*layerUnit;
                                        var nextLayerOpacity = (transition >= halfLayerUnit ? 
                                            maxAnimeOpacity - (0.3 * ((layerUnit - transition) / halfLayerUnit )) : 
                                            ((maxAnimeOpacity*0.7) * (transition / halfLayerUnit ) )
                                        );
                                        
                                        //var nextLayerOpacity = maxAnimeOpacity * ((Math.pow(layerUnit - transition, 2) * -1.1) + 1);
                                        //var thisLayerOpacity = maxAnimeOpacity * ((Math.pow(transition, 2) * -1.1) + 1);
                                        
                                        
                                        var thisLayerOpacity = (transition < halfLayerUnit ? 
                                            maxAnimeOpacity - (0.3 * (transition / halfLayerUnit ) ): 
                                            ((maxAnimeOpacity*0.7) * ((layerUnit - transition) / halfLayerUnit ) )
                                        );
                                        
					for (var i = 0; i < animLayers.length; i++){
						if (i < curLayer)
						{
							if (animLayers[i] != null)
								animLayers[i].setOpacity (0);
						} else if (i == curLayer)
						{
							if (animLayers[i] != null)
								animLayers[i].setOpacity (thisLayerOpacity);
						} else if (i == (curLayer + 1))
						{
							if (animLayers[i] != null)
								animLayers[i].setOpacity (nextLayerOpacity);
						} else if (i > (curLayer + 1))
						{
							if (animLayers[i] != null)
								animLayers[i].setOpacity (0);
						}
                                        }
                                        
/*
					var n = Math.floor (value / this.scale_length); 
					for (var i = 0; i < animLayers.length; i++)
					{
						if (i < n)
						{
							if (animLayers[i] != null)
								animLayers[i].setOpacity (0);
						} else if (i == n)
						{
							if (animLayers[i] != null)
								animLayers[i].setOpacity ((this.scale_length * (i + 1)- value) / this.scale_length);
						} else if (i == (n + 1))
						{
							if (animLayers[i] != null)
								animLayers[i].setOpacity ((value - (this.scale_length * (i - 1))) / this.scale_length);
						} else if (i >= (n + 2))
						{
							if (animLayers[i] != null)
								animLayers[i].setOpacity (0);
						}
					}
*/
				}
			}
		});
		

		btnReset = new Ext.Button({
			scale    : 'small', 
			cls      : 'x-btn-icon',
			icon     : 'script/images/stop.png',
			x        : 5,
			y        : 10,
			handler  : function (b,e)
			{
				if (!timer.isRunning())
					reset();
			}
		});
		btnPlay = new Ext.Button({
			scale    : 'small', 
			cls      : 'x-btn-icon',
			icon     : 'script/images/play.png',
			x        : 30,
			y        : 10,
			handler  : function (b,e)
			{
				if (!timer.isRunning())
					runAnimation();
				else
					stopAnimation();
			}
		});
		animWindow = new Ext.Window(
		{
			title         : animationNodeTitle, 
			layout        : 'absolute',
			width         : 430,
			height        : 90,
			plain         : true,
			modal         : false,
			border        : true,
//			resizable     : false,
            collapsible   : true,
			root          : rootNode,
			node          : selectedNode,
			animWinClosed : true,
            listeners     :
			{
				close:function()
				{ 
					animWindowHide(this.root, this.node);
                },
				hide:function()
				{ 
					animWindowHide(this.root, this.node);
                },
				beforeshow : function ()
				{
					if (this.animWinClosed)
					{
						idx = getScenarioIDX (rootNode, selectedNode);
						if (animServices[idx].scale)
						{
							slider.scale_length = 100 / (animServices[idx].scale.length - 1);
							drawSliderTicks(slider, 'slider', animServices[idx].scale.length);
							drawSliderScale(slider, 'slider', animServices[idx].scale);
						} else
                                   // Сервисы для анимации не загружены
							alert ('\u0421\u0435\u0440\u0432\u0438\u0441\u044B\u0020\u0434\u043B\u044F\u0020\u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0438\u0020\u043D\u0435\u0020\u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B');
						if (idx >= 0)
							addLayers(idx);	
					}
					this.animWinClosed = false;
				},
				bodyresize : function (p, w, h)
				{
					slider.width = w - slider.x - 10;
					this.doLayout;
				}
			},
			items : [btnReset, btnPlay, slider]
		});
	} else
		animWindow.node = selectedNode; 

	animWindow.setPosition(5, 580, null);
	animWindow.show();
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function animWindowHide(rootNode, node)
{
	animWindow.animWinClosed = false;
	resetSelectedNode (rootNode, node);
	closeAnimWindow();
	animWindow = false;
	animWindow.animWinClosed = true;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getScenarioIDX (rootNode, selectedNode)
{
	node = getRootChildNode(rootNode, animationNodeTitle);
	if (node != null)
	{
		for (i = 0; i < node.childNodes.length; i++)
		{
			if (node.childNodes[i].text === selectedNode.text)
				return i;
		}
	}
	return -1;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function closeAnimWindow()
{
	if (!animWindow)
		animWindow = false;

	if (animLayers [0] != null)
	{
		reset();
		animLayers [0].setOpacity(0);
	}		

	for (var i = (app.mapPanel.map.layers.length - 1); i >= 0; i--)
	{
		if (app.mapPanel.map.layers[i].name.indexOf (TEMPL_LAYER_ANIMATION) > 0)
			app.mapPanel.map.layers.remove (app.mapPanel.map.layers[i]);
	}
	for (var i = (app.mapPanel.layers.data.items.length - 1); i >= 0; i--)
	{
		if (app.mapPanel.layers.data.items[i].data.title.indexOf (TEMPL_LAYER_ANIMATION) > 0)
			app.mapPanel.layers.data.items.remove (app.mapPanel.layers.data.items[i]);
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getRootChildNode (rootNode, node_name)
{
	for (i = 0; i < rootNode.childNodes.length; i++)
	{
		if (rootNode.childNodes[i].text === node_name)
			return rootNode.childNodes[i];
	}
	return null;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function timerRunCB ()
{
	slider.setValue (slider.getValue() + 1); 
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function runAnimation()
{
	if (slider.getValue() === 0)
		timer.init (TIMER_INTERVAL);
 	timer.setRunCallBack (timerRunCB   );
 	timer.setEndCallBack (stopAnimation);
 	timer.start();
   	btnPlay.setIcon('script/images/pause.png');
   	slider.disable (true);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function stopAnimation()
{
	timer .stop();
 	slider.enable (true);
	btnPlay.setIcon('script/images/play.png');
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function reset()
{
	for (var j = 0; j < animLayers.length; j++)
	{
		if (animLayers [j] != null)
		{
			if (j > 0)
				animLayers [j].setOpacity(0);
			else
				animLayers [j].setOpacity(maxAnimeOpacity);

		}
	}
	slider.setValue(0);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getMapLayer (layerName)
{
	for (var i=0, ii = app.mapPanel.map.layers.length; i<ii; ++i)
	{
		if (app.mapPanel.map.layers[i].name === layerName)
		{
		    var record = app.mapPanel.map.layers[i].layerRecord;
			return app.mapPanel.map.layers[i];
		}
	}
	return null;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function createWMSLayer(url, names, scale, items, idx)
{
	var name = " " + TEMPL_LAYER_ANIMATION + " " + idx + ".";
	name = name + scale [items];

	var wms = new OpenLayers.Layer.WMS (name, url,
            {
				layers        : names [items],
				srs           : new OpenLayers.Projection('EPSG:900913'),
				format        : 'image/gif',
				tiled         : 'true',
				minZoomLevel  : 4,
				maxZoomLevel  : 17,
				maxResolution : wmsMaxResolution,
				transparent   : 'true'
            },
            {
        	   	singleTile    : 'true',
                buffer        : 0,
           	   	ratio         : 1,
                isBaseLayer   : false,
                displayOutsideMaxExtent: 'true'
            });
	return wms;
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function addLayers(idx)
{
	for (items = animServices[idx].names.length - 1; items >= 0; items--)
	{
	    animServices[idx].layers[items] = createWMSLayer(animServices[idx].url  ,
                                                         animServices[idx].names,
		                                                 animServices[idx].scale, items, idx);
		if (items > 0)
			animServices[idx].layers[items].setOpacity (0);
		else
			animServices[idx].layers[items].setOpacity (1);
		app.mapPanel.map.addLayer(animServices[idx].layers[items]);
	}
	for (var j = 0; j < animLayers.length; j++)
		animLayers [j] = null;

	for (items = animServices[idx].names.length - 1; items >= 0; items--)
	{
		var layer = getMapLayer (animServices[idx].layers[items].name); 
		if (layer != null)
			animLayers [items] = layer;
	}
	reset();
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function resetSelectedNode (rootNode, selectedNode)
{
	node = getRootChildNode(rootNode, animationNodeTitle);
	if (selectedNode != null)
	{
		if ((node != null) && (node.childNodes != null))
		{
			for (i = 0; i < node.childNodes.length; i++)
			{
				if (node.childNodes[i].text == selectedNode.text)
				{
					selectedNode.getUI().toggleCheck(false); 
					break;
				}
			}
		}
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// extend GeoExt.LegendPanel.addLegend
function animationAddLegend(record, index)
 {
	if (record.getLayer().name.indexOf(TEMPL_LAYER_ANIMATION) === -1)
	{
		if (this.filter(record) === true)
		{
			var layer = record.getLayer();
			index = index || 0;
			var legend;
			var types = GeoExt.LayerLegend.getTypes(record, this.preferredTypes);
			if(layer.displayInLayerSwitcher && !record.get('hideInLegend') && types.length > 0)
			{
				this.insert(index, {
						xtype: types[0],
						id: this.getIdForLayer(layer),
						layerRecord: record,
						hidden: !((!layer.map && layer.visibility) || (layer.getVisibility() && layer.calculateInRange()))
				});
			}
		}
	}
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// extend GeoExt.tree.LayerNode.render
function animationRender(bulkRender)
{
	var layer = this.layer instanceof OpenLayers.Layer && this.layer;
	if (layer.name.indexOf (TEMPL_LAYER_ANIMATION) === -1)
	{
		if(!layer)
		{
			// guess the store if not provided
			if(!this.layerStore || this.layerStore == "auto") {
				this.layerStore = GeoExt.MapPanel.guess().layers;
			}
			// now we try to find the layer by its name in the layer store
			var i = this.layerStore.findBy(function(o) {
				return o.get("title") == this.layer;
			}, this);
			if(i != -1) {
				// if we found the layer, we can assign it and everything will be fine
				layer = this.layerStore.getAt(i).getLayer();
			}
		}
		if (!this.rendered || !layer)
		{
			var ui = this.getUI();
           
			if(layer)
			{
				this.layer = layer;
				// no DD and radio buttons for base layers
				if(layer.isBaseLayer)
				{
					this.draggable = false;
					Ext.applyIf(this.attributes, { checkedGroup: "gx_baselayer" });
				}
				if(!this.text) {
					this.text = layer.name;
				}
                
				ui.show();
				this.addVisibilityEventHandlers();
			} else {
				ui.hide();
			}
			if(this.layerStore instanceof GeoExt.data.LayerStore) {
				this.addStoreEventHandlers(layer);
			} 
		}
		GeoExt.tree.LayerNode.superclass.render.apply(this, arguments);
	}
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// extend GeoExt.LegendPanel.recordIndexToPanelIndex
function animationRecordIndexToPanelIndex(index)
 {
	var store = this.layerStore;
	var count = store.getCount();
	var panelIndex = -1;
	var legendCount = this.items ? this.items.length : 0;
	var record, layer;
	for(var i=count-1; i>=0; --i)
	{
		record = store.getAt(i);
		if (record)
		{
			layer = record.getLayer();
			var types = GeoExt.LayerLegend.getTypes(record);
			if(layer.displayInLayerSwitcher && types.length > 0 && (store.getAt(i).get("hideInLegend") !== true))
			{
				++panelIndex;
				if(index === i || panelIndex > legendCount-1)
				{
					break;
				}
			}
		}
	}
    return panelIndex;
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
