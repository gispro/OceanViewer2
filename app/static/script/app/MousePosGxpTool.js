
Ext.namespace("gxp.plugins");

gxp.plugins.MousePosGxpTool = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_measure */
    ptype: "gxp_mouseposgxptool",

    config: null,
    mousePosControl: null,
    map: null,

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.MousePosGxpTool.superclass.constructor.apply(this, arguments);
        this.config = config;
        this.mousePosControl = new OpenLayers.Control.MousePosition(this.config.controlOptions);
        //this.mousePosControl.draw();
        //this.mousePosControl.element.style = "font-size: 15";
        //alert(this.graticuleControl);
    },
    
    init: function(target) {
        this.map = target.mapPanel.map;
        this.map.addControl(this.mousePosControl);
        gxp.plugins.MousePosGxpTool.superclass.init.apply(this, arguments);
    },
    

    /** private: method[destroy]
     */
    destroy: function() {
        this.mousePosControl.destroy();
        this.mousePosControl = null;
        this.map = null;
        gxp.plugins.MousePosGxpTool.superclass.destroy.apply(this, arguments);
    }
});

Ext.preg(gxp.plugins.MousePosGxpTool.prototype.ptype, gxp.plugins.MousePosGxpTool);

