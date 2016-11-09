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


var toggleExpand = function(el) {
  el.classList.toggle('expand');
}
