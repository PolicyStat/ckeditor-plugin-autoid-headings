/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: clipboard,autoid */
/* bender-include: _helpers/pasting.js */
/* global assertPasteEvent */

'use strict';

(function() {
  bender.editor = {
    config: {
      enterMode: CKEDITOR.ENTER_P,
      autoid: {
        autostart: false
      }
    }
  };

  bender.test({

    tearDown: function() {
      this.editor.execCommand('autoid');
    },

    'test copied header will have a new id when a full copy is made': function() {
      var bot = this.editorBot,
        editor = bot.editor,
        heading,
        headings,
        resumeAfter = bender.tools.resumeAfter,
        headingWithId = '<h1 id="12345">This is a heading^</h1>';

      bot.setHtmlWithSelection(headingWithId);

      resumeAfter(editor, 'allIdsComplete', function() {
        heading = editor.editable().findOne('h1');

        // verify original heading still has same id
        assert.areSame('12345', heading.getAttribute('id'));
      });

      editor.execCommand('autoid');

      // wait for initial id assignment for all headings to complete
      wait();

      resumeAfter(editor, 'idAdded', function() {
        headings = editor.editable().find('h1');
        // get pasted heading (second heading on page)
        heading = headings.getItem(1);

        // verify pasted heading does not have the original id
        assert.areNotSame('12345', heading.getAttribute('id'));
      });

      editor.execCommand('paste', headingWithId);

      // paste identical heading, wait for new id to be added to the new copy
      wait();
    }

  });

})();
