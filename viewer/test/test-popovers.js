/* global addHeadingAnchors:false sinon:false */

var assert = chai.assert;

describe("popovers", function () {
  var NUM_HEADINGS = 6; // would be const, but you know.

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

    assert.equal(popoverChildCount, NUM_HEADINGS);
  });

  describe("mocked timer cases", function () {

    beforeEach(function () {
      this.clock = sinon.useFakeTimers();
    });

    afterEach(function () {
      this.clock.restore();
    });


    it("displays the popover, which then fades when the input is blurred", function () {

    });

  });

});
