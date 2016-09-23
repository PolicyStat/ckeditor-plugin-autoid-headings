'use strict';

(function () {
  var EVENT_NAMES = {
    ALL_IDS_COMPLETE: 'allIdsComplete',
    ID_ADDED: 'idAdded'
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

    }
  });
})();
