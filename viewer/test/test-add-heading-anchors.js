/* global addHeadingAnchors:false fixture*/

var assert = chai.assert;

describe("addHeadingAnchors", function () {
  before(function () {
    fixture.setBase("fixtures");
  });

  beforeEach(function () {
    fixture.load("heading-fixtures.html");
    this.testcontainer = fixture.el.firstChild;
    this.spy = chai.spy();
    addHeadingAnchors.init("#testcontainer", "#testcontainer .popovers", this.spy);
  });


  afterEach(function () {
    fixture.cleanup();
  });

  describe("HTML modification", function () {
    beforeEach(function () {
      this.headingsWithAnId = this.testcontainer.querySelectorAll(
        "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"
      );
      this.headingsWithoutAnId = this.testcontainer.querySelectorAll(
        "h1:not([id]), h2:not([id]), h3:not([id]), h4:not([id]), h5:not([id]), h6:not([id])"
      );
    });

    it("added the header links beside each heading", function () {
      var assertHasCopyLink = function (heading) {
        var anchor = heading.lastChild;
        var href;
        var clipboardDataAttribute;

        // is element
        assert.equal(anchor.nodeType, 1, "anchor should be the last child");

        // is an anchor
        assert.equal(anchor.nodeName, "A");

        // href is to id
        href = anchor.getAttribute("href");
        assert.endsWith(href, "#" + heading.getAttribute("id"));

        // data-clipboard-text is the full url
        clipboardDataAttribute = anchor.getAttribute("data-clipboard-text");

        // this is a crappy/quick way to assert for the full url being in the data attribute.
        assert.startsWith(clipboardDataAttribute, "http://");
        assert.endsWith(clipboardDataAttribute, "#" + heading.getAttribute("id"));
      };

      Array.prototype.forEach.call(this.headingsWithAnId, assertHasCopyLink);
    });

    it("did not add anchors inside non-id headings", function () {
      var assertNoAnchorAdded = function (heading) {
        // we can just assert there is no anchor, because the starting html doesn't have it.
        var anchor = heading.querySelector("a");

        assert.isNull(anchor);
      };

      Array.prototype.forEach.call(this.headingsWithoutAnId, assertNoAnchorAdded);
    });

    it("does not add more anchors if init is called more than once", function () {
      var count = this.testcontainer.querySelectorAll("a.headerLink").length;
      var newCount;
      addHeadingAnchors.init("#testcontainer", "#testcontainer .popovers");
      newCount = this.testcontainer.querySelectorAll("a.headerLink").length;
      assert.equal(newCount, count);
    });
  });

  describe("click handling", function () {
    beforeEach(function () {
      this.clipboardAnchors = this.testcontainer.querySelectorAll("a[data-clipboard-text]");
    });

    it("changes the address bar when clicking on links", function () {
      Array.prototype.forEach.call(this.clipboardAnchors, function assertClipboardCopy(anchor) {
        var href = anchor.getAttribute("href");
        anchor.click();

        // assert the address bar changed
        assert.equal(window.location.hash, href);
      });
    });

    it("does not scroll when clicking on links", function () {
      var clickAndAssertScrollUnchanged = function (anchor) {
        var oldScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var newScrollTop;

        anchor.click();

        newScrollTop = document.documentElement.scrollTop || document.body.scrollTop;

        assert.equal(
          newScrollTop,
          oldScrollTop,
          "scroll top should match the stored value from before clicking"
        );
      };

      Array.prototype.forEach.call(this.clipboardAnchors, clickAndAssertScrollUnchanged);
    });

    it("fires the clipboardjs error callback when clicking on links", function (done) {
      // a quick alternative to spying
      var callCount = 0;
      var expectedCallCount = 6;

      Array.prototype.forEach.call(this.clipboardAnchors, function (anchor) {

        // Register a one time event handler to check the event text
        // this isn't a very good test due to the limitations.
        // It basically checks that yes, clipboardjs was init and
        // catches clicks on all the anchors.

        // We have to use the error event,
        // because it will never succeed without an actual click.
        // see https://w3c.github.io/editing/execCommand.html#dfn-the-copy-command

        var clipboardErrorHandler = function (e) {
          var url = e.text;

          assert.equal(url, anchor.getAttribute("data-clipboard-text"));

          e.clearSelection();

          callCount += 1;

          // If we somehow don't add all 6 headings,
          // this test will fail because the callback is not fired
          if (callCount === expectedCallCount) {
            done();
          }
        };

        addHeadingAnchors.handler.once("error", clipboardErrorHandler);

        // click on all the anchors

        anchor.click();
      });

    });
  });
});


