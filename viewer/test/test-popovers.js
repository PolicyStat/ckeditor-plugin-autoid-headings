/* global addHeadingAnchors:false fixture */

var assert = chai.assert;

describe("popovers", function () {
  var NUM_HEADINGS = 6; // would be const, but you know.

  before(function () {
    fixture.setBase("fixtures");
  });

  beforeEach(function () {
    fixture.load("heading-fixtures.html");
    this.testcontainer = fixture.el.firstChild;
    addHeadingAnchors.init("#testcontainer", "#testcontainer .popovers");
    this.clipboardAnchors = this.testcontainer.querySelectorAll("a[data-clipboard-text]");
  });

  afterEach(function () {
    fixture.cleanup();
  });

  it("creates the popover html when we 'click' each share button", function () {
    var popoverChildCount = 0;

    Array.prototype.forEach.call(this.clipboardAnchors, function assertClickCreatesPopover(anchor) {
      anchor.click();
    });

    popoverChildCount = this.testcontainer.querySelector(".popovers").children.length;

    assert.equal(popoverChildCount, NUM_HEADINGS);
  });

});
