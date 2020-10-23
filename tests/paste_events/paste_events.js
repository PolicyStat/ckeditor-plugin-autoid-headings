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

    'test it can paste a regular text node': function() {
      // verify we haven't broken regular copy / paste
      var bot = this.editorBot,
        editor = bot.editor,
        resumeAfter = bender.tools.resumeAfter,
        startHtml = '<p>^</p>',
        text = 'This is some text';

      bot.setHtmlWithSelection(startHtml);

      resumeAfter(editor, 'allIdsComplete', function() {
        editor.execCommand('paste', text);

        assert.areSame('<p>This is some text</p>', editor.getData());
      });

      editor.execCommand('autoid');

      wait();
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

        editor.execCommand('paste', headingWithDifferentId);

        headings = editor.editable().find('h1');

        // get pasted heading (second heading on page)
        heading = headings.getItem(1);

        // verify pasted heading still has the original id
        assert.areSame('678910', heading.getAttribute('id'));
      });

      editor.execCommand('autoid');

      // wait for initial id assignment for all headings to complete
      wait();
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
    },

    'test full cut and paste removes blank heading and original id retained': function() {
      var bot = this.editorBot,
        editor = bot.editor,
        heading,
        headings,
        resumeAfter = bender.tools.resumeAfter;

      // when the full content of a heading is cut, the element tag is left
      var startHtml = '<h1 id="12345"></h1>',
        secondHeading = '<h1 id="12345">Pasted Heading</h1>';

      bot.setHtmlWithSelection(startHtml);

      editor.editable().fire('keydown', new CKEDITOR.dom.event({
        keyCode: 13,
        ctrlKey: false,
        shiftKey: false
      }));

      resumeAfter(editor, 'allIdsComplete', function() {

        resumeAfter(editor, 'idRetained', function() {
          headings = editor.editable().find('h1');

          heading = headings.getItem(0);

          // verify only one heading on page (original was deleted)
          assert.areSame(headings.count(), 1);
          // verify the pasted heading retains original id and pasted content
          assert.areSame('12345', heading.getAttribute('id'));
          assert.areSame('Pasted Heading', heading.getText());
        });

        editor.execCommand('paste', secondHeading);

        wait();
      });

      editor.execCommand('autoid');

      wait();
    },

    'test it gives partially copied headings a new id': function() {
      // when a partial heading is copied and either a closing or opening
      // heading tag is grabbed, clipboard automatically includes the closing
      // tag, and adds the id if it was not already part of the selection.
      var bot = this.editorBot,
        editor = bot.editor,
        heading,
        headings,
        resumeAfter = bender.tools.resumeAfter,
        startHtml = '<h1 id="12345">Start Heading^</h1>',
        partialHeading = '<h1 id="12345">Start';

      bot.setHtmlWithSelection(startHtml);

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

        editor.execCommand('paste', partialHeading);

        wait();
      });

      editor.execCommand('autoid');

      // wait for initial id assignment for all headings to complete
      wait();
    },

    'test nested duplicated ids got resolved': function() {
      var bot = this.editorBot,
        editor = bot.editor,
        heading,
        headings,
        resumeAfter = bender.tools.resumeAfter,
        headingWithId = '<h1 id="12345">This is a heading</h1>',
        headingWithTheSameId = '<div><h1 id="12345">This is nested heading with the same id</h1></div>';

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

        editor.execCommand('paste', headingWithTheSameId);

        headings = editor.editable().find('h1');

        // verify pasted heading id is regenerated
        assert.areNotSame('12345', headings.getItem(0).getAttribute('id'));

        // verify original heading has the same id
        assert.areSame('12345', headings.getItem(1).getAttribute('id'));
      });

      editor.execCommand('autoid');

      // wait for initial id assignment for all headings to complete
      wait();
    },

    'test nested unique id is not regenerated': function() {
      var bot = this.editorBot,
        editor = bot.editor,
        heading,
        headings,
        resumeAfter = bender.tools.resumeAfter,
        headingWithId = '<h1 id="12345">This is a heading</h1>',
        headingWithTheDifferentId = '<div><h1 id="67890">this is a nested heading with a different id</h1></div>';

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

        editor.execCommand('paste', headingWithTheDifferentId);

        headings = editor.editable().find('h1');

        // verify pasted heading id is not regenerated
        assert.areSame('67890', headings.getItem(0).getAttribute('id'));

        // verify original heading has the same id
        assert.areSame('12345', headings.getItem(1).getAttribute('id'));
      });

      editor.execCommand('autoid');

      // wait for initial id assignment for all headings to complete
      wait();
    },

  });

})();
