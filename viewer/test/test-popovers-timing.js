/* global addHeadingAnchors:false sinon:false */

var assert = chai.assert;

describe("popover timing", function () {
  var NUM_HEADINGS = 6; // would be const, but you know.
  var clock;

  before(function () {
    this.testArea = document.getElementById("test-popovers-timing");
    addHeadingAnchors.init("#test-popovers-timing", "#test-popovers-timing .popovers");
    this.clipboardAnchors = this.testArea.querySelectorAll("a[data-clipboard-text]");
  });

  beforeEach(function () {
    clock = sinon.useFakeTimers();
  });

  afterEach(function () {
  //  clock.restore();
  });

  it("displays the popover, which then fades when the input is blurred", function () {
    var firstAnchor = this.clipboardAnchors[0];
    var popover;

    firstAnchor.click();

    // make sure nothing crazy happened like failed test cleanup
    assert.equal(1, this.testArea.querySelector(".popovers").children.length);

    popover = this.testArea.querySelector(".popovers").children[0];

    // click into the text area

    // wait more than the timeout

    // check the popover is still visible

    // focus out of the popover

    // wait for timeout

    // check popover is hidden

  });

});
