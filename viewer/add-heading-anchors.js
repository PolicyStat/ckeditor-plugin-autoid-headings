/*eslint-disable no-unused-vars*/
var addHeadingAnchors = {
  /*eslint-enable no-unused-vars*/
  TIME_TO_FADE: 1000,

  init: function (selector) {
    this.target = document.querySelector(selector);
    if (this.target) {
      this.addAnchorsToHeadings();
      this.registerClipboardHandler();
    }
  },

  addAnchorsToHeadings: function () {
    var selectorString = "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]";
    var headings = this.target.querySelectorAll(selectorString);

    headings.forEach(function (heading) {
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
    var timeToFade = this.TIME_TO_FADE;
    popover = $(anchor).popover({
      container: "body",
      title: "Share a link to this section",
      content: function () {
        return "<input id='" + inputId + "' value='" + anchor.href + "'>";
      },
      html: true,
      trigger: "manual" // this disables it for clicks
    });

    popover.on("shown", function () {
      // the contents of popover are lazy-created, so this unfortunately needs to go here.
      var input = document.getElementById(inputId);
      var blurHandler = function () {
        setTimeout(function () {
          // if the input hasn't been re-selected
          if (document.activeElement !== input) {
            $(anchor).popover("hide");
            // TODO consider not removing it here, and instead, move it to a different once handler for shown.
            input.removeEventListener("blur", blurHandler);
          }
        }, timeToFade);
      };
      input.addEventListener("blur", blurHandler);
      input.focus();
      input.select();
    });
  },

  registerClipboardHandler: function () {
    var clipboardErrorHandler = function (e) {
      $(e.trigger).popover("show");
    };
    if (!this.handler) {
      this.handler = new Clipboard("a.headerLink");
      this.handler.on("error", clipboardErrorHandler);
    }
  }
};
