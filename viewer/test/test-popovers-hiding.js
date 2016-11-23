/* global addHeadingAnchors:false */

var assert = chai.assert;

describe("popover timing", function () {
  before(function () {
    this.testArea = document.getElementById("test-popovers-timing");
    addHeadingAnchors.init("#test-popovers-timing", "#test-popovers-timing .popovers");
    this.firstClipboardAnchor = this.testArea.querySelector("a[data-clipboard-text]");
    this.unrelatedHeading = this.testArea.querySelector("h2");
  });

  it("displays the popover, which then fades when something else is clicked", function () {
    var firstAnchor = this.firstClipboardAnchor;
    var unrelatedHeading = this.unrelatedHeading;
    var popover;

    firstAnchor.click();

    // make sure nothing crazy happened like failed test cleanup
    assert.equal(1, this.testArea.querySelector(".popovers").children.length);

    popover = this.testArea.querySelector(".popovers .popover");

    // check the popover is still visible
    assert.isTrue(popover.classList.contains("in"), "popover is not hidden");

    // click something else

    unrelatedHeading.click();

    // check popover is hidden
    assert.isFalse(popover.classList.contains("in"), "popover is now hidden");

  });

  it("displays the popover and does not blur if the popover itself is clicked", function () {
    var firstAnchor = this.firstClipboardAnchor;
    var popover;

    firstAnchor.click();

    // make sure nothing crazy happened like failed test cleanup
    assert.equal(1, this.testArea.querySelector(".popovers").children.length);

    popover = this.testArea.querySelector(".popovers .popover");

    // check the popover is still visible
    assert.isTrue(popover.classList.contains("in"), "popover is not hidden");

    // click on the popover

    popover.click();

    // click on the anchor again

    firstAnchor.click();

    // check popover is hidden
    assert.isTrue(popover.classList.contains("in"), "popover is not hidden");

  });

});
