var assert = chai.assert;

describe('addHeadingAnchors', function() {
    before(function() {
        addHeadingAnchors.init('#testarea');
        this.headingsWithAnId = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
        this.clipboardAnchors = document.querySelectorAll('a[data-clipboard-text]');
    });

    it('added the header links beside each heading', function() {
        this.headingsWithAnId.forEach(function assertHasCopyLink(heading) {
            var anchor = heading.lastChild,
                href,
                clipboardDataAttribute;

            // is element
            assert.equal(anchor.nodeType, 1);

            // is an anchor
            assert.equal(anchor.nodeName, 'A');

            // href is to id

            href = anchor.getAttribute('href');

            assert.endsWith(href, "#" + heading.getAttribute('id'));

            // data-clipboard-text is the full url

            clipboardDataAttribute = anchor.getAttribute('data-clipboard-text');

            // this is a crappy/quick way to assert for the full url being in the data attribute.
            assert.startsWith(clipboardDataAttribute, 'http://');
            assert.endsWith(clipboardDataAttribute, "#" + heading.getAttribute('id'));
        });
    });

    it('changes the address bar when clicking on links', function() {
        this.clipboardAnchors.forEach(function assertClipboardCopy(anchor) {
            var href = anchor.getAttribute('href');
            console.log(href);
            anchor.click();

            // assert the address bar changed

            assert(window.location.hash, href);
        });
    });

    it('copies to clipboard when clicking on links'); // stub, see https://w3c.github.io/editing/execCommand.html#dfn-the-copy-command
});