﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ScrewTurn.Wiki.Configuration;

namespace ScrewTurn.Wiki.Web.Controllers.Admin
{
    [RoutePrefix("Admin")]
    public class NamespacesController : BaseController
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PageController"/> class.
        /// </summary>
        /// <param name="settings"></param>
        public NamespacesController(ApplicationSettings settings) : base(settings)
        {
        }

        // GET: AdminHome
        [Route("Namespaces")]
        public ActionResult Index()
        {
            return new ContentResult();
        }
    }
}