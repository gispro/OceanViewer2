window.CONFIG = {

  blankImageUrl: "theme/app/img/blank.gif",
  openLayersImgPath: "externals/openlayers/img/",
  translateUrl: 'translate',
  metadataUrl: 'metadata',
  imageReloadAttempts: 2,

  composer: {
    username: 'edit',
    password: 'pedit',
    authWay: 'josso',
    proxy: "proxy/?url=",
    authUrl: "http://oceanviewer.ru/josso/signon/",
    printService: "http://oceanviewer.ru/print/pdf/",
    about: {
      title: "Карта OceanViewer",
      "abstract": "Сохраненная карта OceanViewer",
      contact: "Разработчик приложения <a href='http://www.gispro.ru'>ЗАО 'ГИСпроект'</a>"
    },
    defaultSourceType: "gxp_wmscsource",

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
    ovLayer: ["http://oceanviewer.ru/cache/service/wms", "eko_merge_v"],

    sources: {
      arcgis93: { ptype: "gxp_arcgis93source" },
      rss: { ptype: "gxp_rsssource" },
      google: { ptype: "gxp_googlesource" },
      osm: { ptype: "gxp_osmsource" },
      baselayer: { ptype: "gxp_olsource" },
      animation: { ptype: "gxp_animationsource" },
      gispro: {
        url: "http://oceanviewer.ru/cache/service/wms",
        title: "Слои картоосновы"
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
        }
      ],
      center: [0, 0],
      zoom: 2
    }
  },
  onloadResources: {
    sources: {
      editable: {
        config: {
          id: 'editable',
          url: "http://192.168.0.171:8080/geoserver/userlayers/wms",
          restUrl: "http://192.168.0.171:8080/geoserver/rest",
          title: "Редактируемые"
        },
        layers: [
          "userlayers:pointlayer",
          "userlayers:linelayer",
          "userlayers:polylayer"
        ],
        group:'editable'
      }
    }
  }
};