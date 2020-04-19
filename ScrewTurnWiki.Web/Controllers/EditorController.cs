using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ScrewTurn.Wiki.Configuration;
using ScrewTurn.Wiki.PluginFramework;

namespace ScrewTurn.Wiki.Web.Controllers
{
    public class EditorController : BaseController
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WikiController"/> class.
        /// </summary>
        /// <param name="settings"></param>
        public EditorController(ApplicationSettings settings) : base(settings)
        {
        }

        public ActionResult IframeEditor()
        {
            var includes = Tools.GetIncludes(Tools.DetectCurrentWiki(), Tools.DetectCurrentNamespace());
            return View("IframeEditor", (object)includes);
        }

        public class ReverseFormatModel
        {
            [AllowHtml]
            public string Html { get; set; }
        }

        [HttpPost]        
        public ActionResult ReverseFormat(ReverseFormatModel data)
        {
            var reverseFormatter = new ReverseFormatter();
            var markup = reverseFormatter.ReverseFormat(Tools.DetectCurrentWiki(), data.Html);
            return Json(markup);
        }

        [HttpPost]
        public ActionResult FormatHtml(string markup)
        {
            var currentWiki = Tools.DetectCurrentWiki();
            var preview = FormattingPipeline.FormatWithPhase3(currentWiki, FormattingPipeline.FormatWithPhase1And2(currentWiki, markup, false, FormattingContext.Unknown, null),
                    FormattingContext.Unknown, null);
            //lblWYSIWYG.Text = lblPreview.Text;
            string[] links = null;
            var wysiwyg = Formatter.Format(currentWiki, markup, false, FormattingContext.Unknown, null, out links, true);

            return Json(new { preview, wysiwyg });
        }
    }
}