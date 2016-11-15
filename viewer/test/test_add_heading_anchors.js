var assert = chai.assert;

describe('addHeadingAnchors', function() {
    addHeadingAnchors.init('#testarea');

    it('added the header links beside each heading', function() {
        var headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');

        headings.forEach(function assertHasCopyLink(heading) {
            var anchor = heading.lastChild;
            var href;

            // is element
            assert.equal(anchor.nodeType, 1);

            // is an anchor
            assert.equal(anchor.nodeName, 'A');

            // href is to id

            href = anchor.getAttribute('href');

            assert.endsWith(href, "#" + heading.getAttribute('id'));

        })

    });
});