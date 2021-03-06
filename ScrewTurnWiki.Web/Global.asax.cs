﻿using ScrewTurn.Wiki.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using ScrewTurn.Wiki.Web;
using ScrewTurn.Wiki.Web.Code;
using ScrewTurnWiki.Web;
using System.Threading;
using System.Globalization;
using System.IO;
using System.Text.RegularExpressions;
using ScrewTurn.Wiki.PluginFramework;

namespace ScrewTurn.Wiki.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        private const string StartupOK = "StartupOK";

        //public static bool IsInstallMode { get; private set; }

        protected void Application_Start()
        {
            //disable "X-AspNetMvc-Version" header name
            MvcHandler.DisableMvcResponseHeader = true;

            // Setup Resource Exchanger
            Exchanger.ResourceExchanger = new ResourceExchanger();
            var reader = new ConfigReaderWriter();
            var applicationSettings = reader.GetApplicationSettings();

            // Set ApplicationSettings
            ApplicationSettings.Instance = applicationSettings;

            if (applicationSettings.Installed)
                StartupTools.Startup();

            //IsInstallMode = !IsInstallCompleted(applicationSettings);

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            // Register Inversion of Control dependencies
            IoCConfig.RegisterDependencies(applicationSettings.Installed);

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            if (Application[StartupOK] == null && ApplicationSettings.Instance.Installed)
            {
                Application.Lock();
                if (Application[StartupOK] == null)
                {
                    StartupTools.RebuildAllPageLinks();

                    // All is OK, proceed with normal startup operations
                    Application[StartupOK] = "OK";
                }
                Application.UnLock();
            }

            return;

#if not_used
            string physicalPath = null;

            try
            {
                physicalPath = HttpContext.Current.Request.PhysicalPath;
            }
            catch (ArgumentException)
            {
                // Illegal characters in path
                HttpContext.Current.Response.Redirect("~/PageNotFound.aspx");// TODO: RedirectToAction
                return;
            }

            string currentWiki = Tools.DetectCurrentWiki();

            string url = HttpContext.Current.Request.Url.ToString();

            foreach (RequestHandlerRegistryEntry handler in Host.Instance.GetRequestHandlers(currentWiki).Values)
            {
                if (handler.Methods.Any(m => StringComparer.OrdinalIgnoreCase.Compare(m, HttpContext.Current.Request.HttpMethod) == 0))
                {
                    Match match = handler.UrlRegex.Match(url);
                    if (match.Success)
                    {
                        try
                        {
                            var plugin = Collectors.CollectorsBox.FormatterProviderCollector.GetProvider(handler.CallerType.FullName, currentWiki);
                            if (plugin != null && plugin.HandleRequest(HttpContext.Current, match))
                            {
                                HttpContext.Current.Response.End();
                                return;
                            }
                        }
                        catch (Exception ex)
                        {
                            if (ex is ThreadAbortException) continue;
                            if (ex.InnerException != null && ex.InnerException is ThreadAbortException) continue;

                            LogError(ex);
                        }
                    }
                }
            }

            // Extract the physical page name, e.g. MainPage, Edit or Category
            //string pageName = Path.GetFileNameWithoutExtension(physicalPath);
            // Exctract the extension, e.g. .ashx or .aspx
            string ext = (Path.GetExtension(HttpContext.Current.Request.PhysicalPath) + "").ToLowerInvariant();
            // Remove trailing dot, .ashx -> ashx
            if (ext.Length > 0) ext = ext.Substring(1);

            // IIS7+Integrated Pipeline handles all requests through the ASP.NET engine
            // All non-interesting files are not processed, such as GIF, CSS, etc.
            if (ext.Length == 0)
            {
                //if (!Request.PhysicalPath.ToLowerInvariant().Contains("createmasterpassword"))
                //{
                //    if (Application[MasterPasswordOk] == null)
                //    {
                //        Application.Lock();
                //        if (Application[MasterPasswordOk] == null)
                //        {
                //            // Setup Master Password
                //            if (!String.IsNullOrEmpty(GlobalSettings.GetMasterPassword()))
                //            {
                //                //Application[MasterPasswordOk] = "OK";
                //            }
                //        }
                //        Application.UnLock();
                //    }

                //    if (Application[MasterPasswordOk] == null)
                //    {
                //        ScrewTurn.Wiki.UrlTools.Redirect("~/CreateMasterPassword");
                //    }
                //}
                //else if (!string.IsNullOrEmpty(GlobalSettings.GetMasterPassword()))
                //{
                    ScrewTurn.Wiki.UrlTools.RedirectHome(currentWiki);
                //}
            }
            ScrewTurn.Wiki.UrlTools.RouteCurrentRequest();
#endif
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            // Retrieve last error and log it, redirecting to Error.aspx (avoiding infinite loops)
            Exception ex = Server.GetLastError();

            if (ex is ThreadAbortException) return;
            if (ex.InnerException != null && ex.InnerException is ThreadAbortException) return;

            HttpException httpEx = ex as HttpException;
            if (httpEx != null)
            {
                // Try to redirect an inexistent .aspx page to a probably existing .ashx page
                if (httpEx.GetHttpCode() == 404)
                {
                    string page = System.IO.Path.GetFileNameWithoutExtension(Request.PhysicalPath);
                    UrlTools.Redirect(page + GlobalSettings.PageExtension);
                    return;
                }
            }

            LogError(ex);
            string url = "";
            try
            {
                url = Tools.GetCurrentUrlFixed();
            }
            catch { }
            EmailTools.NotifyError(ex, url);

#warning don't hide original Error screen
            // if (!Request.PhysicalPath.ToLowerInvariant().Contains("error")) ScrewTurn.Wiki.UrlTools.Redirect("Error"); // TODO: RedirectToAction
        }

        protected void Application_End(object sender, EventArgs e)
        {
            // Try to cleanly shutdown the application and providers
            if (ApplicationSettings.Instance.Installed)
                StartupTools.Shutdown();
        }

        protected void Application_EndRequest(object sender, EventArgs e)
        {
            if (Collectors.CollectorsBoxUsed)
            {
                Collectors.CollectorsBox.Dispose();
                Collectors.CollectorsBox = null;
                Collectors.CollectorsBoxUsed = false;
            }
        }

        /// <summary>
        /// Logs an error.
        /// </summary>
        /// <param name="ex">The error.</param>
        private void LogError(Exception ex)
        {
            try
            {
                var message = ExceptionHelper.BuildLogError(ex, Tools.GetCurrentUrlFixed());
                Log.LogEntry(message, PluginFramework.EntryType.Error, Log.SystemUsername, null);
                //ScrewTurn.Wiki.Log.LogEntry(Tools.GetCurrentUrlFixed() + "\n" +
                //    ex.Source + " thrown " + ex.GetType().FullName + "\n" + ex.Message + "\n" + ex.StackTrace,
                //    ScrewTurn.Wiki.PluginFramework.EntryType.Error, ScrewTurn.Wiki.Log.SystemUsername, null);
            }
            catch { }
        }

        protected void Application_AcquireRequestState(object sender, EventArgs e)
        {
            if (ApplicationSettings.Instance.Installed && HttpContext.Current.Session != null)
            {
                // Try to automatically login the user through the cookie
                LoginTools.TryAutoLogin(Tools.DetectCurrentWiki());
            }
        }
    }
}
