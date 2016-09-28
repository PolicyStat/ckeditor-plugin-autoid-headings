var addHeadingAnchors = {

  init: function (selector) {
    this.target = document.querySelector(selector);
    if (this.target) {
      this.addAnchorsToHeadings();
    }
  },

  addAnchorsToHeadings: function () {
    var headings = this.target.querySelectorAll('h1, h2, h3, h4, h5, h6'),
      id;

    headings.forEach(function (heading) {
      if (id = heading.id) {
        var anchor = this.createAnchor(id);
      }
    }.bind(this));
  },

  createAnchor: function (id) {
  }

};
