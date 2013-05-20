/******************************************************************************
 * JBoss, a division of Red Hat                                               *
 * Copyright 2008, Red Hat Middleware, LLC, and individual                    *
 * contributors as indicated by the @authors tag. See the                     *
 * copyright.txt in the distribution for a full listing of                    *
 * individual contributors.                                                   *
 *                                                                            *
 * This is free software; you can redistribute it and/or modify it            *
 * under the terms of the GNU Lesser General Public License as                *
 * published by the Free Software Foundation; either version 2.1 of           *
 * the License, or (at your option) any later version.                        *
 *                                                                            *
 * This software is distributed in the hope that it will be useful,           *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of             *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU           *
 * Lesser General Public License for more details.                            *
 *                                                                            *
 * You should have received a copy of the GNU Lesser General Public           *
 * License along with this software; if not, write to the Free                *
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA         *
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.                   *
 ******************************************************************************/
package ru.gispro;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.portlet.*;
import org.w3c.dom.Element;

public class OceanViewerPortlet extends GenericPortlet
{

    private static String DIVNAMEPARAM = "Div Name" ;
    
    private String divName = null; 
    
    private String getDivName(RenderRequest request){
        if(divName==null){
            PortletPreferences pp = request.getPreferences();
            divName = pp.getValue(DIVNAMEPARAM, null);
            if(divName == null){
                divName = "ov-" + Math.round(Math.random()*10000);
                /*try {
                    pp.setValue(DIVNAMEPARAM, divName);
                    pp.store();
                } catch (Exception ex) {
                    Logger.getLogger(OceanViewerPortlet.class.getName()).log(Level.WARNING, 
                            "Can't save generated div name to preferences", ex);
                }*/
            }
        }
        return divName;
    }
            
    @Override
    protected void doEdit(RenderRequest request, RenderResponse response) throws PortletException, IOException {
        super.doEdit(request, response);
    }

    @Override
    protected void doHeaders(RenderRequest request, RenderResponse response) {
        //RequestContext rc = (RequestContext)request.get .getAttribute(RequestContext.REQUEST_PORTALENV);
        Element headElem = response.createElement("script");
        headElem.setAttribute("language", "javascript");
        headElem.setAttribute("type", "text/javascript");
        headElem.setTextContent("var OVROOT = '" + request.getContextPath() + "/';"
                + "var OVPORTLETDIV = '" + getDivName(request) + "';");
        response.addProperty(MimeResponse.MARKUP_HEAD_ELEMENT, headElem);
    }

    @Override
   public void doView(RenderRequest request, RenderResponse response) throws IOException
   {
       System.setProperty("app.realPathToOV", this.getPortletContext().getRealPath("/"));
       
      request.getPreferences().getValue("Div Name", getDivName(request));
      
      PrintWriter writer = response.getWriter();
      writer.write("<div id=\""+getDivName(request) +"\"></div>");
      writer.close();
   }
}

