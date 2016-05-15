﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using ScrewTurn.Wiki.Web.Code.Files;

namespace ScrewTurn.Wiki.Web
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            //routes.IgnoreRoute("favicon.ico");
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Installer",
                "Install/{action}",
                new { controller = "Install" }
                );

            //routes.MapRoute(
            //    "CreateMasterPassword",
            //    "Install/{action}/{password}",
            //    new { controller = "Install", action = "action", password = UrlParameter.Optional }
            //    );

            // http://www.prideparrot.com/blog/archive/2012/7/understanding_routing

            // Attachment files
            AttachmentRouteHandler.RegisterRoute(routes);

            //routes.MapRoute(
            //    "CreateMasterPassword",
            //    "user/CreateMasterPassword",
            //    new {controller = "User", action = "CreateMasterPassword"}
            //    );


            routes.MapRoute(
                "PageViewCode",
                "{id}/Code",
                defaults: new {controller = "Home", action = "PageViewCode" },
                constraints: new
                {
                    httpMethod = new HttpMethodConstraint("GET")
                }
                );

            routes.MapRoute(
                "PageDiscuss",
                "{id}/Discuss",
                defaults: new {controller = "Home", action = "PageDiscuss" },
                constraints: new
                {
                    httpMethod = new HttpMethodConstraint("GET")
                }
                );

            routes.MapRoute(
                "Page",
                "{id}",
                defaults: new {controller = "Home", action = "Page"},
                constraints: new
                {
                    //id = "[^?<>|:*&%'#\"\\/+].*", // []
                    httpMethod = new HttpMethodConstraint("GET")
                }
                );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
