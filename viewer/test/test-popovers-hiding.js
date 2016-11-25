/* global addHeadingAnchors:false fixture */

var assert = chai.assert;

describe("popover timing", function () {
  before(function () {
    fixture.setBase("fixtures");
  });

  beforeEach(function () {
    fixture.load("heading-fixtures.html");
    this.testcontainer = fixture.el.firstChild;
    addHeadingAnchors.init("#testcontainer", "#testcontainer .popovers");
    this.firstClipboardAnchor = this.testcontainer.querySelectorAll("a[data-clipboard-text]")[0];
    this.secondClipboardAnchor = this.testcontainer.querySelectorAll("a[data-clipboard-text]")[1];
    this.unrelatedHeading = this.testcontainer.querySelector("h2");
  });


  afterEach(function () {
    fixture.cleanup();
  });

  it("displays the popover, which then fades when something else is clicked", function () {
    var firstAnchor = this.firstClipboardAnchor;
    var unrelatedHeading = this.unrelatedHeading;
    var popover;

    firstAnchor.click();

    // make sure nothing crazy happened like failed test cleanup
    assert.equal(1, this.testcontainer.querySelector(".popovers").children.length);
    popover = this.testcontainer.querySelector(".popovers .popover");
    assert.isTrue(popover.classList.contains("in"), "popover is not hidden");

    // click something else
    unrelatedHeading.click();
    assert.isFalse(popover.classList.contains("in"), "popover is hidden");

  });

  it("displays the popover and does not blur if the popover itself is clicked", function () {
    var firstAnchor = this.firstClipboardAnchor;
    var popover;

    firstAnchor.click();

    // make sure nothing crazy happened like failed test cleanup
    assert.equal(1, this.testcontainer.querySelector(".popovers").children.length);
    popover = this.testcontainer.querySelector(".popovers .popover");
    assert.isTrue(popover.classList.contains("in"), "popover is not hidden");

    // click on the popover
    popover.click();

    // click on the anchor again
    firstAnchor.click();
    assert.isTrue(popover.classList.contains("in"), "popover is not hidden");
  });

  it("displays the popover and does not blur if a different popover is shown", function () {
    var firstAnchor = this.firstClipboardAnchor;
    var secondAnchor = this.secondClipboardAnchor;
    var popover;

    firstAnchor.click();

    // make sure nothing crazy happened like failed test cleanup
    assert.equal(1, this.testcontainer.querySelector(".popovers").children.length);
    popover = this.testcontainer.querySelector(".popovers .popover");

    assert.isTrue(popover.classList.contains("in"), "popover is not hidden");

    // click to trigger other popover
    secondAnchor.click();
    assert.isFalse(popover.classList.contains("in"), "popover is hidden");
  });

});
