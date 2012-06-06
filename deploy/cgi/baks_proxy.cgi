#!/usr/bin/env python
import cgi
form = cgi.FieldStorage()
url = form.getfirst('url', 'empty')
#url = 'http://192.168.0.171:8081/geoserver/wfs/GetFeature?a=1'
body = form.getfirst('body', 'empty')
#body = '<wfs:GetFeature xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.1.0" outputFormat="SHAPE-ZIP" maxFeatures="100" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><wfs:Query typeName="feature:polylayer" srsName="EPSG:900913" xmlns:feature="userlayers"><ogc:Filter xmlns:ogc="http://www.opengis.net/ogc"><ogc:BBOX><ogc:PropertyName>the_geom</ogc:PropertyName><gml:Envelope xmlns:gml="http://www.opengis.net/gml" srsName="EPSG:900913"><gml:lowerCorner>-21152877.456582 -10390543.875527</gml:lowerCorner><gml:upperCorner>21152877.456582 10390543.875527</gml:upperCorner></gml:Envelope></ogc:BBOX></ogc:Filter></wfs:Query></wfs:GetFeature>'

from urlparse import urlparse
parsed_url = urlparse(url)

import httplib
conn = httplib.HTTPConnection(parsed_url.netloc)
conn.connect()
request = conn.putrequest('POST', parsed_url.path + '?' + parsed_url.query)
conn.putheader('Content-Length',len(body))
conn.putheader('Content-Type','application/xml; charset=UTF-8')
conn.endheaders()
conn.send(body)
resp = conn.getresponse()

#print "Content-Type: text/html"
print 'Content-Disposition: ' + resp.getheader('Content-Disposition').replace('inline', 'attachment')
print
import cgitb; cgitb.enable()
print parsed_url
print resp.read()
conn.close()
