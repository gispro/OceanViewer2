
Ext.namespace("gxp.plugins");

gxp.plugins.GraticuleGxpTool = Ext.extend(gxp.plugins.Tool, {
    
    ptype: "gxp_graticulegxptool",

    config: null,
    graticuleControl: null,
    map: null,
    readyAlready: false,
    activated: true,

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.GraticuleGxpTool.superclass.constructor.apply(this, arguments);
        this.config = config;
        //this.graticuleControl = new OpenLayers.Control.Graticule(this.config.controlOptions);
        //alert(this.graticuleControl);
    },
    
    init: function(target) {
        var ths = this;
        gxp.plugins.GraticuleGxpTool.superclass.init.apply(ths, arguments);
        
        
        //target.on("ready", function() {
            if(target.mapPanel.map.layers[0].mergeNewParams)
		target.mapPanel.map.layers[0].mergeNewParams();
                    
            
            ths.map = target.mapPanel.map;
            ths.graticuleControl = new OpenLayers.Control.Graticule(ths.config.controlOptions);
            ths.map.addControl(ths.graticuleControl);

            //ths.graticuleControl.gratLayer.displayOutsideMaxExtent = false;
            //ths.bringUp();
            ths.readyAlready = true;
        //});
        /*target.mapPanel.on("afterlayeradd", function() {
            if(ths.readyAlready)
                ths.bringUp();
        });*/
    },
    
    toggle: function(){
        if(this.activated){
            this.activated = false;
            this.graticuleControl.deactivate();
        }else{
            this.activated = true;
            this.graticuleControl.activate();
        }
    },
    

    /** private: method[destroy]
     */
    destroy: function() {
        this.graticuleControl.destroy();
        this.graticuleControl = null;
        this.map = null;
        gxp.plugins.GraticuleGxpTool.superclass.destroy.apply(this, arguments);
    },
    
    bringUp: function() {
        //alert("bringing up to " + (this.map.getNumLayers() + 1));
        var lastNormalLayer = this.map.layers.length-1;
        for(; lastNormalLayer>=0; lastNormalLayer--){
            if(this.map.layers[lastNormalLayer].CLASS_NAME != "OpenLayers.Layer.GeoRSS"){
                break;
            }
        }
        this.map.setLayerIndex(this.graticuleControl.gratLayer, lastNormalLayer);
    }

});

Ext.preg(gxp.plugins.GraticuleGxpTool.prototype.ptype, gxp.plugins.GraticuleGxpTool);

