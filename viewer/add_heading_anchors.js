var addHeadingAnchors = {

  init: function (selector) {
    this.target = document.querySelector(selector);
    if (this.target) {
      this.addAnchorsToHeadings();
    }
  },

  addAnchorsToHeadings: function () {
    var selectorString = 'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]',
      headings = this.target.querySelectorAll(selectorString)

    headings.forEach(function (heading) {
      var anchor = this.createAnchor(heading.id);
      heading.appendChild(anchor);
    }.bind(this));
  },

  createAnchor: function (id) {
    var anchor = document.createElement('a'),
      icon = document.createElement('i'),
      attributes = {
        href: id,
        class: 'headerLink',
        title: 'Permalink to this headline'
      };

    icon.setAttribute('class', 'fa fa-share-square-o');

    anchor.appendChild(icon);

    for (var attr in attributes) {
      anchor.setAttribute(attr, attributes[attr]);
    }

    return anchor;
  }
};