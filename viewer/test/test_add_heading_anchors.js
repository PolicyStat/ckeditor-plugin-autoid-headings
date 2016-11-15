var assert = chai.assert;

describe('addHeadingAnchors', function () {
    before(function () {
        addHeadingAnchors.init('#testarea');
    });

    describe('HTML modification', function () {
        before(function() {
            this.headingsWithAnId = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
        });

        it('added the header links beside each heading', function () {
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
    });

    describe('click handling', function () {
        before(function() {
            this.clipboardAnchors = document.querySelectorAll('a[data-clipboard-text]');
        })

        it('changes the address bar when clicking on links', function () {
            this.clipboardAnchors.forEach(function assertClipboardCopy(anchor) {
                var href = anchor.getAttribute('href');
                console.log(href);
                anchor.click();

                // assert the address bar changed

                assert(window.location.hash, href);
            });
        });

        it('copies to clipboard when clicking on links', function () {
            // we can't directly assert on the real clipboard thanks to https://w3c.github.io/editing/execCommand.html#dfn-the-copy-command

            this.clipboardAnchors.forEach(function (anchor) {

                // Register a one time event handler to check the event text
                // this isn't a very good test due to the limitations.
                // It basically checks that yes, clipboardjs was init and
                // catches clicks on all the anchors.
                addHeadingAnchors.handler.once('error', function (e) {
                    var url = e.text;

                    assert.equal(url, anchor.getAttribute('data-clipboard-text'));

                    e.clearSelection();
                });

                anchor.click();
            });

        });
    })
});



