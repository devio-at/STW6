/// <reference path="../typescript-ref/installerconstants.ts" />
var ScrewTurn;
(function (ScrewTurn) {
    var Wiki;
    (function (Wiki) {
        var Web;
        (function (Web) {
            var Common;
            (function (Common) {
                var History = (function () {
                    function History(wizard) {
                        this.wizard = wizard;
                    }
                    History.prototype.bindEvents = function () {
                        var _this = this;
                        $('#LinkToCompare').click(function (e) {
                            _this.hrefToCompare();
                        });
                    };
                    History.prototype.hrefToCompare = function () {
                        var rev1 = $('#lstRev1').val();
                        var rev2 = $('#lstRev2').val();
                        var path = '@Url.Content("~/ControllerName/ActionName")' + "?rev1=" + rev1 + "+&rev2=" + rev2;
                        $(this).attr("href", path);
                    };
                    return History;
                }());
                Common.History = History;
            })(Common = Web.Common || (Web.Common = {}));
        })(Web = Wiki.Web || (Wiki.Web = {}));
    })(Wiki = ScrewTurn.Wiki || (ScrewTurn.Wiki = {}));
})(ScrewTurn || (ScrewTurn = {}));
