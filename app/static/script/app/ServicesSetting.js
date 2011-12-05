var servicesSetting;

Ext.namespace("gxp");

gxp.ServicesSetting = Ext.extend(Ext.Window, {
    
    title        : 'Настройка',
    closeAction  : 'hide',
    modal        : true,

	height       : 600,
	width        : 750,
	newObject    : false,
	user         : '',
	doubledRSS   : 'RSS с данным URL присутствует в списке',
	buttonAlign  : 'left',
	buttons: [
		{
			disabled : false, 
			width    : 150,
			text     :'Добавить на карту',
			handler  : function(){  
				if (servicesSetting.tabs.activeTab.id === 'wmsPanel') 
					servicesSetting.wmsPanel.addRecord2Map();
				else if (servicesSetting.tabs.activeTab.id === 'rssPanel')
					servicesSetting.rssPanel.addRecord2Map();
				}
		}, '->',
		{
			disabled : false,  
			text     : 'Новый',
			handler  : function(){  
				servicesSetting.newObject = true;
				if (servicesSetting.tabs.activeTab.id === 'wmsPanel') {
					servicesSetting.wmsPanel.clear();
					servicesSetting.lockControl ("wmsAccessSelector", false);
				} else if (servicesSetting.tabs.activeTab.id === 'arcgisPanel') {
					servicesSetting.arcgisPanel.clear();
					servicesSetting.lockControl ("arcgisAccessSelector", false);
				} else if (servicesSetting.tabs.activeTab.id === 'rssPanel') {
					servicesSetting.rssPanel.clear();
					servicesSetting.lockControl ("rssAccessSelector", false);
				}
				servicesSetting.buttons[4].setDisabled (true );
			} 
		},
		{
			disabled : true,
			text     : 'Сохранить',
			handler  : function(){
				if (servicesSetting.tabs.activeTab.id === 'wmsPanel') {
//					console.log ('Save WMS object : newObject = ' + servicesSetting.newObject);
					if (servicesSetting.newObject === false)
						servicesSetting.wmsPanel.saveSelected();
					else
						servicesSetting.wmsPanel.addRecord();
				} else if (servicesSetting.tabs.activeTab.id === 'arcgisPanel') {
					console.log ('Save ARCGIS object : newObject = ' + servicesSetting.newObject);
				} else if (servicesSetting.tabs.activeTab.id === 'rssPanel'){
					if (servicesSetting.newObject === false)
						servicesSetting.rssPanel.saveSelected();
					else
						servicesSetting.rssPanel.addRecord();
				}
			}  
		},
		{
			disabled : true,
			text     :'Удалить',
			handler  : function(){
				if ((servicesSetting.tabs.activeTab.id === 'wmsPanel') && (servicesSetting.newObject === false)) {
					// console.log ('Delete WMS object : newObject = ' + servicesSetting.newObject);
					servicesSetting.wmsPanel.removeSelected();
				} else if ((servicesSetting.tabs.activeTab.id === 'arcgisPanel') && (servicesSetting.newObject === false)) {
					console.log ('Delete ARCGIS object : newObject = ' + servicesSetting.newObject);
				} else if ((servicesSetting.tabs.activeTab.id === 'rssPanel') && (servicesSetting.newObject === false)){
					servicesSetting.rssPanel.removeSelected();
				}
			}
		},
		{
			disabled : false,
			text     :'Закрыть',
			handler  : function(){  
				servicesSetting.hide();
			}  
		}
	],
/*	
 //~~~~~ change components height .....
		listeners: {  
			resize: function(){  
				this.items.each(function(i) {  
					if (i.rendered) {  
						i.setHeight(this.body.getHeight(true));  
					}  
				}, this);  
			},  
			show : function(){  
				this.items.each(function(i) {  
					if (i.rendered) {  
						i.setHeight(this.body.getHeight(true));  
					}  
				}, this);  
			}
		},
*/
	initComponent: function() {
		//~~ WMS layer store ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		this.wmsLayersStore = new Ext.data.Store({
			autoLoad : false,
			idCustom : '',
			proxy    : new Ext.data.HttpProxy({
				 url : ''
			}),
			reader: new Ext.data.XmlReader({
				record : 'Layer',
				id     : 'Layer'
			}, [ 'Title', 'Name']),
			listeners :
			{
//				load   : function() {
//					Ext.getCmp('wmsLayersCount').getEl().update(' Количество слоев ' + this.data.length);
//				},
				loadexception : function(o, arg, nul, e) {
					console.log ('ServiceSetting.wmsLayersStore.loadexception : ' + e);
				}
			}
		});
		//~~ icon store ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		this.iconStore = new Ext.data.SimpleStore({
			fields: ['color', 'url'],
			data : [['голубой'   , 'script/images/marker-blue.gif'  ],
					['коричневый', 'script/images/marker-brown.gif' ],
					['желтый'    , 'script/images/marker-gold.png'  ],
					['зеленый'   , 'script/images/marker-green.png' ],
					['фиолетовый', 'script/images/marker-purple.gif'],
					['красный'   , 'script/images/marker-red.png'   ]]
		});
		this.iconSelector = new Ext.form.ComboBox({
			fieldLabel    : "Иконка",
			emptyText     : "Введите или выберите иконку для RSS",
			displayField  : 'color',
			valueField    : 'url',
			editable      : true,
			disabled      : false,
			triggerAction : 'all',
			mode          : 'local',
			store         : this.iconStore,
			anchor        : "100%",
			labelStyle    : 'font-size:12px;font-weight: normal; color:#909090'
		});
		//~~ acess store ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~		
		this.accessStore = new Ext.data.SimpleStore({
			fields : ['rus', 'eng'],
			data   : [['Открыт'      , 'public' ],
				      ['Закрыт'      , 'private'],
					  ['Ограниченный', 'limited']]
		});
		this.rssAccessSelector = new Ext.form.ComboBox({
			id            : 'rssAccessSelector',
			fieldLabel    : "Доступ",
			emptyText     : "Установите доступ к сервису",
			displayField  : 'rus',
			valueField    : 'eng',
			disabled      : true,
			triggerAction : 'all',
			mode          : 'local',
			store         : this.accessStore,
			anchor        : "100%",
			labelStyle    : 'font-size:12px;font-weight: normal; color:#909090'
		});
		this.arcgisAccessSelector = new Ext.form.ComboBox({
			id            : 'arcgisAccessSelector',
			fieldLabel    : "Доступ",
			emptyText     : "Установите доступ к сервису",
			displayField  : 'rus',
			valueField    : 'eng',
			disabled      : true,
			triggerAction : 'all',
			mode          : 'local',
			store         : this.accessStore,
			anchor        : "100%",
			labelStyle    : 'font-size:12px;font-weight: normal; color:#909090'
		});
		this.wmsAccessSelector = new Ext.form.ComboBox({
			id            : 'wmsAccessSelector',
			fieldLabel    : "Доступ",
			emptyText     : "Установите доступ к сервису",
			displayField  : 'rus',
			valueField    : 'eng',
			disabled      : true,
			triggerAction : 'all',
			mode          : 'local',
			store         : this.accessStore,
			anchor        : "100%",
			labelStyle    : 'font-size:12px;font-weight: normal; color:#909090'
		});
		//~~ ArcGIS Store ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		var arcgisDS = new Ext.data.JsonStore({
			root      : 'servers',
			fields : ['title', 'url', 'format', 'owner', 'access'],
		});
		arcgisDS.loadData(arcgisStore.reader.jsonData.arcgis);
		
		this.lockControl = function(selector, disabled)
		{
			servicesSetting.buttons[3].setDisabled (disabled);
			servicesSetting.buttons[4].setDisabled (disabled);
			Ext.getCmp(selector)      .setDisabled (disabled);
		};
		//~~~ Messages
		this.doubledRecord = function(content)
		{
			Ext.Msg.alert('Дублирование', content);
		};
		this.errorTransaction = function()
		{
			Ext.Msg.alert('Транзакция', 'Ошибка при обработке записи на сервере');
		};
		this.errorFieldEmpty = function()
		{
			Ext.Msg.alert('РЎРѕС…СЂР°РЅРµРЅРёРµ', 'РћРґРЅРѕ РёР»Рё РЅРµСЃРєРѕР»СЊРєРѕ РїРѕР»РµР№ РЅРµ Р·Р°РїРѕР»РЅРµРЅС‹');
		};
		this.notSelected = function()
		{
			Ext.Msg.alert('Р”РѕР±Р°РІР»РµРЅРёРµ РЅР° РєР°СЂС‚Сѓ', 'РќРµС‚ РІС‹РґРµР»РµРЅРЅРѕР№ Р·Р°РїРёСЃРё');
		};
		//~~ WMS panel start ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		this.wmsPanel = new Ext.Panel({
			id: 'wmsPanel',
			title: 'WMS',
			width: 750,
			layout: 'column', 
			getSelectedRow : function (store, data)
			{
				var row = -1;
				if (store.getCount() > 0)
				{
					for (var i = 0; i < store.getCount(); i++)
					{
						if ((store.data.items[i].data.title === data.title) &&
						    (store.data.items[i].data.url   === data.url))
						{
							row = i;
							break;
						};
					};
				};
				return row;
			},
			clear : function()
			{
				Ext.getCmp("wmsPanel").items.items[1].items.items[0].setValue('');
				Ext.getCmp("wmsPanel").items.items[1].items.items[1].setValue('');
				Ext.getCmp("wmsPanel").items.items[1].items.items[2].setValue(servicesSetting.user);
				Ext.getCmp("wmsPanel").items.items[1].items.items[3].setValue('public');
				Ext.getCmp("wmsAccessSelector").setDisabled (false);
				
				if ((Ext.getCmp("wmsGrid").store.getCount() > 0) && Ext.getCmp("wmsGrid").getSelectionModel().getSelected())
				{
					Ext.getCmp("wmsGrid").getSelectionModel().deselectRow(this.getSelectedRow(Ext.getCmp("wmsGrid").store, 
                                                               Ext.getCmp("wmsGrid").getSelectionModel().getSelected().data));
				}
				this.clearGridLayers();
			},
			getLayerSources : function ()
			{
				var id;
				for (var rec in app.layerSources)
				{
					if (app.layerSources[rec].baseParams && (app.layerSources[rec].baseParams.SERVICE === 'WMS') &&
					   (app.layerSources[rec].baseParams.REQUEST === 'GetCapabilities') &&
					   (app.layerSources[rec].ptype === 'gxp_wmscsource') &&
					   (app.layerSources[rec].title === Ext.getCmp("wmsPanel").items.items[1].items.items[0].getValue()) &&
					   (app.layerSources[rec].url   === Ext.getCmp("wmsPanel").items.items[1].items.items[1].getValue()))
					{
//									console.log ('title = ' + app.layerSources[rec].title + ', url = ' + app.layerSources[rec].url +
//									                                         ', ptype = ' + app.layerSources[rec].ptype);
						id = rec;
						break;
					}
				}
				return id;
			},
			showLayerSources : function (id)
			{
				servicesSetting.wmsLayersStore.idCustom = id;

				servicesSetting.wmsLayersStore.data = app.layerSources[id].store.data;
				Ext.getCmp("wmsLayers"     ).getView().refresh();
				Ext.getCmp('wmsLayersCount').getEl().update('Количество слоев ' + servicesSetting.wmsLayersStore.data.length);
			},
			clearGridLayers : function ()
			{
				Ext.getCmp('wmsLayersCount').getEl().update('&nbsp;');
				if (Ext.getCmp("wmsLayers").getSelectionModel().getSelected())
				{
					Ext.getCmp("wmsLayers").getSelectionModel().deselectRow(this.getSelectedRow(Ext.getCmp("wmsLayers").store, 
                                                                 Ext.getCmp("wmsLayers").getSelectionModel().getSelected().data));
				}
				servicesSetting.wmsLayersStore.proxy = new Ext.data.HttpProxy({url: ''});
				servicesSetting.wmsLayersStore.data = [];
				Ext.getCmp("wmsLayers").getView().refresh();
			},
			rowSelect : function (record)
			{
				Ext.getCmp("wmsPanel").items.items[1].items.items[0].setValue(record.data.serverName);
				Ext.getCmp("wmsPanel").items.items[1].items.items[1].setValue(record.data.url       );
				Ext.getCmp("wmsPanel").items.items[1].items.items[2].setValue(record.data.owner     );
				Ext.getCmp("wmsPanel").items.items[1].items.items[3].setValue(record.data.access    );
				
				var disabled = true;
				if (record.data.owner === servicesSetting.user) 
					disabled = false;
				servicesSetting.lockControl ("wmsAccessSelector", disabled);
				servicesSetting.newObject = false;
				
				this.clearGridLayers();
				var id = this.getLayerSources();
				if (id)
					this.showLayerSources (id);
			},
			removeSelected : function()
			{
				var idx = this.getSelectedRow(Ext.getCmp("wmsGrid").store, 
					                          Ext.getCmp("wmsGrid").getSelectionModel().getSelected().data);
				var record = Ext.getCmp("wmsGrid").store.data.items[idx];

				OpenLayers.Request.issue({
					method: "GET",
					url: "save",
					async: true,
					params:{
					    service : "wms"                 ,
						action  : "remove"              ,
						name    : record.data.serverName,
						url     : record.data.url       ,
						owner   : record.data.owner
					},
					callback: function(request) 
					{
						servicesSetting.wmsPanel.clear();
						Ext.getCmp("wmsGrid").store.remove (record);
						servicesSetting.lockControl ("wmsAccessSelector", true);
						servicesSetting.wmsLayersStore.data = [];
					}					
				});
			},
			saveSelected : function()
			{
				var idx = this.getSelectedRow(Ext.getCmp("wmsGrid").store, 
					                          Ext.getCmp("wmsGrid").getSelectionModel().getSelected().data);
				var panel  = Ext.getCmp("wmsPanel").items.items[1];
				var record = Ext.getCmp("wmsGrid" ).store.data.items[idx];

				if ((panel.items.items[0].getValue().length === 0) || (panel.items.items[1].getValue().length === 0))
					servicesSetting.errorFieldEmpty();
				else if ((record.data.title  !== panel.items.items[0].getValue()) ||
   				         (record.data.url    !== panel.items.items[1].getValue()) ||
						 (record.data.access !== panel.items.items[3].getValue()))
				{
					var doubled = false;
					if (wmsStore.isRecordPresent (panel.items.items[1].getValue()))
						doubled = !(record.data.url === panel.items.items[1].getValue());
					if (doubled)
						servicesSetting.doubledRecord(servicesSetting.doubledWMS);
					else {
						OpenLayers.Request.issue({
							method  : "GET",
							url     : "save",
							async   : true,
							params  : {
								service        : "wms"                          ,
								action         : "update"                       ,
								serverName     : record.data.serverName         ,
								url            : record.data.url                ,
								owner          : record.data.owner              ,
								serverName_new : panel.items.items[0].getValue(),
								url_new        : panel.items.items[1].getValue(),
								access         : panel.items.items[3].getValue(),
							},
							callback: function(request) 
							{
								if (request.status === 200)
								{								
									record.data.serverName = panel.items.items[0].getValue();
									record.data.url        = panel.items.items[1].getValue();
									record.data.access     = panel.items.items[3].getValue();
									Ext.getCmp("wmsGrid").getView().refresh();
								} else {
									var result = Ext.util.JSON.decode(request.responseText);
									if (result.note === "doubled")
										servicesSetting.doubledRecord(servicesSetting.doubledWMS);
									else
										servicesSetting.errorTransaction();
								}
							}					
						});
					}
				}
			},
			addRecord : function()
			{
				var panel = Ext.getCmp("wmsPanel").items.items[1];

				if ((panel.items.items[0].getValue().length === 0) || (panel.items.items[1].getValue().length === 0))
					servicesSetting.errorFieldEmpty();
				else if (wmsStore.isRecordPresent (panel.items.items[1].getValue()))
					servicesSetting.doubledRecord(servicesSetting.doubledWMS);
				else {
					OpenLayers.Request.issue({
						method: "GET",
						url: "save",
						async: true,
						params:{
							service    : "wms"                          ,
							action     : "add"                          ,
							serverName : panel.items.items[0].getValue(),
							url        : panel.items.items[1].getValue(),
							access     : panel.items.items[3].getValue(),
							owner      : servicesSetting.user
						},
						callback: function(request) 
						{
							if (request.status === 200)
							{								
								var structure = Ext.data.Record.create([
									{name: "serverName", type: "string" },
									{name: "url"       , type: "string" },
									{name: "owner"     , type: "string" },
									{name: "access"    , type: "string" },
								]); 
								var record = new structure({
									serverName : panel.items.items[0].getValue(),
									url        : panel.items.items[1].getValue(),
									owner      : servicesSetting.user           ,
									access     : panel.items.items[3].getValue()
								}); 
								wmsStore.add(record);
								Ext.getCmp("wmsGrid").getSelectionModel().selectRow(Ext.getCmp("wmsGrid").store.data.length - 1);
								Ext.getCmp("wmsGrid").getView().refresh();
								servicesSetting.newObject = false;
							} else {
								var result = Ext.util.JSON.decode(request.responseText);
								if (result.note === "doubled")
									servicesSetting.doubledRecord(servicesSetting.doubledWMS);
								else
									servicesSetting.errorTransaction();
							}
						}					
					});
				}
			},
			addRecord2Map : function()
			{
				if (!Ext.getCmp("wmsLayers").getSelectionModel().getSelected())
					servicesSetting.notSelected ();
				else {			
					var key    = servicesSetting.wmsLayersStore.idCustom;
					var source = app.layerSources[key];
				
					var record = source.createLayerRecord ({
						name   : Ext.getCmp('wmsLayers').getSelectionModel().getSelected().data.name,
						source : key
					});
					if (record)
						app.mapPanel.layers.add([record]);
				}
			},
			items: [
			{
				width : 260,
				height: 260,
				layout: 'fit',
				items: {
					xtype  : 'grid',
					id     : 'wmsGrid',
					border : false ,
					ds     : wmsStore,
					columns: [
						{
							id       : 'serverName',
							header   : 'Наименование', 
							width    : 238, 
							sortable : true,
							dataIndex: 'serverName',
							renderer : function(value,metaData,record,colIndex,store,view) {
								metaData.attr  = 'ext:qtip="' + value + '"';
								return value;
							}
						}
					],
					sm: new Ext.grid.RowSelectionModel({
						singleSelect: true,
						listeners: {
							rowselect: function(sm, row, rec) {
								servicesSetting.wmsPanel.rowSelect (rec);
							}
						}
					}),
					listeners: {
						viewready: function(grid) {
							grid.getSelectionModel().selectRow(0);
						}
					}					
				}
			},{
				xtype       : 'fieldset',
				height      : 280,
				width       : 464,
				labelAlign  : 'top',
				bodyStyle   : 'padding: 10px 10px 5px 10px;border-color: #f86c6c;',
				style: {
					"margin-left": "10px",
					"margin-right": "0"
				},
				items: [{
						xtype      : 'textfield',
						fieldLabel : 'Наименование',
						name       : 'serverName',
						anchor     : "100%",
						labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
					},{
						xtype      : 'textfield',
						fieldLabel : 'URL',
						name       : 'url',
						anchor     : "100%",
						labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
					},{
						xtype      : 'textfield',
						fieldLabel : 'Владелец',
						name       : 'owner',
						disabled   : true,
						anchor     : "100%",
						labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
					},	this.wmsAccessSelector,
					{
						id         : 'wmsLayersCount',
						xtype      : 'label',  
						html       : '&nbsp;',
						style      : 'font-size:11px;font-weight: normal; font-style: italic;color:#8080ff'
					},
					{
						xtype      : 'label',  
						html       : '&nbsp;',
						style      : 'font-size:20px;font-weight: bold'
					},
					{
						xtype      : 'button',  
						width      :  100,
						text       : 'Подключиться',
						style      : 'font-size:14px;font-weight: bold;color:#ffff00',
						handler  : function(){  
							// check 
							var wmsCapabilities = Ext.getCmp("wmsPanel").items.items[1].items.items[1].getValue() + '?request=GetCapabilities';
							
							var id = servicesSetting.wmsPanel.getLayerSources();

							if (id) {
								servicesSetting.wmsPanel.showLayerSources (id);
							} else {
								var conf = {
									url   : Ext.getCmp("wmsPanel").items.items[1].items.items[1].getValue(),
									title : Ext.getCmp("wmsPanel").items.items[1].items.items[0].getValue()
								}
								app.addLayerSource({
									config: conf,
									callback: function(id) {
//										console.log ('app.addLayerSource : id = ' + id);
										servicesSetting.wmsLayersStore.idCustom = id;

										servicesSetting.wmsLayersStore.data = app.layerSources[id].store.data;
										Ext.getCmp("wmsLayers"     ).getView().refresh();
										Ext.getCmp('wmsLayersCount').getEl().update('Количество слоев ' + servicesSetting.wmsLayersStore.data.length);
									},
									fallback: function(source, msg) {
										Ext.Msg.alert(msg);	
										console.log ('wmsLayersStore.fallback : ' + msg);
									},
									scope: this
								});
							}
						}
					}
				]
			},{
				xtype     : 'label',  
				colspan   : 2,
				text      : 'Список слоев',
				style     : 'padding: 5px 0px 5px 3px;font-size:12px;font-weight: bold;color:#909090'
			},{
				id        : 'wmsLayers',
				xtype     : 'grid',  
				colspan   : 2,
				style     : 'padding: 5px 0px 5px 0px',
				border    : true,
				height    : 206,
				ds        : this.wmsLayersStore,
				columns: [
					{
						header    : 'Заголовок', 
						width     : 355, 
						sortable  : false,
						dataIndex : 'title',
						renderer : function(value, metaData, record, colIndex, store, view) {
							metaData.attr = 'ext:qtip="' + value + '"';
							return value;
						}
					},
					{
						header    : 'Наименование', 
						width     : 340, 
						sortable  : false,
						dataIndex : 'name'
					}
				]
			}]
		});
		//~~ WMS panel end ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		//~~ ArcGIS panel start ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		this.arcgisPanel = new Ext.Panel({
			id: 'arcgisPanel',
			title: 'ArcGIS',
			width: 750,
			border: false,
			layout: 'column',
			getSelectedRow : function (store, data)
			{
				var row = -1;
				if (store.getCount() > 0)
				{
					for (var i = 0; i < store.getCount(); i++)
					{
						if ((store.data.items[i].data.title === data.title) &&
						    (store.data.items[i].data.url   === data.url))
						{
							row = i;
							break;
						};
					};
				};
				return row;
			},
			clear : function()
			{
				Ext.getCmp("arcgisPanel").items.items[1].items.items[0].setValue('');
				Ext.getCmp("arcgisPanel").items.items[1].items.items[1].setValue('');
				Ext.getCmp("arcgisPanel").items.items[1].items.items[2].setValue('');
				Ext.getCmp("arcgisPanel").items.items[1].items.items[3].setValue(servicesSetting.user);
				Ext.getCmp("arcgisPanel").items.items[1].items.items[4].setValue('public');
				Ext.getCmp("arcgisAccessSelector").setDisabled (false);
				
				if ((Ext.getCmp("arcgisGrid").store.getCount() > 0) && Ext.getCmp("arcgisGrid").getSelectionModel().getSelected())
				{
					Ext.getCmp("arcgisGrid").getSelectionModel().deselectRow(this.getSelectedRow(Ext.getCmp("arcgisGrid").store, 
                                                               Ext.getCmp("arcgisGrid").getSelectionModel().getSelected().data));
				}
			},
			rowSelect : function (record)
			{
				Ext.getCmp("arcgisPanel").items.items[1].items.items[0].setValue(record.data.title );
				Ext.getCmp("arcgisPanel").items.items[1].items.items[1].setValue(record.data.url   );
				Ext.getCmp("arcgisPanel").items.items[1].items.items[2].setValue(record.data.format);
				Ext.getCmp("arcgisPanel").items.items[1].items.items[3].setValue(record.data.owner );
				Ext.getCmp("arcgisPanel").items.items[1].items.items[4].setValue(record.data.access);

				var disabled = true;
				if (record.data.owner === servicesSetting.user) 
					disabled = false;
				servicesSetting.lockControl ("arcgisAccessSelector", disabled);
				servicesSetting.newObject = false;
			},
			items: [{
				 width : 260
				,height: 390
				,layout: 'fit'
				,items: {
					xtype  : 'grid',
					id     : 'arcgisGrid',
					border : false ,
					ds     : arcgisDS,
					columns: [
						{
							id       : 'title',
							header   : 'Наименование', 
							width    : 256, 
							sortable : false,
							dataIndex: 'title'
						}
					],
					sm: new Ext.grid.RowSelectionModel({
						singleSelect: true,
						listeners: {
							rowselect: function(sm, row, rec) {
								servicesSetting.arcgisPanel.rowSelect (rec);
							}
						}
					}),
					listeners: {
						viewready: function(grid) {
							grid.getSelectionModel().selectRow(0);
						}
					}					
				}
			},{
				xtype       : 'fieldset',
				height      : 410,
				columnWidth : 1.0,
				labelAlign  : 'top',
				anchor      : '100%',
				bodyStyle   : 'padding: 10px 10px 5px 10px;border-color: #f86c6c;',
				style: {
					"margin-left": "10px",
					"margin-right": "0"
				},
				items: [{
						xtype      : 'textfield',
						fieldLabel : 'Наименование',
						name       : 'name',
						anchor     : "100%",
						labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
					},{
						xtype      : 'textfield',
						fieldLabel : 'URL',
						name       : 'url',
						anchor     : "100%",
						labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
					},{
						xtype      : 'textfield',
						fieldLabel : 'Формат',
						name       : 'format',
						anchor     : "100%",
						labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
					},{
						xtype      : 'textfield',
						fieldLabel : 'Владелец',
						name       : 'owner',
						disabled   : true,
						anchor     : "100%",
						labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
					},	this.arcgisAccessSelector
				]
			}]
		});
		//~~ ArcGIS panel end ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		//~~ RSS panel start ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		this.rssPanel = new Ext.Panel({
			id: 'rssPanel',
			title: 'RSS',
			width: 750,
			border: false,
			layout: 'column',    // Specifies that the items will now be arranged in columns
			getSelectedRow : function (store, data)
			{
				var row = -1;
				if (store.getCount() > 0)
				{
					for (var i = 0; i < store.getCount(); i++)
					{
						if ((store.data.items[i].data.title === data.title) &&
						    (store.data.items[i].data.url   === data.url))
						{
							row = i;
							break;
						};
					};
				};
				return row;
			},
			clear : function()
			{
				Ext.getCmp("rssPanel").items.items[1].items.items[0].setValue('');
				Ext.getCmp("rssPanel").items.items[1].items.items[1].setValue('');
				Ext.getCmp("rssPanel").items.items[1].items.items[2].setValue('');
				Ext.getCmp("rssPanel").items.items[1].items.items[4].setValue('public');
				Ext.getCmp("rssPanel").items.items[1].items.items[3].setValue(servicesSetting.user);
				Ext.getCmp("rssAccessSelector").setDisabled (false);

				if ((Ext.getCmp("rssGrid").store.getCount() > 0) && Ext.getCmp("rssGrid").getSelectionModel().getSelected())
				{
					Ext.getCmp("rssGrid").getSelectionModel().deselectRow(this.getSelectedRow(Ext.getCmp("rssGrid").store, 
																Ext.getCmp("rssGrid").getSelectionModel().getSelected().data));
				}
			},
			rowSelect : function (record)
			{
				Ext.getCmp("rssPanel").items.items[1].items.items[0].setValue(record.data.title );
				Ext.getCmp("rssPanel").items.items[1].items.items[1].setValue(record.data.url   );
				Ext.getCmp("rssPanel").items.items[1].items.items[2].setValue(record.data.icon  );
				Ext.getCmp("rssPanel").items.items[1].items.items[3].setValue(record.data.owner );
				Ext.getCmp("rssPanel").items.items[1].items.items[4].setValue(record.data.access);
				
				var disabled = true;
				if (record.data.owner === servicesSetting.user) 
					disabled = false;
				servicesSetting.lockControl ("rssAccessSelector", disabled);
				servicesSetting.newObject = false;
			},
			extractFileName : function (url)
			{
				var fname;
				var parts = url.split("/");
				if (parts)
					fname = parts[parts.length-1];
				else
					fname = 'Unreachable';
				if (fname.indexOf(".") > 0)
					fname = fname.substring (0, fname.indexOf("."));
				return fname;
			},
			removeSelected : function()
			{
				var idx = this.getSelectedRow(Ext.getCmp("rssGrid").store, 
					                          Ext.getCmp("rssGrid").getSelectionModel().getSelected().data);
				this.clear();
				var record = Ext.getCmp("rssGrid").store.data.items[idx];

				OpenLayers.Request.issue({
					method: "GET",
					url: "save",
					async: true,
					params:{
					    service : "rss"                                 ,
						action  : "remove"                              ,
						name    : this.extractFileName (record.data.url),
						title   : record.data.title                     ,
						icon    : record.data.icon                      ,
						url     : record.data.url                       ,
						owner   : record.data.owner
					},
					callback: function(request) 
					{
						Ext.getCmp("rssGrid").store.remove (record);
						servicesSetting.lockControl ("rssAccessSelector", true);
					}					
				});
			},
			saveSelected : function()
			{
				var idx = this.getSelectedRow(Ext.getCmp("rssGrid").store, 
					                          Ext.getCmp("rssGrid").getSelectionModel().getSelected().data);
				var panel  = Ext.getCmp("rssPanel").items.items[1];
				var record = Ext.getCmp("rssGrid" ).store.data.items[idx];
				var fname = this.extractFileName (panel.items.items[1].getValue());

				if ((panel.items.items[0].getValue().length === 0) || (panel.items.items[1].getValue().length === 0))
					servicesSetting.errorFieldEmpty();
				else if ((record.data.title  !== panel.items.items[0].getValue()) ||
   				    (record.data.url    !== panel.items.items[1].getValue()) ||
					(record.data.icon   !== panel.items.items[2].getValue()) ||
					(record.data.access !== panel.items.items[4].getValue()))
				{
					var doubled = false;
					if (rssStore.isRecordPresent (panel.items.items[1].getValue()))
						doubled = !(record.data.url === panel.items.items[1].getValue());
					if (doubled)
						servicesSetting.doubledRecord(servicesSetting.doubledRSS);
					else {
						OpenLayers.Request.issue({
							method: "GET",
							url: "save",
							async: true,
							params:{
								service   : "rss"                          ,
								action    : "update"                       ,
								name      : fname                          ,
								title     : record.data.title              ,
								url       : record.data.url                ,
								owner     : record.data.owner              ,
								title_new : panel.items.items[0].getValue(),
								url_new   : panel.items.items[1].getValue(),
								icon      : panel.items.items[2].getValue(),
								access    : panel.items.items[4].getValue(),
							},
							callback: function(request) 
							{
								if (request.status === 200)
								{								
									record.data.name   = fname;
									record.data.title  = panel.items.items[0].getValue();
									record.data.url    = panel.items.items[1].getValue();
									record.data.icon   = panel.items.items[2].getValue();
									record.data.access = panel.items.items[4].getValue();
									Ext.getCmp("rssGrid").getView().refresh();
								} else {
									var result = Ext.util.JSON.decode(request.responseText);
									if (result.note === "doubled")
										servicesSetting.doubledRecord(servicesSetting.doubledRSS);
									else
										servicesSetting.errorTransaction();
								}
							}					
						});
					}
				}
			},
			addRecord : function()
			{
				var panel = Ext.getCmp("rssPanel").items.items[1];

				if ((panel.items.items[0].getValue().length === 0) || (panel.items.items[1].getValue().length === 0))
					servicesSetting.errorFieldEmpty();
				else if (rssStore.isRecordPresent (panel.items.items[1].getValue()))
					servicesSetting.doubledRecord(servicesSetting.doubledRSS);
				else {
					var fname = this.extractFileName (panel.items.items[1].getValue());
					
					OpenLayers.Request.issue({
						method: "GET",
						url: "save",
						async: true,
						params:{
							service   : "rss"                          ,
							action    : "add"                          ,
							name      : fname                          ,
							title     : panel.items.items[0].getValue(),
							url       : panel.items.items[1].getValue(),
							icon      : panel.items.items[2].getValue(),
							access    : panel.items.items[4].getValue(),
							owner     : servicesSetting.user
						},
						callback: function(request) 
						{
							if (request.status === 200)
							{								
								var structure = Ext.data.Record.create([
									{name: "timer" , type: "integer"},
									{name: "name"  , type: "string" },
									{name: "title" , type: "string" },
									{name: "icon"  , type: "string" },
									{name: "url"   , type: "string" },
									{name: "owner" , type: "string" },
									{name: "access", type: "string" },
								]); 
								var record = new structure({
									timer  : 5,
									name   : fname,
									title  : panel.items.items[0].getValue(),
									icon   : panel.items.items[2].getValue(),
									url    : panel.items.items[1].getValue(),
									owner  : servicesSetting.user           ,
									access : panel.items.items[4].getValue()
								}); 
								rssStore.add(record);
								Ext.getCmp("rssGrid").getSelectionModel().selectRow(Ext.getCmp("rssGrid").store.data.length - 1);
								Ext.getCmp("rssGrid").getView().refresh();
								servicesSetting.newObject = false;
							} else {
								var result = Ext.util.JSON.decode(request.responseText);
								if (result.note === "doubled")
									servicesSetting.doubledRecord(servicesSetting.doubledRSS);
								else
									servicesSetting.errorTransaction();
							}
						}					
					});
				}
			},
			addRecord2Map : function()
			{
				var panel = Ext.getCmp("rssPanel").items.items[1];
				var record = app.layerSources['rss'].createRecord (panel.items.items[0].getValue());
				if (record)
					app.mapPanel.layers.add([record]);
			},
			items: [{
				width : 260,
				height: 485,
				layout: 'fit',
				items: {
					xtype  : 'grid',
					id     : 'rssGrid',
					border : false,
					ds     : rssStore,
					columns: [
						{
							id       : 'title',
							header   : 'Наименование', 
							width    : 256, 
							sortable : true,
							dataIndex: 'title'
						}
					],
					sm: new Ext.grid.RowSelectionModel({
						singleSelect: true,
						listeners: {
							rowselect: function(sm, row, rec) {
								servicesSetting.rssPanel.rowSelect (rec);
							}
						}
					}),
					listeners: {
						viewready: function(g) {
							g.getSelectionModel().selectRow(0);
						} 
					}
				}
			},{
				xtype       : 'fieldset',
				height      : 505,
				columnWidth : 1.0,
				labelAlign  : 'top',
//				border      : false,
				anchor      : '100%',
				bodyStyle   : 'padding: 10px 10px 5px 10px;border-color: #f86c6c;',
				style: {
					"margin-left": "10px",
//					"margin-right": Ext.isIE6 ? (Ext.isStrict ? "-10px" : "-13px") : "0"  // you have to adjust for it somewhere else
					"margin-right": "0"
				},
				items: [{
						xtype      : 'textfield',
						fieldLabel : 'Наименование',
						name       : 'title',
						anchor     : "100%",
						labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
					},{
						xtype      : 'textfield',
						fieldLabel : 'URL',
						name       : 'url',
						anchor     : "100%",
						labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
					},
					this.iconSelector,
					{
						xtype      : 'textfield',
						fieldLabel : 'Владелец',
						name       : 'owner',
						disabled   : true,
						anchor     : "100%",
						labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
					},	this.rssAccessSelector
				]
			}]
		});
		//~~ RSS panel end ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		
		this.tabs = new Ext.TabPanel({
			deferredRender    : false,
			layoutOnTabChange : true,
			activeTab         : 0,
			height            : 535,
			width             : '100%',
			defaults          : {
				bodyStyle : 'padding: 10px; background-color: #efefef',
				hideMode  : 'offsets'
			},
			items: [
				this.wmsPanel, 
				this.arcgisPanel, 
				this.rssPanel
/*				
				,{
					title      : 'РђРЅРёРјР°С†РёСЏ',
					id         : 'animation',
					autoScroll : true
				}				
*/				
			],
            listeners: {
                'tabchange': function(tabPanel, tab){
					if (tab.id === 'wmsPanel') {
						servicesSetting.newObject = true;
						servicesSetting.wmsPanel.clear();
						servicesSetting.lockControl ("wmsAccessSelector", true);
						servicesSetting.buttons[4].setDisabled (true);
					} else if (tab.id === 'rssPanel') {
						servicesSetting.rssPanel.clear();
						servicesSetting.lockControl ("rssAccessSelector", true);
//						servicesSetting.buttons[4].setDisabled (true);
					}
                }
            }
			
		});
		this.items = this.tabs;
		
		OpenLayers.Request.issue({
			method : "GET",
			url    : "account",
			async  : true,
			params : {
			    service : "user"
			},
			callback: function(request) {
				var account = Ext.util.JSON.decode(request.responseText);
				servicesSetting.user = account.user;
            }
		});
			
		Ext.getCmp('wmsLayers').on('dblclick', function(evt)
		{
				servicesSetting.wmsPanel.addRecord2Map();
				});
																	
		gxp.ServicesSetting.superclass.initComponent.call(this);
	}    
});
