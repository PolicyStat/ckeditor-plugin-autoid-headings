var addHeadingAnchors = {

  init: function (selector) {
    this.target = document.querySelector(selector);
    if (this.target) {
      this.addAnchorsToHeadings();
    }
  }

};
