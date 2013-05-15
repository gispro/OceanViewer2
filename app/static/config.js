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
    username: 'edit',
    password: 'pedit',
    authUrl: "http://oceanviewer.ru/josso/signon/",
    //proxy: OVROOT + "cgi-bin/nph-proxy.cgi/00/?url=",
    proxy: OVROOT + "proxy/?url=",
    printService: "http://oceanviewer.ru/print/pdf/",
    about: {
      title: "Карта OceanViewer",
      "abstract": "Сохраненная карта OceanViewer",
      contact: "Разработчик приложения <a href='http://www.gispro.ru'>ЗАО 'ГИСпроект'</a>"
    },
    defaultSourceType: "gxp_wmscsource",
    downloadFilePageUrl: OVROOT + 'cgi-bin/get_features_24.py',

    jossoLoginUrl: 'http://oceanviewer.ru/josso/signon/login.do',
    jossoOutUrl: 'http://oceanviewer.ru/josso/signon/logout.do',

    uploadUrl: 'http://oceanviewer.ru/resources/rest',

    //pricker
    prickerLayers: [
      "ru_hydrometcentre_42:ru_hydrometcentre_42_1",
      "ru_hydrometcentre_42:ru_hydrometcentre_42_2",
      "ru_hydrometcentre_42:ru_hydrometcentre_42_3",
      "ru_hydrometcentre_42:ru_hydrometcentre_42_4",
      "ru_hydrometcentre_42:ru_hydrometcentre_42_5",
      "ru_hydrometcentre_42:ru_hydrometcentre_42_6",
      "ru_hydrometcentre_42:ru_hydrometcentre_42_7",
      "ru_hydrometcentre_42:ru_hydrometcentre_42_8",
      "ru_hydrometcentre_42:ru_hydrometcentre_42_9",
      "ru_hydrometcentre_42:ru_hydrometcentre_42_10",
      "ru_hydrometcentre_42:ru_hydrometcentre_42_11"
    ],

    prickerAliaseUrl: 'translate',
    prickerGetInfoUrl: 'http://oceanviewer.ru/resources/wms',
    prickerSaveChartUrl: '/save',

    //ovLayer
    ovLayer: ["http://oceanviewer.ru/cache/service/wms", "eko_merge"],

    sources: {
      arcgis93: { ptype: "gxp_arcgis93source" },
      rss: { ptype: "gxp_rsssource" },
      //google: { ptype: "gxp_googlesource" },
	  bing: { ptype: "gxp_bingsource" },
      osm: { ptype: "gxp_osmsource" },
      baselayer: { ptype: "gxp_olsource" },
      animation: { ptype: "gxp_animationsource" },
      gispro: {
        url: "http://oceanviewer.ru/cache/service/wms",
        title: "Слои картоосновы"
      },
      editable: {
        url: "http://oceanviewer.ru/resources/userlayers/wms",
        restUrl: "http://oceanviewer.ru/resources/rest",
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
       /* {
          source: "google",
          title: "Google Карта",
          name: "ROADMAP",
          group: "background"
        },
        {
          source: "google",
          title: "Google Рельеф",
          name: "TERRAIN",
          group: "background"
        },
        {
          source: "google",
          title: "Google Спутник",
          name: "SATELLITE",
          group: "background"
        },
        {
          source: "google",
          title: "Google Гибрид",
          name: "HYBRID",
          group: "background"
        },*/
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
