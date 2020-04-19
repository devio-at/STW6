
var Editor = (function (editor) {

    var debug = true;

    var iframe;
    var inWYSIWYG = false;

    function IsInWYSIWYG() {
        if (inWYSIWYG) {
            inWYSIWYG = false;
            return true;
        }
        return false;
    }

    editor.iframe_onload = function () {
        inWYSIWYG = true;
        if (document.all) {
            iframe = window.frames[0];
            iframe.focus();
            var range = iframe.document.selection.createRange();
            range.pasteHTML(document.getElementById(VisualControl).value);
            range.collapse(false);
            range.select();
            iframe.document.designMode = 'On';
        } else {
            iframe = document.getElementById('iframe').contentWindow;
            iframe.document.designMode = 'On';
            iframe.document.execCommand('styleWithCSS', false, false);
            iframe.document.execCommand('backcolor', false, 'white');
            try { // This seems to throw an exception in Firefox
                iframe.focus();
                iframe.document.execCommand('inserthtml', false, document.getElementById(VisualControl).value);
            } catch (ex) {
                console.log(ex);
            }
        }
    }

    editor.execCmd = function (commandID, showUI, value) {
        iframe.focus();
        iframe.document.execCommand(commandID, showUI, value);
        return false;
    }

    editor.setHtml = function (html) {
        // https://codepen.io/mturek/pen/oZwBee
        var frameDoc = iframe.document;
        if (iframe.contentWindow)
            frameDoc = iframe.contentWindow.document;

        frameDoc.open();
        frameDoc.writeln(html);
        frameDoc.close();
        return false;
    };

    function getSelectedText() {
        var selected;
        if (document.all)
            selected = iframe.document.selection.createRange().htmlText;
        else {
            var range = iframe.document.defaultView.getSelection().getRangeAt(0);
            //.commonAncestorContainer.innerHTML;
            selected = range.commonAncestorContainer.wholeText.substring(range.startOffset, range.endOffset)
        }
        return selected;
    }

    function insertHTML(html) {
        if (document.all) {
            iframe.focus();
            var range = iframe.document.selection.createRange();
            range.pasteHTML(html);
            range.collapse(false);
            range.select();
            iframe.focus();
        } else {
            iframe.document.execCommand('inserthtml', false, html);
            iframe.focus();
        }
    }

    editor.wrapWithTagClass = function (tag, clsName) {
        insertHTML('<' + tag + ' class=' + clsName + '>' + getSelectedText() + '</' + tag + '>');
        return false;
    }

    editor.wrapWithTag = function(tag) {
        insertHTML('<' + tag + '>' + getSelectedText() + '</' + tag + '>');
        return false;
    }

    editor.insertBreak = function() {
        insertHTML('<h1 class="separator"> </h1>\n');
        return false;
    }

    editor.insertList = function(listTag) {
        insertHTML('<' + listTag + '><li>' + getSelectedText() + '</li></' + listTag + '>');
        return false;
    }

    editor.IncreaseHeight = function (elemName) {
        var elem = document.getElementById(elemName);
        var pos = AbsolutePosition(elem);
        elem.style["height"] = pos.height + 100 + "px";

        __CreateCookie("ScrewTurnWikiES", elem.style["height"], 365);

        return false;
    }
    editor.DecreaseHeight = function (elemName) {
        var elem = document.getElementById(elemName);
        var pos = AbsolutePosition(elem);
        if (pos.height > 100) elem.style["height"] = pos.height - 100 + "px";

        __CreateCookie("ScrewTurnWikiES", elem.style["height"], 365);

        return false;
    }

    function InitES() {
        var cookieValue = __ReadCookie("ScrewTurnWikiES");
        if (cookieValue) {
            var elem = document.getElementById(MarkupControl);
            if (elem) elem.style["height"] = cookieValue;
            elem = document.getElementById("iframe");
            if (elem) elem.style["height"] = cookieValue;
        }
    }

    function __FocusEditorWindow() {
        $("#<%= txtMarkup.ClientID %>").focus();
        $("#iframe").focus();
    }


    editor.OpenPopup = function (feature, mode) {
        var settings = "center=yes,resizable=yes,dialog,status=no,scrollbars=no,width=300,height=300";
        var w;
        //added for WYSIWYG
        // CurrentPage is escaped in code-behind
        if (mode == 'WYSIWYG')
            w = window.open(CurrentNamespace + "PopupWYSIWYG.aspx?Feature=" + feature + (CurrentPage != "" ? "&CurrentPage=" + CurrentPage : ""), "Popup", settings);
        //end
        else
            w = window.open(CurrentNamespace + "Popup.aspx?Feature=" + feature + (CurrentPage != "" ? "&CurrentPage=" + CurrentPage : ""), "Popup", settings);

        //modify link
        if (feature == 'ExternalLink') {
            if (document.all) {
                var parentSelection = '';
                if (iframe) parentSelection = iframe.document.selection.createRange().parentElement();
                if (parentSelection.tagName == 'A') {
                    w.attachEvent('onfocus', function () {
                        if (parentSelection.getAttribute('target') == '_blank')
                            w.document.getElementById('chkLinkNW').checked = true;
                        w.document.getElementById('txtLinkUrl').value = parentSelection.getAttribute('href');
                        if (parentSelection.getAttribute('href') != parentSelection.innerHTML)
                            w.document.getElementById('txtLinkTitle').value = parentSelection.innerHTML;
                    });
                }
            }
            else {
                var parentSelection = '';
                if (iframe) parentSelection = iframe.document.defaultView.getSelection().anchorNode.parentNode;
                if (parentSelection.tagName == 'A') {
                    w.addEventListener('load', function () {
                        if (parentSelection.getAttribute('target') == '_blank')
                            w.document.getElementById('chkLinkNW').checked = true;
                        w.document.getElementById('txtLinkUrl').value = parentSelection.getAttribute('href');
                        if (parentSelection.getAttribute('href') != parentSelection.innerHTML)
                            w.document.getElementById('txtLinkTitle').value = parentSelection.innerHTML;
                    }, false);
                }
            }
        }
        if (feature == 'PageLink') {
            if (document.all) {
                var parentSelection = '';
                if (iframe) iframe.document.selection.createRange().parentElement();
                if (parentSelection.tagName == 'A') {
                    w.attachEvent('onfocus', function () {
                        if (parentSelection.getAttribute('target') == '_blank')
                            w.document.getElementById('chkPageNW').checked = true;
                        w.document.getElementById('txtPageName').value = parentSelection.getAttribute('href');
                        if (parentSelection.getAttribute('href') != parentSelection.innerHTML)
                            w.document.getElementById('txtPageTitle').value = parentSelection.innerHTML;
                    });
                }
            }
            else {
                var parentSelection = '';
                if (iframe) iframe.document.defaultView.getSelection().anchorNode.parentNode;
                if (parentSelection.tagName == 'A') {
                    w.addEventListener('load', function () {
                        if (parentSelection.getAttribute('target') == '_blank')
                            w.document.getElementById('chkPageNW').checked = true;
                        w.document.getElementById('txtPageName').value = parentSelection.getAttribute('href');
                        if (parentSelection.getAttribute('href') != parentSelection.innerHTML)
                            w.document.getElementById('txtPageTitle').value = parentSelection.innerHTML;
                    }, false);
                }
            }
        }
        w.focus();
        return false;
    }

    function AbsolutePosition(obj) {
        var pos = null;
        if (obj != null) {
            pos = new Object();
            pos.top = obj.offsetTop;
            pos.left = obj.offsetLeft;
            pos.width = obj.offsetWidth;
            pos.height = obj.offsetHeight;
            obj = obj.offsetParent;
            while (obj != null) {
                pos.top += obj.offsetTop;
                pos.left += obj.offsetLeft;
                obj = obj.offsetParent;
            }
        }
        return (pos);
    }

    editor.ExtractAnchors = function () {
        var markup = new String(document.getElementById(MarkupControl).value);
        markup = markup.toLowerCase();
        var idx = 0;
        var size = 0;
        var result = "";
        while (idx != -1) {
            idx = markup.indexOf("[anchor|#", idx + size);
            size = 9;
            if (idx != -1) {
                var nidx = markup.indexOf("]", idx);
                var name = markup.substring(idx + size, nidx);
                size = 9 + name.length;
                //alert(name);
                result += name + "|";
            }
        }
        //alert(result);
        return result;
    }

    editor.ExtractAnchorsWYSIWYG = function() {
        var markup = new String(iframe.document.body.innerHTML);
        //alert(markup);
        markup = markup.toLowerCase();
        var idx = 0;
        var size = 0;
        var result = "";
        while (idx != -1) {
            idx = markup.indexOf("<a id=", idx + size);
            //alert(idx);
            size = 7;
            if (idx != -1) {
                var nidx = markup.indexOf(">", idx);
                //alert(nidx);
                //if(markup.indexOf("<", nidx) == (nidx + 2) || markup.indexOf("<", nidx) == (nidx)) {
                //var name = markup.substring(idx + size, nidx - 1);
                var name = markup.substring(idx + size - 1, nidx);
                if (name.indexOf('"') == 0) name = name.substring(1, name.length - 1);
                size = 7 + name.length;
                //alert(name);
                result += name + "|";
                //}
            }
        }
        //alert(result);
        return result;
    }

    // This fires a content copy every time the mouse is pressed
    document.body.onmousedown = CopyWYSIWYGContentToHiddenControl;

    function CopyWYSIWYGContentToHiddenControl() {
        if (inWYSIWYG) {
            //if(window.frames["iframe"] && window.frames["iframe"].document) {
            try {
                document.getElementById(VisualControl).value = iframe.document.body.innerHTML;
            }
            catch (exception) {
                //alert(exception);
            }
        }
        return true;
    }

    function ShowProgress() {
        document.getElementById("ProgressSpan").style["display"] = "";

        // added for WYSIWYG
        CopyWYSIWYGContentToHiddenControl();
        // end
    }
    function HideProgress() {
        document.getElementById("ProgressSpan").style["display"] = "none";

        InitES();
    }

    editor.ShowSnippetsMenuMarkup = function(event) {
        var pos = AbsolutePosition(document.getElementById("SnippetsMenuLinkMarkup"));
        var menu = document.getElementById("SnippetsMenuDiv");
        Display(menu, pos.top + pos.height, pos.left);
        return false;
    }

    editor.ShowSpecialTagsMenuMarkup = function (event) {
        var pos = AbsolutePosition(document.getElementById("SpecialTagsMenuLinkMarkup"));
        var menu = document.getElementById("SpecialTagsMenuDiv");
        Display(menu, pos.top + pos.height, pos.left);
        return false;
    }

    editor.ShowSymbolsMenuMarkup = function (event) {
        var pos = AbsolutePosition(document.getElementById("SymbolsMenuLinkMarkup"));
        var menu = document.getElementById("SymbolsMenuDiv");
        Display(menu, pos.top + pos.height, pos.left);
        return false;
    }

    function Display(obj, x, y) {
        if (obj.style["display"] == "none") {
            HideAllMenus();
            obj.style["position"] = "absolute";
            obj.style["top"] = x + "px";
            obj.style["left"] = y + "px";
            obj.style["display"] = "";
        }
        else HideAllMenus();
    }
    function Hide(obj) {
        obj.style["display"] = "none";
    }

    function HideAllMenus() {
        Hide(document.getElementById("SnippetsMenuDiv"));
        Hide(document.getElementById("SpecialTagsMenuDiv"));
        Hide(document.getElementById("SymbolsMenuDiv"));
        return false;
    }

    // Hide all menus when textbox is clicked
    if (document.getElementById(MarkupControl))
        document.getElementById(MarkupControl).onclick = HideAllMenus;

    editor.WrapSelectedMarkup = function (preTag, postTag) {
        HideAllMenus();
        var objTextArea = document.getElementById(MarkupControl);
        if (objTextArea) {
            if (document.selection && document.selection.createRange) {
                objTextArea.focus();
                var objSelectedTextRange = document.selection.createRange();
                var strSelectedText = objSelectedTextRange.text;
                if (strSelectedText.substring(0, preTag.length) == preTag && strSelectedText.substring(strSelectedText.length - postTag.length, strSelectedText.length) == postTag) {
                    objSelectedTextRange.text = strSelectedText.substring(preTag.length, strSelectedText.length - postTag.length);
                }
                else {
                    objSelectedTextRange.text = preTag + strSelectedText + postTag;
                }
            }
            else {
                objTextArea.focus();
                var scrollPos = objTextArea.scrollTop;
                var selStart = objTextArea.selectionStart;
                var strFirst = objTextArea.value.substring(0, objTextArea.selectionStart);
                var strSelected = objTextArea.value.substring(objTextArea.selectionStart, objTextArea.selectionEnd);
                var strSecond = objTextArea.value.substring(objTextArea.selectionEnd);
                if (strSelected.substring(0, preTag.length) == preTag && strSelected.substring(strSelected.length - postTag.length, strSelected.length) == postTag) {
                    // Remove tags
                    strSelected = strSelected.substring(preTag.length, strSelected.length - postTag.length);
                    objTextArea.value = strFirst + strSelected + strSecond;
                    objTextArea.selectionStart = selStart;
                    objTextArea.selectionEnd = selStart + strSelected.length;
                }
                else {
                    objTextArea.value = strFirst + preTag + strSelected + postTag + strSecond;
                    objTextArea.selectionStart = selStart;
                    objTextArea.selectionEnd = selStart + preTag.length + strSelected.length + postTag.length;
                }
                objTextArea.scrollTop = scrollPos;
            }
        }
        return false;
    }

    function WrapSelectedMarkupWYSIWYG(preTag, postTag) {
        insertHTML(preTag + getSelectedText() + postTag);
        return false;
    }

    editor.InsertMarkup = function (tag) {
        HideAllMenus();

        if (document.getElementById(VisualControl)) {
            return InsertMarkupWYSIWYG(tag);
        }

        var objTextArea = document.getElementById(MarkupControl);
        if (objTextArea) {
            if (document.selection && document.selection.createRange) {
                objTextArea.focus();
                var objSelectedTextRange = document.selection.createRange();
                var strSelectedText = objSelectedTextRange.text;
                objSelectedTextRange.text = tag + strSelectedText;
            }
            else {
                objTextArea.focus();
                var scrollPos = objTextArea.scrollTop;
                var selStart = objTextArea.selectionStart;
                var strFirst = objTextArea.value.substring(0, objTextArea.selectionStart);
                var strSecond = objTextArea.value.substring(objTextArea.selectionStart);
                objTextArea.value = strFirst + tag + strSecond;
                objTextArea.selectionStart = selStart + tag.length;
                objTextArea.selectionEnd = selStart + tag.length;
                objTextArea.scrollTop = scrollPos;
            }
        }
        return false;
    }

    function InsertMarkupWYSIWYG(tag) {
        insertHTML(tag);
        return false;
    }

    function HideToolbarButtons() {
        // This could be done easily with jQuery...
        var elem = document.getElementById("MarkupToolbarDiv");
        if (elem) elem.style["display"] = "none";

        elem = document.getElementById("VisualToolbarDiv");
        if (elem) elem.style["display"] = "none";
    }

    InitES();

    return editor;

})(Editor || {});
