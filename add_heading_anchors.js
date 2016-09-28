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
        heading.appendChild(anchor);
      }
    }.bind(this));
  },

  createAnchor: function (id) {
    var anchor = document.createElement('a'),
      anchorText = document.createTextNode('¶'),
      attributes = {
        href: id,
        class: 'headerLink',
        title: 'Permalink to this headline'
      };

    anchor.appendChild(anchorText);

    for (var attr in attributes) {
      anchor.setAttribute(attr, attributes[attr]);
    }

    return anchor;
  }

};
