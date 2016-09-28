'use strict';

(function () {
  var EVENT_NAMES = {
    ALL_IDS_COMPLETE: 'allIdsComplete',
    ID_ADDED: 'idAdded',
    ID_RETAINED: 'idRetained'
  };

  CKEDITOR.plugins.add('autoid', {
    init: function (editor) {
      var self = this;

      // This configures the Advanced Content Filter to allow all headings
      // to have id attributes
      editor.addFeature({
        allowedContent: 'h1 h2 h3 h4 h5 h6 *[id]'
      });

      if (editor && !editor.config.autoid) {
        editor.config.autoid = {};
      }
      self.settings = editor.config.autoid;
      if (!self.settings) {
        self.settings = {};
      }

      editor.addCommand('autoid', {
        exec: function (editor) {
          var autoId = editor.getCommand('autoid');
          autoId.toggleState();
          if (autoId.state === CKEDITOR.TRISTATE_ON)
            addAllIds();
        },
        editorFocus: true
      });

      editor.on("instanceReady", function () {
        if (self.settings.autostart !== false) {
          editor.getCommand('autoid').setState(CKEDITOR.TRISTATE_ON);
          addAllIds();
        }
      });

      editor.on('selectionChange', addIdIfNewHeading);

      editor.on('paste', checkPastedContentForHeadings);

      function addAllIds() {
        var headings = findAllHeadings(),
          i, heading;

        for (i = 0; i < headings.count(); i++) {
          heading = headings.getItem(i);
          if (heading.hasAttribute('id')) {
            continue;
          }
          addId(heading);
        }
        editor.fire(EVENT_NAMES.ALL_IDS_COMPLETE);
      }

      function findAllHeadings() {
        return editor.document.find('h1, h2, h3, h4, h5, h6');
      }

      function findHeadingIds(headings) {
        var ids = [],
          i, heading, id;

        for (i = 0; i < headings.count(); i++) {
          heading = headings.getItem(i);
          if (id = heading.getAttribute('id')) {
            ids.push(id)
          }
        }
        return ids;
      }

      function addId(heading) {
        var uuid = CKEDITOR.tools.getUniqueId();
        heading.setAttributes({ id: uuid });
        editor.fire(EVENT_NAMES.ID_ADDED);
      }

      function addIdIfNewHeading() {
        var element = editor.getSelection().getStartElement();
        if (isHeading(element) && !element.hasAttribute('id')) {
          addId(element);
        }
      }

      function isHeading(element) {
        return element.is('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
      }

      function checkPastedContentForHeadings(ev) {
        var pastedContent = ev.data.dataValue,
          pastedContentAsHtml = CKEDITOR.htmlParser.fragment.fromHtml(pastedContent),
          pastedElements = pastedContentAsHtml.children,
          writer = new CKEDITOR.htmlParser.basicWriter(),
          i, element, id, originalHeading;

        for (i = 0; i < pastedElements.length; i++) {
          element = pastedElements[i];
          if (element.type === CKEDITOR.NODE_ELEMENT) {
            id = element.attributes.id;
            originalHeading = checkForDuplicateId(id);
            if (originalHeading) {
              element = resolveDuplicateIds(element, originalHeading);
            }
          }
        }

        pastedContentAsHtml.writeHtml(writer);
        ev.data.dataValue = writer.getHtml();
      }

      function checkForDuplicateId(id) {
        var headingIds = findHeadingIds(findAllHeadings()),
          i, headingId, originalHeading;

        for (i = 0; i < headingIds.length; i++) {
          headingId = headingIds[i];
          if (id === headingId) {
            return originalHeading = editor.document.getById(headingId);
          }
        }
      }

      function resolveDuplicateIds(newHeading, originalHeading) {
        var newHeadingText = newHeading.children[0].value,
          originalHeadingText = originalHeading.getText();

        // if the original heading has no content (blank or just a line-feed
        // character is left when all the content is cut), the original heading
        // will be removed and the new heading will retain the id
        if ( originalHeadingText.length <= 1 && notWordCharacter(originalHeadingText.charAt(0))) {
          originalHeading.remove();
          editor.fire(EVENT_NAMES.ID_RETAINED);
          return newHeading;
        }

        // if the original heading text is not blank, the original should retain its
        // id and the new heading should get a new one.
        if (originalHeadingText) {
          newHeading.attributes.id = CKEDITOR.tools.getUniqueId();
          editor.fire(EVENT_NAMES.ID_ADDED);
          return newHeading;
        }

      }

      function notWordCharacter(character) {
        if (!character)
          return true;

        return !(/\w/.test(character));
      }

    }
  });
})();
