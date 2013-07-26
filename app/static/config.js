var list = [];

var xhr = new XMLHttpRequest();
xhr.onload = function(r,a){
   list = list.concat(JSON.parse(this.responseText).options);		
   list.get = function(id){var l = list.filter(function(el){return el.key==id})[0]; return l ? l.value : undefined;} 
}
xhr.open("GET","http://oceanviewer.ru/ovdev/services?service=config&action=getList",false);
xhr.send();

window.CONFIG = {

		  blankImageUrl: OVROOT + "theme/app/img/blank.gif",
		  openLayersImgPath: OVROOT + "externals/openlayers/img/",
		  translateUrl: OVROOT + 'translate',
		  metadataUrl: OVROOT + 'metadata',
		  imageReloadAttempts: 2,

		  composer: {
			portalConfig: typeof(OVPORTLETDIV) === 'undefined'?undefined:{
				renderTo: OVPORTLETDIV,
				height: 600
			},
			jossoReload: true,
			authWay: false,
			//username: 'edit',
			//password: 'pedit',
			authUrl: list.get("authUrl"),//"http://oceanviewer.ru/josso/signon/",
			proxy: OVROOT.length==0?"proxy/?url=":OVROOT + "cgi-bin/nph-proxy.cgi/00/?url=",			
			printService: list.get('printService'),//(//"http://oceanviewer.ru/print/pdf/"),//,
			about: {
			  title: "Карта OceanViewer",
			  "abstract": "Сохраненная карта OceanViewer",
			  contact: "Разработчик приложения <a href='http://www.gispro.ru'>ЗАО 'ГИСпроект'</a>"
			},
			defaultSourceType: "gxp_wmscsource",
			downloadFilePageUrl: OVROOT + 'cgi-bin/get_features_24.py',

			jossoLoginUrl: list.get("authUrl")+"/login.do",//'http://oceanviewer.ru/josso/signon/login.do',
			jossoOutUrl: list.get("authUrl")+"/logout.do",//'http://oceanviewer.ru/josso/signon/logout.do',

			uploadUrl: list.get("geoserver")+"/rest",//'http://oceanviewer.ru/resources/rest',
			
			//ovLayer
			ovLayer: [list.get("basemapUrl")/*"http://oceanviewer.ru/cache/service/wms"*/, "eko_merge"],

			sources: {
			  arcgis93: { ptype: "gxp_arcgis93source" },
			  rss: { ptype: "gxp_rsssource" },
			  //google: { ptype: "gxp_googlesource" },
			  bing: { ptype: "gxp_bingsource" },
			  osm: { ptype: "gxp_osmsource" },
			  baselayer: { ptype: "gxp_olsource" },
			  animation: { ptype: "gxp_animationsource" },
			  gispro: {
				url: list.get("basemapUrl"),//"http://oceanviewer.ru/cache/service/wms",
				title: "Слои картоосновы"
			  },
			  editable: {
				url: list.get("geoserver")+"/userlayers/wms",//"http://oceanviewer.ru/resources/userlayers/wms",
				restUrl: list.get("geoserver")+"/rest",//"http://oceanviewer.ru/resources/rest",
				title: "Редактируемые"
			  }
			},

			map: {
			  projection: "EPSG:900913",
			  layers: [
				{
				  source: "baselayer",
				  group: "background",
				  fixed: true,
				  type: "OpenLayers.Layer",
				  args: [
					"Без картоосновы", {visibility: false}
				  ]
				},
				{
				  source: "bing",
				  title: "Bing карта",
				  name: "Road",
				  group: "background"
				},
				{
				  source: "bing",
				  title: "Bing спутник",
				  name: "Aerial",
				  group: "background"
				},
				{
				  source: "bing",
				  title: "Bing гибрид",
				  name: "AerialWithLabels",
				  group: "background"
				},
				{
				  source: "osm",
				  name: "mapnik",
				  group: "background"
				},
				{
				  source: "gispro",
				  title: "ЭКО 3.1 бланк",
				  name: "eko_blank",
				  group: "background",
				  args: [null, {alwaysInRange: true}],
				  queryable: false
				},
				{
				  source: "gispro",
				  title: "ЭКО 3.1",
				  name: "eko_merge",
				  group: "background",
				  args: [null, {alwaysInRange: true}],
				  queryable: false
				},
				{
				  name:"userlayers:pointlayer",
				  source:"editable",
				  group:'editable',
				  cached: false,
				  visibility: false
				},
				{
				  name:"userlayers:linelayer",
				  source:"editable",
				  group:'editable',
				  cached: false,
				  visibility: false
				},
				{
				  name:"userlayers:polylayer",
				  source:"editable",
				  group:'editable',
				  cached: false,
				  visibility: false
				}
			  ],
			  center: [0, 0],
			  zoom: 2
			}
		  }
		};
