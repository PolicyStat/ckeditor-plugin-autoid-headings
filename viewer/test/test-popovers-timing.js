/* global addHeadingAnchors:false sinon:false */

var assert = chai.assert;

describe("popover timing", function () {
  var INTERACTION_TIMEOUT = 1000; // actually, it's 500
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
    var input;
    var popover;

    firstAnchor.click();

    // make sure nothing crazy happened like failed test cleanup
    assert.equal(1, this.testArea.querySelector(".popovers").children.length);

    popover = this.testArea.querySelector(".popovers .popover");

    // click into the text area
    input = popover.querySelector("input");
    input.focus();

    // wait more than the timeout
    clock.tick(INTERACTION_TIMEOUT);

    // check the popover is still visible
    assert.isTrue(popover.classList.contains("in"), "popover is not hidden");

    // focus out of the popover
    input.blur();

    // wait for timeout
    clock.tick(INTERACTION_TIMEOUT);

    // check popover is hidden
    assert.isFalse(popover.classList.contains("in"), "popover is not hidden");

  });

});
