'use strict';

(function () {
  var editorHasFocus = false;
  var commandIsActive = false;
  var EVENT_NAMES = {
    ALL_IDS_COMPLETE: 'allIdsComplete',
    ID_ADDED: 'idAdded'
  };

  CKEDITOR.plugins.add('autoid', {
    init: function (editor) {
      var self = this;

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
          if (!commandIsActive) {
            start();
          } else {
            stop();
          }
        },
        editorFocus: true
      });

      editor.on("instanceReady", function () {
        if (self.settings.autostart !== false) {
          start()
        }
      });

      editor.on('selectionChange', addIdIfNewHeading);

      editor.on('paste', checkPastedContentForHeadings);

      function start() {
        editor.getCommand('autoid').setState(CKEDITOR.TRISTATE_ON);
        commandIsActive = true;

        addAllIds();
      }

      function stop() {
        editor.getCommand('autoid').setState(CKEDITOR.TRISTATE_OFF);
        commandIsActive = false;
      }

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
          i, element, id, originalHeading;

        for (i = 0; i < pastedElements.length; i++) {
          element = pastedElements[i];
          id = element.attributes.id;
          originalHeading = checkForDuplicateId(id);
          if (originalHeading) {
            element = resolveDuplicateIds(element, originalHeading);
          }
        }
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

        // if the text is identical (full copy), the original should retain its
        // id and the new heading should get a new one.
        if (newHeadingText === originalHeadingText) {
          newHeading.attributes.id = CKEDITOR.tools.getUniqueId();
          return newHeading;
        }

      }

    }
  });
})();
