using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ScrewTurn.Wiki.PluginFramework;
using ScrewTurn.Wiki.Web.Localization.Common;

namespace ScrewTurn.Wiki.Web.Models.Edit
{
    public class EditModel : WikiSABaseModel
    {
        // http://peterkeating.co.uk/using-ckeditor-with-razor-for-net-mvc3/

        public HtmlString AutoTemplateLabel { get; set; }
        public HtmlString EditNotice { get; set; }
        public string Keywords { get; set; }
        public string Description { get; set; }
        public string Comment { get; set; }

        //[Required(ErrorMessageResourceName = "RfvName_ErrorMessage", ErrorMessageResourceType = typeof(Localization.Common.Edit))]
        //[ValidName]
        //[UniqueName]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = "RfvTitle_ErrorMessage", ErrorMessageResourceType = typeof(Localization.Common.Edit))]
        public string PageTitle { get; set; }

        public bool MinorChange{ get; set; }
        public bool SaveAsDraft { get; set; }

        public string KeepAliveCurrentPage;
        public PageContent CurrentPage;

        //public string EditorContent;
        //public bool UseVisualEditor;

        public class ViewFlagsModel
        {
            public bool DisplayCaptcha;
            public bool AutoTemplateVisible;
            public bool NameEnabled;
            public bool ManualNameVisible;
            public bool PageNameVisible;
            public bool MinorChangeVisible;
            public bool MinorChangeEnabled;
            public bool SaveAsDraftVisible;
            public bool SaveAsDraftEnabled;
            public bool HasTemplates;
            public bool SaveEnabled;
            public bool SaveDangerous;
            public bool IsDraft;
            public bool IsCollision;
        }

        public ViewFlagsModel ViewFlags;

        public class PermissionsModel
        {
            public bool CanEdit { get; set; } = false;
            public bool CanEditWithApproval { get; set; } = false;
            public bool CanCreateNewPages { get; set; } = false;
            public bool CanCreateNewCategories { get; set; } = false;
            public bool CanManagePageCategories { get; set; } = false;
            public bool CanDownloadAttachments { get; set; } = false;
        }

        public PermissionsModel Permissions;

        public List<SelectListItem> Categories;
        public List<string> SelectedCategories { get; set; }

        public bool EditorInWysiwyg { get; set; }
        public string EditorWysiwyg { get; set; }
        public string EditorMarkup { get; set; }

        public string ResultHtml;
        public string ResultClass;

        public bool SaveAndContinue { get; set; }

        public string DraftInfoHtml;

        public string RefreshLinkHtml;

        public string ConcurrentEditingUsernameHtml;

        public string CancelUrl;
    }
}