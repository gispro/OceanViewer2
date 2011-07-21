var animationNodeText = "Анимационные слои";

var animWindow;
var SERVICES_TITLE   = [];
var SERVICES_URL     = [];
var SERVICES_NAMES   = [];
var SERVICES_LAYERS  = [];
var SERVICES_SCALE   = [];
var current_services =  0;

var animLayers       = [];

var MaxResolution    = 1.4054492187499998;
var TIMER_INTERVAL   = 25;
var	slider;
var selectedNode     = null; 

var TEMPL_LAYER_ANIMATION = 'Scale';
var drawClick;
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var servicesLoader = new Ext.data.JsonStore({ 
//	url       : 'http://developer:8080/GeoNodeViewer/ServiceServlet?parameter=animation',
//	url       : 'http://developer:8080/GeoNodeViewer/ServiceServlet?parameter=animation',
//	url       : 'http://developer:8080/ExplorerServlet/ServiceServlet',
//	url       : 'http://gisbox.ru:8080/ExplorerServlet/ServiceServlet',
	//url       : '/OceanViewer2/script/services.json',
        url       : 'script/services.json', // fedd

//	url       : 'http://localhost:8082/composer/ServiceServlet?parameter=animation',
	root      : 'services',
	fields    : ['url', 'title', 'x_axis', 'layers'],
	listeners :
    {
   		load : function()
   		{
//			alert("servicesLoader.listeners - before parseServices");         
			parseServices();
//			alert("servicesLoader.listeners - after parseServices");         
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
	SERVICES_TITLE  = new Array(servicesLoader.getRange().length);  
	SERVICES_URL    = new Array(servicesLoader.getRange().length);
	SERVICES_NAMES  = new Array(servicesLoader.getRange().length);
	SERVICES_LAYERS = new Array(servicesLoader.getRange().length);
	SERVICES_SCALE  = new Array(servicesLoader.getRange().length);
	
   	for (row = 0; row < servicesLoader.getRange().length; row++)
	{
		var x_axis = servicesLoader.getAt(row).get('x_axis');
 		var object = servicesLoader.getAt(row).get('layers');
 		
 		SERVICES_TITLE  [row] = servicesLoader.getAt(row).get('title');
 		SERVICES_URL    [row] = servicesLoader.getAt(row).get('url'  );
 		SERVICES_NAMES  [row] = new Array(object.length);
 		SERVICES_LAYERS [row] = new Array(object.length);
 		SERVICES_SCALE  [row] = new Array(x_axis.length );
		for (items = 0; items < object.length; items++)
		{
			SERVICES_NAMES  [row][items] = object[items];
			SERVICES_LAYERS [row][items] = null;
		}
		for (items = 0; items < x_axis.length; items++)
			SERVICES_SCALE  [row][items] = x_axis [items];
	}; 
	
	animLayers = new Array(servicesLoader.getRange().length);

//	var record = GeoExt.data.LayerRecord;
//	var record = gxp.plugins.WMSCSource(); // .createLayerRecord(null);
//	var config = gxp.plugins.WMSCSource.getConfigForRecord(null);
//	alert ('record = ' + record); // config); // 
	
//	alert (GeoExt.MapPanel + ', ' + GeoExt.MapPanel.guess().map);
	
//	setMapTitle();
//	addLayers (current_services);
//	drawSliderAxis (current_services);

//	if (SERVICES_TITLE.length > 0)
//	alert('0. parseServices : servicesGroup.count = ' + SERVICES_TITLE.length + ', servicesScale[0].count = ' + SERVICES_SCALE[0].length);
//	alert(gxp.Viewer);
//	GeoExt.MapPanel.guess().map.fireEvent("afterlayeropacitychange"); 
//	alert(GeoExt.MapPanel.guess());
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function showAnimWindow(rootNode, selectedNode)
{ 
	if (!animWindow)
	{
		slider = new Ext.Slider({
			name         : 'slider',
			id           : 'slider',
//			increment : 10,
			width        : 200,
			minValue     : 0,
			maxValue     : 100,
			x            : 65, // 90,
			y            : 6,  // 10,
			scale_length : 100/10,
//			anchor    : '95%'
			listeners    : 
			{
				change: function(el, value)
				{
					if (!timer.isRunning())
						timer.setTimeInSeconds(value, TIMER_INTERVAL);

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
				}
//				render : function ()
//				{
//					if (SERVICES_SCALE[current_services] != null)
//					{
//						this.scale_length = SERVICES_SCALE[current_services].length - 1;
//						drawSliderTicks(this, 'slider', SERVICES_SCALE[current_services].length);
//						drawSliderScale(this, 'slider', SERVICES_SCALE[current_services]);
//					}
//				}
			}
		});
		
		btnReset = new Ext.Button({
			scale    : 'small',    // 'large',
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
			scale    : 'small',    // 'large',
			cls      : 'x-btn-icon',
			icon     : 'script/images/play.png',
			x        : 30, // 45,
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
			title         : animationNodeText, 
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
					this.animWinClosed = false;
					resetSelectedNode (this.root, this.node);
					closeAnimWindow();
					animWindow = false;
					this.animWinClosed = true;
                },
				beforeshow : function ()
				{
					if (this.animWinClosed)
					{
						idx = getScenarioIDX (rootNode, selectedNode);
						if (SERVICES_SCALE[current_services] != null)
						{
							slider.scale_length = 100 / (SERVICES_SCALE[idx].length - 1);
							drawSliderTicks(slider, 'slider', SERVICES_SCALE[idx].length);
							drawSliderScale(slider, 'slider', SERVICES_SCALE[idx]);
						} else
                                   // Сервисы для анимации не загружены
							alert ('\u0421\u0435\u0440\u0432\u0438\u0441\u044B\u0020\u0434\u043B\u044F\u0020\u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0438\u0020\u043D\u0435\u0020\u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B');
						if (idx >= 0)
							addLayers(idx);	
//						alert ('animWindow : lon = ' + GeoExt.MapPanel.guess().map.getCenter().lon + ', lat = ' + GeoExt.MapPanel.guess().map.getCenter().lat + ', ' + GeoExt.MapPanel.guess().map.getZoom());
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
function getScenarioIDX (rootNode, selectedNode)
{
	node = getRootChildNode(rootNode, animationNodeText);
	if (node != null)
	{
		for (i = 0; i < node.childNodes.length; i++)
		{
//			alert ('getScenarioIDX : i = ' + i + ', ' + rootNode.childNodes[i].text + ', ' + selectedNode.text);
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
// console.log( 'runAnimation' );
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function stopAnimation()
{
// console.log( '0. stopAnimation' );
	timer .stop();
 	slider.enable (true);
	btnPlay.setIcon('script/images/play.png');
// console.log( '1. stopAnimation' );
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
				animLayers [j].setOpacity(1);
		}
	}
	slider.setValue(0);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getMapLayer (layerName)
{
	for (var i=0, ii = GeoExt.MapPanel.guess().map.layers.length; i<ii; ++i)
	{
		if (GeoExt.MapPanel.guess().map.layers[i].name === layerName)
		{
		    var record = GeoExt.MapPanel.guess().map.layers[i].layerRecord;
			return GeoExt.MapPanel.guess().map.layers[i];
		}
	}
	return null;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function createWMSLayer(service, layers, scale, items, idx)
{
	var name = " " + TEMPL_LAYER_ANIMATION + " " + idx + ".";
	name = name + scale [items];

	var wms = new OpenLayers.Layer.WMS (name, service,
            {
				layers        : layers [items],
				srs           : new OpenLayers.Projection('EPSG:900913'),
				format        : 'image/gif',
				tiled         : 'true',
				minZoomLevel  : 4,
				maxZoomLevel  : 17,
				maxResolution : MaxResolution,
				transparent   : 'true'
            },
            {
        	   	singleTile    : 'true',
                buffer        : 0,
           	   	ratio         : 1,
                isBaseLayer   : false,
                displayOutsideMaxExtent: 'true',
                displayInLayerSwitcher : false //fedd
            });
	return wms;
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function addLayers(idx)
{
	current_services = idx;
	if (SERVICES_LAYERS [idx][0] == null)
	{
		for (items = SERVICES_NAMES [idx].length - 1; items >= 0; items--)
		{
			if (SERVICES_LAYERS [idx][items] == null)
			    SERVICES_LAYERS [idx][items] = createWMSLayer(SERVICES_URL  [idx], SERVICES_NAMES[idx],
				                                              SERVICES_SCALE[idx], items, idx);
			if (items > 0)
				SERVICES_LAYERS [idx][items].setOpacity (0);
			else
				SERVICES_LAYERS [idx][items].setOpacity (1);
			GeoExt.MapPanel.guess().map.addLayer(SERVICES_LAYERS [idx][items]);
		}
	}
	for (var j = 0; j < animLayers.length; j++)
		animLayers [j] = null;

	for (items = SERVICES_NAMES [idx].length - 1; items >= 0; items--)
	{
		var layer = getMapLayer (SERVICES_LAYERS [idx][items].name); 
		if (layer != null)
			animLayers [items] = layer;
	}
	reset();
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function resetSelectedNode (rootNode, selectedNode)
{
	node = getRootChildNode(rootNode, animationNodeText);
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
