#!/usr/bin/env python
import cgitb; cgitb.enable()
import cgi
form = cgi.FieldStorage()
url = form.getfirst('url', 'empty')
#url = 'http://oceanviewer.ru/user/wfs/WfsDispatcher?a=1'
body = form.getfirst('body', 'empty')
#body = '<wfs:GetFeature xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.1.0" outputFormat="SHAPE-ZIP" maxFeatures="100" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><wfs:Query typeName="feature:polylayer" srsName="EPSG:900913" xmlns:feature="ru_hydrometcentre_61"><ogc:Filter xmlns:ogc="http://www.opengis.net/ogc"><ogc:BBOX><ogc:PropertyName>the_geom</ogc:PropertyName><gml:Envelope xmlns:gml="http://www.opengis.net/gml" srsName="EPSG:900913"><gml:lowerCorner>-21152877.456582 -8453323.8309375</gml:lowerCorner><gml:upperCorner>21152877.456582 8453323.8309375</gml:upperCorner></gml:Envelope></ogc:BBOX></ogc:Filter></wfs:Query></wfs:GetFeature>'

from urlparse import urlparse
parsed_url = urlparse(url)

import httplib
conn = httplib.HTTPConnection(parsed_url[1])
#conn = httplib.HTTPConnection(parsed_url.netloc)
conn.connect()
#request = conn.putrequest('POST', parsed_url.path + '?' + parsed_url.query)
request = conn.putrequest('POST', parsed_url[2] + '?' + parsed_url[4])
conn.putheader('Content-Length',len(body))
conn.putheader('Content-Type','application/xml; charset=UTF-8')
import os
if os.environ.has_key('HTTP_COOKIE'):
    conn.putheader('Cookie',os.environ['HTTP_COOKIE'])
conn.endheaders()
conn.send(body)
resp = conn.getresponse()

#print "Content-Type: text/html"
print 'Content-Disposition: ' + resp.getheader('Content-Disposition').replace('inline', 'attachment')
print
#print url
#print body
#if os.environ.has_key('HTTP_COOKIE'):
    #print os.environ['HTTP_COOKIE']
#print urlparse(url)
#print urlparse(url)[0]
#print urlparse(url)[1]
#print urlparse(url)[2]
#print urlparse(url)[4]
#print resp.getheader('Content-Disposition')
#print resp.status
print resp.read()
conn.close()
