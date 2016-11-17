/* global addHeadingAnchors:false */

var assert = chai.assert;

describe("popovers", function () {
  before(function () {
    this.testArea = document.getElementById("test-popovers");
    addHeadingAnchors.init("#test-popovers", "#test-popovers .popovers");
    this.clipboardAnchors = this.testArea.querySelectorAll("a[data-clipboard-text]");
  });

  it("creates the popover html when we 'click' each share button", function () {
    var popoverChildCount = 0;

    this.clipboardAnchors.forEach(function assertClickCreatesPopover(anchor) {
      anchor.click();
    });

    popoverChildCount = this.testArea.querySelector(".popovers").children.length;

    assert.equal(popoverChildCount, 6);
  });

});


