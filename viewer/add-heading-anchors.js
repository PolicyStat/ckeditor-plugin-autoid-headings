/* eslint-env jquery */

/*eslint-disable no-unused-vars*/
var addHeadingAnchors = {
  /*eslint-enable no-unused-vars*/

  init: function (selector, popoverContainer) {
    this.popoverContainer = popoverContainer || "body";
    this.target = document.querySelector(selector);
    if (this.target) {
      this.addAnchorsToHeadings();
      this.registerClipboardHandlers();
      this.registerDismissPopoverHandler();
    }
  },

  addAnchorsToHeadings: function () {
    var selectorString = "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]";
    var headings = this.target.querySelectorAll(selectorString);

    Array.prototype.forEach.call(headings, function (heading) {
      var id = heading.id;
      var anchor = this.createAnchor(id);
      heading.appendChild(anchor);
      this.createPopover(anchor, id);
    }.bind(this));
  },

  createAnchor: function (id) {
    var anchor = document.createElement("a");
    var icon = document.createElement("i");
    var attributes = {
      href: "#" + id,
      class: "headerLink"
    };

    icon.setAttribute("class", "icon-share");

    anchor.appendChild(icon);

    for (var attr in attributes) {
      anchor.setAttribute(attr, attributes[attr]);
    }

    // there might be a browser quirk here
    anchor.setAttribute("data-clipboard-text", anchor.href);

    return anchor;
  },

  createPopover: function (anchor, headingId) {
    var popover;
    var inputId = "popover-" + headingId;
    popover = $(anchor).popover({
      container: this.popoverContainer,
      title: "Share a link to this section",
      content: function () {
        return "<input readonly id='" + inputId + "' value='" + anchor.href + "'>";
      },
      html: true,
      trigger: "manual" // this disables it for clicks
    });

    popover.on("shown", function () {
      // Hide all other popovers
      // `this` is the anchor that triggered the shown event.
      $("a.headerLink").not(this).popover("hide");
      // the contents of popover are lazy-created, so this unfortunately needs to go here.
      var input = document.getElementById(inputId);
      input.focus();
      input.select();
    });
  },

  registerClipboardHandlers: function () {
    var clipboardErrorHandler = function (e) {
      $(e.trigger).popover("show");
    };

    var ensureSuccessHandler = function (e) {
      var originalText = e.text;
      if (window.clipboardData) {
        // IE only
        var clipboardContent = window.clipboardData.getData("Text");
        if (originalText !== clipboardContent) {
          clipboardErrorHandler(e);
          return;
        }
      }
      $(e.trigger).tooltip("show");
    };

    if (!this.handler) {
      this.handler = new Clipboard("a.headerLink");
      this.handler.on("error", clipboardErrorHandler);
      this.handler.on("success", ensureSuccessHandler);
    }
  },

  registerDismissPopoverHandler: function () {
    $(this.target).click(function (e) {
      // if clicking a non-popover-ed element
      if ($("a.headerLink").has(e.target).length === 0) {
        $("a.headerLink").popover("hide");
      }
    });
  }
};
