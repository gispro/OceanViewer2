
Ext.namespace("gxp.plugins");

gxp.plugins.GraticuleGxpTool = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_measure */
    ptype: "gxp_graticulegxptool",

    config: null,
    graticuleControl: null,
    map: null,
    readyAlready: false,

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.GraticuleGxpTool.superclass.constructor.apply(this, arguments);
        this.config = config;
        this.graticuleControl = new OpenLayers.Control.Graticule(this.config.controlOptions);
        //alert(this.graticuleControl);
    },
    
    init: function(target) {
        this.map = target.mapPanel.map;
        this.map.addControl(this.graticuleControl);
        gxp.plugins.GraticuleGxpTool.superclass.init.apply(this, arguments);
        bubu = this;
        target.on("ready", function() {
            bubu.bringUp();
            bubu.readyAlready = true;
        });
        target.mapPanel.on("afterlayeradd", function() {
            if(bubu.readyAlready)
                bubu.bringUp();
        });
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

