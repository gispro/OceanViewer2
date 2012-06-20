#!/usr/bin/env python
import cgitb; cgitb.enable()
import cgi
form = cgi.FieldStorage()
url = form.getfirst('url', 'empty')
body = form.getfirst('body', 'empty')

from urlparse import urlparse
parsed_url = urlparse(url)

import httplib
conn = httplib.HTTPConnection(parsed_url[1])
conn.connect()
request = conn.putrequest('POST', parsed_url[2] + '?' + parsed_url[4])
conn.putheader('Content-Length',len(body))
conn.putheader('Content-Type','application/xml; charset=UTF-8')
import os
if os.environ.has_key('HTTP_COOKIE'):
    conn.putheader('Cookie',os.environ['HTTP_COOKIE'])
conn.endheaders()
conn.send(body)
resp = conn.getresponse()

print 'Content-Disposition: ' + resp.getheader('Content-Disposition').replace('inline', 'attachment')
print 'Set-Cookie: filesended=1; path=/;'
print
print resp.read()
conn.close()
