var servicesSetting;

Ext.namespace("gxp");

gxp.ServicesSetting = Ext.extend(Ext.Window, {
    
    title       : "Настройка",
    closeAction : 'hide',
    modal : true,

	height : 500,
	width : 800,
	buttons: [
//    {
//		disabled: true,  
//		text:'Добавить на карту'
//	},
    {
		disabled: true,  
		text:'Сохранить'
	},
	{
		disabled: true,  
		text:'Удалить'
	},
	{
		disabled: false,
		text:'Закрыть',
		handler: function(){  
			servicesSetting.hide();          
		}  
	}],
	initComponent: function()
	{
        this.panel = new Ext.form.FormPanel({
            border: false,
            bodyStyle: "padding: 5px",
          labelWidth: 90,
			width: '100%',
			height: '100%'
//			height : 500,
//			width : 800,
//          autoWidth: true,
//          autoHeight: false
//			items :[
//				{
//					xtype: 'button',
//					text: 'Login',
//					style: 'margin-left: 10px;'
//				}
//			]
        });
		this.items = this.panel;

/*
		this.tabs = new Ext.TabPanel({
//			renderTo: 'ext-tabs',
			deferredRender: false,
			layoutOnTabChange: true,
			activeTab: 0,
//			height : 500,
//			width : 800,
			height: '100%',
			width: '100%',
			defaults: {
				bodyStyle: 'padding: 10px;',
				hideMode: 'offsets'
			},
//				width: 300,
//				height: 200,
			items: [
				{
					title: 'Tab 1',
					autoScroll: true
//						items: {
//							width: "100%",
////							width: 500,
////							height: 500,
//							height: "100%",
////							html: 'tab 1'
//						}
				},{
					title: 'Tab 2'
//						items: {
////						html: 'tab 2'
//						}
				}
			]
		});
		this.items = this.tabs;
*/
		gxp.ServicesSetting.superclass.initComponent.call(this);
	}    
});
