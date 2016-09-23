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

    'test pasted heading id does not change when it is not a duplicate id': function() {
      var bot = this.editorBot,
        editor = bot.editor,
        heading,
        headings,
        resumeAfter = bender.tools.resumeAfter,
        headingWithId = '<h1 id="12345">This is a heading^</h1>',
        headingWithDifferentId = '<h1 id="678910">This is also a heading</h1>';

      bot.setHtmlWithSelection(headingWithId);

      editor.execCommand('autoid');

      editor.execCommand('paste', headingWithDifferentId);

      headings = editor.editable().find('h1');
      heading = headings.getItem(1);

      assert.areSame('678910', heading.getAttribute('id'));
    },

    'test pasted heading gets new id when it is a full copy of an existing heading': function() {
      var bot = this.editorBot,
        editor = bot.editor,
        heading,
        headings,
        resumeAfter = bender.tools.resumeAfter,
        headingWithId = '<h1 id="12345">This is a heading^</h1>',
        identicalHeading = '<h1 id="12345">This is a heading</h1>';

      bot.setHtmlWithSelection(headingWithId);

      // hit enter key to prevent pasting text in same heading element
      editor.editable().fire('keydown', new CKEDITOR.dom.event({
						keyCode: 13,
						ctrlKey: false,
						shiftKey: false
					}));

      resumeAfter(editor, 'allIdsComplete', function() {
        heading = editor.editable().findOne('h1');

        // verify original heading still has same id
        assert.areSame('12345', heading.getAttribute('id'));

        resumeAfter(editor, 'idAdded', function() {
          headings = editor.editable().find('h1');
          // get pasted heading (second heading on page)
          heading = headings.getItem(1);

          // verify pasted heading does not have the original id
          assert.areNotSame('12345', heading.getAttribute('id'));
        });

        editor.execCommand('paste', identicalHeading);

        // paste identical heading, wait for new id to be added to the new copy
        wait();
      });

      editor.execCommand('autoid');

      // wait for initial id assignment for all headings to complete
      wait();
    }

  });

})();
